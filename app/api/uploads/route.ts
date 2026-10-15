import { issueSignedToken } from "@vercel/blob";
import { handleUploadPresigned } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        const allowedContentTypes = ["image/jpeg", "image/png", "image/webp"];
        const maximumSizeInBytes = 5 * 1024 * 1024;
        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          allowedContentTypes,
          maximumSizeInBytes,
          validUntil: Date.now() + 10 * 60 * 1000,
        });

        return {
          token,
          urlOptions: {
            allowedContentTypes,
            maximumSizeInBytes,
            addRandomSuffix: true,
            validUntil: Date.now() + 5 * 60 * 1000,
          },
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Failed to authorize photo upload", error);
    return NextResponse.json({ error: "No se pudo procesar la foto." }, { status: 400 });
  }
}