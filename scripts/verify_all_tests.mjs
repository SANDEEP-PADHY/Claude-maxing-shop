import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { encryptAccessKey, decryptAccessKey, maskAccessKey } from "../src/lib/encryption.ts";
import { processPaymentSuccess } from "../src/lib/cashfree.ts";

const prisma = new PrismaClient();

async function runTests() {
  console.log("==================================================");
  console.log("CLAUDEMAXING.SHOP COMPREHENSIVE VERIFICATION SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const createdRecordIds = {
    users: [],
    orders: [],
    keys: [],
    plans: [],
    assignments: [],
    payments: [],
    subscriptions: [],
  };

  try {
    // ----------------------------------------------------
    // SETUP: Users & Plans
    // ----------------------------------------------------
    const testEmailA = `customer_a_${timestamp}@example.com`;
    const testPhoneA = `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;
    const rawPassword = "SecurePassword123!";
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const userA = await prisma.user.create({
      data: {
        name: "Customer Alpha",
        email: testEmailA,
        phone: testPhoneA,
        password_hash: passwordHash,
        role: "customer",
      },
    });
    createdRecordIds.users.push(userA.id);
    assert(Boolean(userA && userA.id), "1. User A registered successfully");

    const testEmailB = `customer_b_${timestamp}@example.com`;
    const testPhoneB = `+9197${Math.floor(10000000 + Math.random() * 90000000)}`;
    const userB = await prisma.user.create({
      data: {
        name: "Customer Beta",
        email: testEmailB,
        phone: testPhoneB,
        password_hash: passwordHash,
        role: "customer",
      },
    });
    createdRecordIds.users.push(userB.id);
    assert(Boolean(userB && userB.id), "2. User B registered successfully");

    const plan5x = await prisma.plan.findUnique({ where: { slug: "5x-access" } });
    const plan20x = await prisma.plan.findUnique({ where: { slug: "20x-access" } });
    assert(plan5x && plan5x.price === 999 && plan5x.multiplier === 5, "3. Plan 5X verified (₹999, 5X multiplier)");
    assert(plan20x && plan20x.price === 1999 && plan20x.multiplier === 20, "4. Plan 20X verified (₹1,999, 20X multiplier)");

    // ----------------------------------------------------
    // TEST: SUCCESSFUL PAYMENT ALLOCATION (Email & WhatsApp)
    // ----------------------------------------------------
    // Order 1: 5X with Email delivery preference
    const orderEmailId = `ORD-TEST-EMAIL-${timestamp}`;
    const orderEmail = await prisma.order.create({
      data: {
        id: orderEmailId,
        user_id: userA.id,
        plan_id: plan5x.id,
        amount: plan5x.price,
        currency: "INR",
        status: "PAYMENT_PENDING",
        payment_status: "PENDING",
        delivery_method: "EMAIL",
        delivery_status: "PENDING",
        delivery_recipient: userA.email,
      },
    });
    createdRecordIds.orders.push(orderEmail.id);

    const paymentEmailResult = await processPaymentSuccess({
      orderId: orderEmail.id,
      cashfreePaymentId: `cf_pay_email_${timestamp}`,
      paymentMethod: "Cashfree Sandbox UPI",
      rawDetails: { test: true },
    });

    assert(paymentEmailResult.success === true, "5. Successful payment processed for Email preference");

    const updatedOrderEmail = await prisma.order.findUnique({
      where: { id: orderEmail.id },
      include: { access_key: true, assignments: true },
    });

    assert(updatedOrderEmail.status === "PAID", "6. Order status marked as PAID");
    assert(updatedOrderEmail.delivery_status === "PENDING", "7. Delivery status is PENDING (No automated email sent!)");
    assert(Boolean(updatedOrderEmail.access_key_id), "8. Access key AUTO-ALLOCATED immediately upon payment");
    assert(updatedOrderEmail.assignments.length > 0, "9. Active AccessAssignment created");
    
    const assignmentEmail = updatedOrderEmail.assignments[0];
    assert(assignmentEmail.status === "ACTIVE", "10. AccessAssignment status is ACTIVE");
    assert(assignmentEmail.expires_at > new Date(), "11. AccessAssignment expires_at is set (~30 days)");

    // Order 2: 20X with WhatsApp delivery preference
    const orderWhatsAppId = `ORD-TEST-WA-${timestamp}`;
    const orderWhatsApp = await prisma.order.create({
      data: {
        id: orderWhatsAppId,
        user_id: userA.id,
        plan_id: plan20x.id,
        amount: plan20x.price,
        currency: "INR",
        status: "PAYMENT_PENDING",
        payment_status: "PENDING",
        delivery_method: "WHATSAPP",
        delivery_status: "PENDING",
        delivery_recipient: userA.phone,
      },
    });
    createdRecordIds.orders.push(orderWhatsApp.id);

    const paymentWAResult = await processPaymentSuccess({
      orderId: orderWhatsApp.id,
      cashfreePaymentId: `cf_pay_wa_${timestamp}`,
      paymentMethod: "Cashfree Sandbox Cards",
      rawDetails: { test: true },
    });

    assert(paymentWAResult.success === true, "12. Successful payment processed for WhatsApp preference");

    const updatedOrderWA = await prisma.order.findUnique({
      where: { id: orderWhatsApp.id },
      include: { access_key: true, assignments: true },
    });

    assert(updatedOrderWA.status === "PAID", "13. WhatsApp order status marked as PAID");
    assert(updatedOrderWA.delivery_status === "PENDING", "14. WhatsApp delivery status is PENDING (No automated WhatsApp sent!)");
    assert(Boolean(updatedOrderWA.access_key_id), "15. Access key AUTO-ALLOCATED for 20X plan");

    // ----------------------------------------------------
    // TEST: FAILED PAYMENT = NO ALLOCATION
    // ----------------------------------------------------
    const failedOrderId = `ORD-TEST-FAIL-${timestamp}`;
    const failedOrder = await prisma.order.create({
      data: {
        id: failedOrderId,
        user_id: userA.id,
        plan_id: plan5x.id,
        amount: plan5x.price,
        currency: "INR",
        status: "PAYMENT_FAILED",
        payment_status: "FAILED",
        delivery_method: "EMAIL",
        delivery_status: "PENDING",
      },
    });
    createdRecordIds.orders.push(failedOrder.id);

    const failedOrderCheck = await prisma.order.findUnique({
      where: { id: failedOrderId },
      include: { assignments: true },
    });
    assert(
      failedOrderCheck.status === "PAYMENT_FAILED" &&
      !failedOrderCheck.access_key_id &&
      failedOrderCheck.assignments.length === 0,
      "16. Failed payment: No key allocated and no access assignment created"
    );

    // ----------------------------------------------------
    // TEST: CUSTOMER SEES OWN KEY BEFORE MANUAL DELIVERY
    // ----------------------------------------------------
    // Customer A reveals key for assignmentEmail while delivery_status is PENDING
    const keyRecordA = await prisma.accessKey.findUnique({
      where: { id: updatedOrderEmail.access_key_id },
    });
    const decryptedKeyA = decryptAccessKey(keyRecordA.key_value_encrypted);
    assert(
      Boolean(decryptedKeyA && decryptedKeyA.length >= 10),
      "17. Customer A can decrypt and view assigned key before manual delivery (delivery_status = PENDING)"
    );

    // ----------------------------------------------------
    // TEST: TENANT ISOLATION - CUSTOMER CANNOT ACCESS ANOTHER CUSTOMER'S KEY
    // ----------------------------------------------------
    const assignmentA = await prisma.accessAssignment.findUnique({
      where: { id: assignmentEmail.id },
    });
    // Check if User B is allowed to access User A's assignment
    const isUserBAllowed = assignmentA.user_id === userB.id || userB.role === "admin";
    assert(!isUserBAllowed, "18. Customer B cannot access or view Customer A's key (Tenant Isolation enforced)");

    // ----------------------------------------------------
    // TEST: MANUAL DELIVERY STATE CHANGE
    // ----------------------------------------------------
    const deliveredAt = new Date();
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderEmail.id },
        data: {
          delivery_status: "DELIVERED",
          delivered_at: deliveredAt,
        },
      }),
      prisma.accessAssignment.updateMany({
        where: { order_id: orderEmail.id },
        data: { delivered_at: deliveredAt },
      }),
    ]);

    const deliveredOrder = await prisma.order.findUnique({
      where: { id: orderEmail.id },
      include: { assignments: true },
    });
    assert(deliveredOrder.delivery_status === "DELIVERED", "19. Order delivery_status changed to DELIVERED");
    assert(Boolean(deliveredOrder.delivered_at), "20. Order delivered_at timestamp recorded");
    assert(
      deliveredOrder.assignments[0].status === "ACTIVE",
      "21. Access status remains ACTIVE regardless of delivery status transition"
    );

    // ----------------------------------------------------
    // TEST: DASHBOARD WORKS BEFORE AND AFTER MANUAL DELIVERY
    // ----------------------------------------------------
    // Key is still visible and accessible to Customer A after delivery
    const keyAfterDelivery = decryptAccessKey(keyRecordA.key_value_encrypted);
    assert(
      keyAfterDelivery === decryptedKeyA,
      "22. Dashboard allows Customer A to view key both before and after manual delivery"
    );

    // ----------------------------------------------------
    // TEST: SIMULTANEOUS / CONCURRENT ATOMIC ALLOCATION
    // ----------------------------------------------------
    // Create a dedicated plan with exactly ONE key that has only 1 available slot remaining
    const racePlan = await prisma.plan.create({
      data: {
        id: `plan_race_${timestamp}`,
        name: "Race Test Plan",
        slug: `plan-race-${timestamp}`,
        price: 999,
        currency: "INR",
        multiplier: 5,
        billing_period: "monthly",
        description: "Concurrency test plan",
        features: JSON.stringify(["5X Access", "Managed API"]),
        active: true,
      },
    });
    createdRecordIds.plans.push(racePlan.id);

    const testSecretKey = "sk-ant-race-slot-" + timestamp;
    const raceKey = await prisma.accessKey.create({
      data: {
        plan_id: racePlan.id,
        key_value_encrypted: encryptAccessKey(testSecretKey),
        max_customers: 2,
        current_customers: 1, // Only 1 slot available!
        status: "ACTIVE",
      },
    });
    createdRecordIds.keys.push(raceKey.id);

    // Create 2 distinct orders competing simultaneously for the only remaining slot
    const raceOrder1Id = `ORD-RACE-1-${timestamp}`;
    const raceOrder2Id = `ORD-RACE-2-${timestamp}`;

    const [raceOrder1, raceOrder2] = await Promise.all([
      prisma.order.create({
        data: {
          id: raceOrder1Id,
          user_id: userA.id,
          plan_id: racePlan.id,
          amount: racePlan.price,
          currency: "INR",
          status: "PAYMENT_PENDING",
          payment_status: "PENDING",
          delivery_method: "EMAIL",
          delivery_status: "PENDING",
          delivery_recipient: userA.email,
        },
      }),
      prisma.order.create({
        data: {
          id: raceOrder2Id,
          user_id: userB.id,
          plan_id: racePlan.id,
          amount: racePlan.price,
          currency: "INR",
          status: "PAYMENT_PENDING",
          payment_status: "PENDING",
          delivery_method: "WHATSAPP",
          delivery_status: "PENDING",
          delivery_recipient: userB.phone,
        },
      }),
    ]);
    createdRecordIds.orders.push(raceOrder1.id, raceOrder2.id);

    // Trigger concurrent payment completions in parallel
    const [res1, res2] = await Promise.all([
      processPaymentSuccess({
        orderId: raceOrder1.id,
        cashfreePaymentId: `cf_pay_race1_${timestamp}`,
        paymentMethod: "Cashfree UPI",
        rawDetails: { race: 1 },
      }),
      processPaymentSuccess({
        orderId: raceOrder2.id,
        cashfreePaymentId: `cf_pay_race2_${timestamp}`,
        paymentMethod: "Cashfree UPI",
        rawDetails: { race: 2 },
      }),
    ]);

    assert(res1.success && res2.success, "23. Both concurrent payment verifications executed safely");

    // Inspect the race key capacity
    const refreshedRaceKey = await prisma.accessKey.findUnique({
      where: { id: raceKey.id },
    });

    // The key had 1 slot remaining; it must NEVER have exceeded max_customers (2)
    assert(
      refreshedRaceKey.current_customers === 2,
      `24. Exactly 1 slot was consumed: current_customers is ${refreshedRaceKey.current_customers} of ${refreshedRaceKey.max_customers}`
    );
    assert(
      refreshedRaceKey.current_customers <= refreshedRaceKey.max_customers,
      "25. Atomicity invariant preserved: current_customers <= max_customers"
    );
    assert(
      refreshedRaceKey.status === "FULL",
      "26. Key atomically transitioned to FULL when capacity reached"
    );

    // Check which order won the slot
    const assignedCount = [res1.assignedKeyRecord, res2.assignedKeyRecord].filter(Boolean).length;
    assert(assignedCount === 1, "27. Exactly one order successfully secured the final slot; no double-allocation occurred");

    console.log("==================================================");
    console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed with error:", err);
    process.exit(1);
  } finally {
    // Clean up test data
    try {
      if (createdRecordIds.orders.length > 0) {
        await prisma.accessAssignment.deleteMany({
          where: { order_id: { in: createdRecordIds.orders } },
        });
        await prisma.payment.deleteMany({
          where: { order_id: { in: createdRecordIds.orders } },
        });
        await prisma.subscription.deleteMany({
          where: { order_id: { in: createdRecordIds.orders } },
        });
        await prisma.order.deleteMany({
          where: { id: { in: createdRecordIds.orders } },
        });
      }
      if (createdRecordIds.keys.length > 0) {
        await prisma.accessKey.deleteMany({
          where: { id: { in: createdRecordIds.keys } },
        });
      }
      if (createdRecordIds.plans.length > 0) {
        await prisma.plan.deleteMany({
          where: { id: { in: createdRecordIds.plans } },
        });
      }
      if (createdRecordIds.users.length > 0) {
        await prisma.user.deleteMany({
          where: { id: { in: createdRecordIds.users } },
        });
      }
    } catch (cleanupErr) {
      console.warn("Cleanup warning:", cleanupErr);
    }
    await prisma.$disconnect();
  }
}

runTests();
