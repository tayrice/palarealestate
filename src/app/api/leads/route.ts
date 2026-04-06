import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  status: z.enum(["open", "claimed", "closed", "all"]).optional().default("all"),
  source: z.string().optional(),
  priority: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const query = querySchema.parse(params);

  const where: Record<string, unknown> = {};
  if (query.status && query.status !== "all") where.status = query.status;
  if (query.source) where.source = query.source;
  if (query.priority) where.priority = query.priority;
  if (query.search) {
    where.OR = [
      { customerName: { contains: query.search } },
      { customerPhone: { contains: query.search } },
      { address: { contains: query.search } },
      { city: { contains: query.search } },
      { zip: { contains: query.search } },
      { objectRef: { contains: query.search } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { lastActivityAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        owner: { select: { id: true, name: true } },
        tasks: { where: { doneAt: null }, orderBy: { dueAt: "asc" }, take: 1 },
        _count: { select: { comments: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ leads, total, page: query.page, limit: query.limit });
}

const createSchema = z.object({
  source: z.enum(["ankaufstation", "besichtigung", "website", "other"]),
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().email().optional().or(z.literal("")),
  priority: z.enum(["low", "normal", "high"]).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = createSchema.parse(body);

  const lead = await prisma.lead.create({
    data: {
      ...data,
      status: "open",
      customerEmail: data.customerEmail || null,
      lastActivityAt: new Date(),
    },
  });

  return NextResponse.json(lead, { status: 201 });
}
