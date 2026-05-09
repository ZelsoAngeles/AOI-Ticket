import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const { body } = await req.json();

    if (!body?.trim()) {
      return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        body,
        ticketId: id,
        userId,
      },
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}