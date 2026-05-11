import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get("user_role")?.value;

    if (userRole !== "IT_MANAGER") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const staff = await prisma.user.findMany({
      where: { role: "IT_STAFF" },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}