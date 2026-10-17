import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function databaseResponse<T>(operation: () => Promise<T>, status = 200) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Cloud saving is not configured yet." }, { status: 503 });
  }
  try {
    return NextResponse.json(await operation(), { status });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid simulation data. Check the project name, algorithm, and inputs." }, { status: 400 });
    }
    const failure = error as { name?: string; code?: string };
    console.error("Simulation storage request failed", { name: failure.name, code: failure.code });
    return NextResponse.json({ error: "Could not access saved work. Please try again shortly." }, { status: 503 });
  }
}
