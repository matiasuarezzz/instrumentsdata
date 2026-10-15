import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
        maximumSizeInBytes: 5 * 1024 * 1024,
      }),
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Failed to authorize photo upload", error);
    return NextResponse.json({ error: "No se pudo procesar la foto." }, { status: 400 });
  }
}