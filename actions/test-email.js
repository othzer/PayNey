"use server";

import { db } from "@/lib/prisma";
import EmailTemplate from "@/emails/template";
import { sendEmail } from "@/actions/send-email";

export async function testEmail() {
  const user = await db.user.findFirst();

  await sendEmail({
    to: user.email,
    subject: "TEST EMAIL",
    react: EmailTemplate({
      userName: user.name,
      type: "budget-alert",
      data: {
        percentageUsed: 90,
        budgetAmount: "1000",
        totalExpenses: "900",
        accountName: "Test Account",
      },
    }),
  });

  return { success: true };
}