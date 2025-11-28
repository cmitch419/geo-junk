import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserExists, error, getRequestUserId, ok } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: { specimenId: string } }
) {
  try {
    const userId = getRequestUserId(req);
    await ensureUserExists(userId);

    const specimen = await prisma.specimen.findFirst({
      where: { id: params.specimenId, userId },
      include: {
        photos: true,
        specimenTags: { include: { tag: true } }
      }
    });

    if (!specimen) {
      return error({
        status: 404,
        code: "NOT_FOUND",
        message: "Specimen not found for this user."
      });
    }

    return ok({
      ...specimen,
      tags: specimen.specimenTags.map((st) => st.tag.name)
    });
  } catch (err) {
    console.error("GET /api/v1/specimens/[specimenId] error:", err);
    return error({
      status: 500,
      code: "SERVER_ERROR",
      message: "Failed to fetch specimen."
    });
  }
}
