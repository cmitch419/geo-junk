import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { prisma } from "./prisma";

type ParsedResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse };

export function ok<T>(data: T, init?: { status?: number }) {
  return NextResponse.json(
    { success: true, data },
    { status: init?.status ?? 200 }
  );
}

export function error(options: {
  status?: number;
  code: string;
  message: string;
  details?: unknown;
}) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: options.code,
        message: options.message,
        details: options.details
      }
    },
    { status: options.status ?? 400 }
  );
}

export async function parseJsonBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<ParsedResult<T>> {
  let json: unknown;
  try {
    json = await req.json();
  } catch (_err) {
    return {
      success: false,
      response: error({
        status: 400,
        code: "BAD_JSON",
        message: "Request body must be valid JSON."
      })
    };
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return {
      success: false,
      response: error({
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid request payload.",
        details: parsed.error.flatten()
      })
    };
  }

  return { success: true, data: parsed.data };
}

export function getRequestUserId(req: NextRequest) {
  return (
    req.headers.get("x-user-id")?.trim() ||
    process.env.DEMO_USER_ID ||
    "demo-user"
  );
}

// Temporary helper until full auth is wired. Ensures the user exists.
export async function ensureUserExists(userId: string) {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@example.com`,
      googleUserId: `${userId}-google-demo`,
      googleRefreshToken: "demo-token"
    }
  });
}
