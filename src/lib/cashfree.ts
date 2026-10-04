import crypto from "crypto";
import { prisma } from "./prisma";
import { decryptAccessKey } from "./encryption";
import { sendAccessEmail } from "./email";

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID || "";
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET || "";
const CASHFREE_ENV = process.env.CASHFREE_ENV || "sandbox";

const BASE_URL =
  CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export interface CreateOrderParams {
  orderId: string;
  orderAmount: number;
  orderCurrency?: string;
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  returnUrl: string;
  notifyUrl?: string;
}

export interface CashfreeOrderResponse {
  cfOrderId?: string;
  orderId: string;
  paymentSessionId?: string;
  orderStatus: string;
  isSimulated?: boolean;
}

/**
 * Creates an order on Cashfree Payment Gateway
 */
export async function createCashfreePGOrder(
  params: CreateOrderParams
): Promise<CashfreeOrderResponse> {
  const isConfigured = Boolean(
    CASHFREE_CLIENT_ID &&
    CASHFREE_CLIENT_SECRET &&
    !CASHFREE_CLIENT_ID.includes("placeholder")
  );

  // If live/sandbox credentials are provided, call Cashfree API
  if (isConfigured) {
    try {
      const cleanPhone = params.customerDetails.customerPhone
        .replace(/\D/g, "")
        .slice(-10);

      const payload = {
        order_id: params.orderId,
        order_amount: params.orderAmount,
        order_currency: params.orderCurrency || "INR",
        customer_details: {
          customer_id: params.customerDetails.customerId,
          customer_name: params.customerDetails.customerName,
          customer_email: params.customerDetails.customerEmail,
          customer_phone: cleanPhone || "9876543210",
        },
        order_meta: {
          return_url: params.returnUrl,
          notify_url: params.notifyUrl,
        },
      };

      const response = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "x-client-id": CASHFREE_CLIENT_ID,
          "x-client-secret": CASHFREE_CLIENT_SECRET,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Cashfree API Order Creation failed:", data);
        throw new Error(data.message || "Failed to create Cashfree order");
      }

      return {
        cfOrderId: String(data.cf_order_id),
        orderId: data.order_id,
        paymentSessionId: data.payment_session_id,
        orderStatus: data.order_status,
        isSimulated: false,
      };
    } catch (err) {
      console.warn("Cashfree API call error, falling back to simulated sandbox:", err);
    }
  }

  // Fallback sandbox simulation when merchant credentials are not yet supplied
  const simulatedCfOrderId = `cf_sandbox_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const simulatedSessionId = `session_sandbox_${Buffer.from(params.orderId).toString("hex")}`;

  return {
    cfOrderId: simulatedCfOrderId,
    orderId: params.orderId,
    paymentSessionId: simulatedSessionId,
    orderStatus: "ACTIVE",
    isSimulated: true,
  };
}

/**
 * Verifies Cashfree webhook signature using HMAC-SHA256
 */
export function verifyCashfreeSignature(
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  if (!CASHFREE_CLIENT_SECRET) return false;
  try {
    const dataToSign = `${timestamp}${rawBody}`;
    const generatedSignature = crypto
      .createHmac("sha256", CASHFREE_CLIENT_SECRET)
      .update(dataToSign)
      .digest("base64");

    return generatedSignature === signature;
  } catch (err) {
    console.error("Webhook signature verification error:", err);
    return false;
  }
}

/**
 * Fetches order and payments from Cashfree server-side to verify authenticity
 */
export async function fetchCashfreeOrderStatus(orderId: string) {
  const isConfigured = Boolean(CASHFREE_CLIENT_ID && CASHFREE_CLIENT_SECRET);

  if (!isConfigured) {
    if (CASHFREE_ENV === "production") {
      throw new Error(
        "Production mode requires Cashfree API credentials. Payment verification is unavailable."
      );
    }
    // Sandbox mode: return simulated PAID status for testing
    console.warn(
      `[Sandbox] No Cashfree credentials configured — returning simulated PAID status for order ${orderId}`
    );
    return { order_status: "PAID", order_id: orderId, isSimulated: true };
  }

  try {
    const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: "GET",
      headers: {
        "x-client-id": CASHFREE_CLIENT_ID,
        "x-client-secret": CASHFREE_CLIENT_SECRET,
        "x-api-version": "2023-08-01",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Failed to query Cashfree order:", err);
    return null;
  }
}

/**
 * Idempotently marks an order as PAID, allocates an active Access Key, and executes delivery
 */
export async function processPaymentSuccess({
  orderId,
  cashfreePaymentId,
  paymentMethod = "Cashfree UPI/Card",
  rawDetails = {},
}: {
  orderId: string;
  cashfreePaymentId: string;
  paymentMethod?: string;
  rawDetails?: any;
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      plan: true,
      user: true,
      subscriptions: true,
      assignments: {
        include: {
          access_key: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  // Idempotency check: if order is already marked as PAID and has active assignment or subscription, return early
  if (order.status === "PAID" && (order.assignments.length > 0 || order.subscriptions.length > 0)) {
    return {
      success: true,
      alreadyProcessed: true,
      order,
      assignment: order.assignments[0] || null,
      subscription: order.subscriptions[0] || null,
    };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days server-calculated
  const providerReference = `ACCESS-${order.plan.multiplier}X-${Date.now().toString().slice(-6)}`;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Find candidate active access keys for the purchased plan inside transaction
    const candidateKeys = await tx.accessKey.findMany({
      where: {
        plan_id: order.plan_id,
        status: { in: ["ACTIVE", "AVAILABLE"] },
      },
      orderBy: {
        created_at: "asc",
      },
    });

    let assignedKeyRecord: any = null;
    let assignment: any = null;

    // Atomically reserve a slot on the first key with available capacity
    for (const key of candidateKeys) {
      // Conditional atomic update ensuring current_customers < max_customers
      const rowsUpdated = await tx.$executeRaw`
        UPDATE access_keys 
        SET current_customers = current_customers + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${key.id} 
          AND current_customers < max_customers 
          AND status IN ('ACTIVE', 'AVAILABLE')
      `;

      if (rowsUpdated > 0) {
        // Slot secured atomically! Check if key reached full capacity
        const refreshedKey = await tx.accessKey.findUnique({ where: { id: key.id } });
        if (refreshedKey && refreshedKey.current_customers >= refreshedKey.max_customers) {
          await tx.accessKey.update({
            where: { id: key.id },
            data: { status: "FULL" },
          });
          refreshedKey.status = "FULL";
        }
        assignedKeyRecord = refreshedKey;
        break;
      }
    }

    // 2. Create AccessAssignment if a key was secured
    if (assignedKeyRecord) {
      assignment = await tx.accessAssignment.create({
        data: {
          user_id: order.user_id,
          order_id: orderId,
          access_key_id: assignedKeyRecord.id,
          plan_id: order.plan_id,
          status: "ACTIVE",
          assigned_at: now,
          expires_at: expiresAt,
          delivered_at: null, // manual fulfillment is pending
        },
      });
    }

    // 3. Determine recipient
    const isEmail = order.delivery_method === "EMAIL";
    const recipient =
      order.delivery_recipient || (isEmail ? order.user.email : order.user.phone);

    // 4. Update Order: payment_status = SUCCESS/PAID, delivery_status = PENDING (both Email & WhatsApp are manual!)
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        payment_status: "SUCCESS",
        access_key_id: assignedKeyRecord ? assignedKeyRecord.id : null,
        delivery_status: "PENDING", // Strictly PENDING until admin manually delivers
        delivery_recipient: recipient,
        delivered_at: null,
      },
    });

    // 5. Create Payment record
    const payment = await tx.payment.create({
      data: {
        order_id: orderId,
        cashfree_payment_id: cashfreePaymentId,
        status: "SUCCESS",
        amount: order.amount,
        method: paymentMethod,
        raw_reference: JSON.stringify(rawDetails),
      },
    });

    // 6. Create Subscription record (managed, without exposing upstream details)
    const subscription = await tx.subscription.create({
      data: {
        user_id: order.user_id,
        order_id: orderId,
        plan_id: order.plan_id,
        provider: "managed",
        provider_reference: providerReference,
        starts_at: now,
        expires_at: expiresAt,
        status: "ACTIVE",
        fulfilment_status: "PENDING_DELIVERY",
        activation_details: JSON.stringify({
          planName: order.plan.name,
          deliveryMethod: order.delivery_method,
          recipient,
          keyAssigned: Boolean(assignedKeyRecord),
          activatedAt: now.toISOString(),
        }),
      },
    });

    // 7. Audit Log
    await tx.auditLog.create({
      data: {
        user_id: order.user_id,
        action: assignedKeyRecord
          ? "PAYMENT_AND_ACCESS_ALLOCATED"
          : "PAYMENT_RECEIVED_KEY_CAPACITY_PENDING",
        entity_type: "ORDER",
        entity_id: orderId,
        metadata: JSON.stringify({
          amount: order.amount,
          plan: order.plan.name,
          paymentId: cashfreePaymentId,
          deliveryMethod: order.delivery_method,
          keyId: assignedKeyRecord ? assignedKeyRecord.id : null,
        }),
      },
    });

    return { updatedOrder, payment, subscription, assignment, assignedKeyRecord };
  });

  // DO NOT send automated email or automated WhatsApp!
  // Both Email and WhatsApp are manual fulfilment by admin.

  return { success: true, alreadyProcessed: false, ...result };
}
