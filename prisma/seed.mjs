import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding plans...");

  const plan5x = await prisma.plan.upsert({
    where: { slug: "claude-max-5x" },
    update: {
      name: "Claude Max 5x",
      multiplier: 5,
      price: 999,
      currency: "INR",
      billing_period: "monthly",
      description: "For regular users who need substantially more usage than the standard plan.",
      features: JSON.stringify([
        "5x usage tier",
        "Monthly subscription",
        "Account-based purchase",
        "Secure payment",
        "Support included",
      ]),
      active: true,
    },
    create: {
      id: "plan_claude_max_5x",
      name: "Claude Max 5x",
      slug: "claude-max-5x",
      provider: "anthropic",
      multiplier: 5,
      price: 999,
      currency: "INR",
      billing_period: "monthly",
      description: "For regular users who need substantially more usage than the standard plan.",
      features: JSON.stringify([
        "5x usage tier",
        "Monthly subscription",
        "Account-based purchase",
        "Secure payment",
        "Support included",
      ]),
      active: true,
    },
  });

  const plan20x = await prisma.plan.upsert({
    where: { slug: "claude-max-20x" },
    update: {
      name: "Claude Max 20x",
      multiplier: 20,
      price: 1999,
      currency: "INR",
      billing_period: "monthly",
      description: "For heavier daily use and demanding workflows.",
      features: JSON.stringify([
        "20x usage tier",
        "Monthly subscription",
        "Account-based purchase",
        "Secure payment",
        "Support included",
      ]),
      active: true,
    },
    create: {
      id: "plan_claude_max_20x",
      name: "Claude Max 20x",
      slug: "claude-max-20x",
      provider: "anthropic",
      multiplier: 20,
      price: 1999,
      currency: "INR",
      billing_period: "monthly",
      description: "For heavier daily use and demanding workflows.",
      features: JSON.stringify([
        "20x usage tier",
        "Monthly subscription",
        "Account-based purchase",
        "Secure payment",
        "Support included",
      ]),
      active: true,
    },
  });

  console.log("Plans seeded:", plan5x.name, plan20x.name);

  // Seed default admin user
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@claude-store.local" },
    update: {
      role: "admin",
    },
    create: {
      id: "user_admin_001",
      name: "System Administrator",
      email: "admin@claude-store.local",
      phone: "+91 99999 88888",
      password_hash: adminPasswordHash,
      role: "admin",
      email_verified_at: new Date(),
      phone_verified_at: new Date(),
    },
  });

  // Seed default customer (Zenon)
  const customerPasswordHash = await bcrypt.hash("Password123!", 10);
  const customerUser = await prisma.user.upsert({
    where: { email: "zenon@example.com" },
    update: {},
    create: {
      id: "user_customer_zenon",
      name: "Zenon",
      email: "zenon@example.com",
      phone: "+91 98765 43210",
      password_hash: customerPasswordHash,
      role: "customer",
      email_verified_at: new Date(),
      phone_verified_at: new Date(),
    },
  });

  console.log("Users seeded:", adminUser.email, customerUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
