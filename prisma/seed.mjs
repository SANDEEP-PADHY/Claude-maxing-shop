import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

const SECRET = process.env.AUTH_SECRET || "claude-storefront-super-secure-production-secret-token-32-chars-min";
const ENCRYPTION_KEY = crypto.createHash("sha256").update(SECRET).digest();

function encryptKey(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

async function main() {
  console.log("Seeding claudemaxing.shop plans and access keys...");

  // Plan 5X
  const plan5x = await prisma.plan.upsert({
    where: { slug: "5x-access" },
    update: {
      name: "5X Access",
      multiplier: 5,
      price: 999,
      currency: "INR",
      billing_period: "monthly",
      description: "For regular users who need substantially more usage than standard access.",
      features: JSON.stringify([
        "5X capacity allocation",
        "Managed Claude-powered access",
        "Fast delivery via Email or WhatsApp",
        "30-day access validity",
        "Support included",
      ]),
      active: true,
    },
    create: {
      id: "plan_5x_access",
      name: "5X Access",
      slug: "5x-access",
      provider: "managed-api",
      multiplier: 5,
      price: 999,
      currency: "INR",
      billing_period: "monthly",
      description: "For regular users who need substantially more usage than standard access.",
      features: JSON.stringify([
        "5X capacity allocation",
        "Managed Claude-powered access",
        "Fast delivery via Email or WhatsApp",
        "30-day access validity",
        "Support included",
      ]),
      active: true,
    },
  });

  // Also support legacy slug alias for seamless transition
  await prisma.plan.upsert({
    where: { slug: "claude-max-5x" },
    update: { name: "5X Access", active: true },
    create: {
      id: "plan_claude_max_5x",
      name: "5X Access",
      slug: "claude-max-5x",
      provider: "managed-api",
      multiplier: 5,
      price: 999,
      currency: "INR",
      billing_period: "monthly",
      description: "For regular users who need substantially more usage than standard access.",
      features: JSON.stringify([
        "5X capacity allocation",
        "Managed Claude-powered access",
        "Fast delivery via Email or WhatsApp",
        "30-day access validity",
        "Support included",
      ]),
      active: true,
    },
  });

  // Plan 20X
  const plan20x = await prisma.plan.upsert({
    where: { slug: "20x-access" },
    update: {
      name: "20X Access",
      multiplier: 20,
      price: 1999,
      currency: "INR",
      billing_period: "monthly",
      description: "For heavier daily use and demanding professional workflows.",
      features: JSON.stringify([
        "20X capacity allocation",
        "High-throughput Claude-powered access",
        "Fast delivery via Email or WhatsApp",
        "30-day access validity",
        "Support included",
      ]),
      active: true,
    },
    create: {
      id: "plan_20x_access",
      name: "20X Access",
      slug: "20x-access",
      provider: "managed-api",
      multiplier: 20,
      price: 1999,
      currency: "INR",
      billing_period: "monthly",
      description: "For heavier daily use and demanding professional workflows.",
      features: JSON.stringify([
        "20X capacity allocation",
        "High-throughput Claude-powered access",
        "Fast delivery via Email or WhatsApp",
        "30-day access validity",
        "Support included",
      ]),
      active: true,
    },
  });

  // Legacy alias for 20x
  await prisma.plan.upsert({
    where: { slug: "claude-max-20x" },
    update: { name: "20X Access", active: true },
    create: {
      id: "plan_claude_max_20x",
      name: "20X Access",
      slug: "claude-max-20x",
      provider: "managed-api",
      multiplier: 20,
      price: 1999,
      currency: "INR",
      billing_period: "monthly",
      description: "For heavier daily use and demanding professional workflows.",
      features: JSON.stringify([
        "20X capacity allocation",
        "High-throughput Claude-powered access",
        "Fast delivery via Email or WhatsApp",
        "30-day access validity",
        "Support included",
      ]),
      active: true,
    },
  });

  console.log("Plans seeded:", plan5x.name, plan20x.name);

  // Seed sample access keys if none exist
  const existingKey5x = await prisma.accessKey.findFirst({
    where: { plan_id: plan5x.id },
  });
  if (!existingKey5x) {
    const rawKey5x = "cm_live_5x_8a92f03c4b1e5d7a8f9021";
    await prisma.accessKey.create({
      data: {
        id: "key_5x_seed_001",
        key_value_encrypted: encryptKey(rawKey5x),
        plan_id: plan5x.id,
        status: "ACTIVE",
        max_customers: 10,
        current_customers: 0,
      },
    });
    console.log("5X Access Key seeded (Capacity: 10)");
  }

  const existingKey20x = await prisma.accessKey.findFirst({
    where: { plan_id: plan20x.id },
  });
  if (!existingKey20x) {
    const rawKey20x = "cm_live_20x_9d41b6c7e2a0f8b3c5e174";
    await prisma.accessKey.create({
      data: {
        id: "key_20x_seed_001",
        key_value_encrypted: encryptKey(rawKey20x),
        plan_id: plan20x.id,
        status: "ACTIVE",
        max_customers: 5,
        current_customers: 0,
      },
    });
    console.log("20X Access Key seeded (Capacity: 5)");
  }

  // Seed default admin user
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!adminPassword) {
    console.warn("⚠ ADMIN_SEED_PASSWORD not set – skipping admin user seed. Set it in .env for first-time setup.");
  } else {
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_SEED_EMAIL || "admin@claudemaxing.shop" },
      update: { role: "admin" },
      create: {
        id: "user_admin_001",
        name: "System Administrator",
        email: process.env.ADMIN_SEED_EMAIL || "admin@claudemaxing.shop",
        phone: process.env.ADMIN_SEED_PHONE || "+91 00000 00000",
        password_hash: adminPasswordHash,
        role: "admin",
        email_verified_at: new Date(),
        phone_verified_at: new Date(),
      },
    });
    console.log("Admin user seeded.");
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
