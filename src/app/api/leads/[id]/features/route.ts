import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const featureSchema = z.object({
  featureKey: z.string(),
  label: z.string(),
  enabled: z.boolean(),
  category: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = featureSchema.parse(await req.json());

  const feature = await prisma.propertyFeature.upsert({
    where: { leadId_featureKey: { leadId: id, featureKey: data.featureKey } },
    update: { enabled: data.enabled },
    create: { leadId: id, ...data },
  });

  return NextResponse.json(feature);
}
