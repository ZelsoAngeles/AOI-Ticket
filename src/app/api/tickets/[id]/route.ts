import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true, email: true } },
        assignedTo: { select: { name: true, email: true, role: true } },
        comments: {
          include: { user: { select: { name: true, email: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const userRole = cookieStore.get("user_role")?.value;

    const body = await req.json();
    const { status, assignedToId } = body;

    // Only IT_MANAGER can assign
    if (assignedToId !== undefined && userRole !== "IT_MANAGER") {
      return NextResponse.json({ error: "Only IT Managers can assign tickets." }, { status: 403 });
    }

    // Only IT_STAFF and IT_MANAGER can update status
    if (status !== undefined && userRole === "EMPLOYEE") {
      return NextResponse.json({ error: "Employees cannot update ticket status." }, { status: 403 });
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(assignedToId !== undefined && { assignedToId }),
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}