import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    const userRole = cookieStore.get("user_role")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // EMPLOYEE → sariling tickets lang
    // IT_STAFF → assigned tickets lang
    // IT_MANAGER → lahat ng tickets
    const where =
      userRole === "IT_MANAGER"
        ? {}
        : userRole === "IT_STAFF"
        ? { assignedToId: userId }
        : { createdById: userId };

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { name: true, email: true } },
        assignedTo: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    const userRole = cookieStore.get("user_role")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // IT_STAFF at IT_MANAGER hindi dapat mag-create ng ticket
    if (userRole === "IT_STAFF" || userRole === "IT_MANAGER") {
      return NextResponse.json({ error: "Only employees can create tickets." }, { status: 403 });
    }

    const { title, description, priority, category } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority ?? "MEDIUM",
        category: category ?? "IT Support",
        createdById: userId,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}