import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  role: z.enum(["admin", "staff"]),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;

  try {
    const json = await req.json();
    const data = updateSchema.parse(json);

    // Verhindert, dass sich ein Admin selbst die Rechte entzieht.
    if (id === session.user.id && data.role !== "admin") {
      return NextResponse.json({ error: "Eigene Admin-Rolle kann nicht entfernt werden" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: data.role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Ungültige Eingaben", details: error.issues }, { status: 400 });
    }
    console.error("Update user role error", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
