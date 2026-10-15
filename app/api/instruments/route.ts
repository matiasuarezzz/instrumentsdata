import { ensureInstrumentTable } from "@/lib/db";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const instrumentSchema = z.object({
  uploadedBy: z.string().trim().min(1).max(120),
  instrumentName: z.string().trim().min(1).max(120),
  partNumber: z.string().trim().min(1).max(120),
  serialNumber: z.string().trim().min(1).max(120),
  photoUrl: z.string().url().max(2048).refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".blob.vercel-storage.com");
  }),
});

export async function GET() {
  try {
    await ensureInstrumentTable();
    const { rows } = await sql`
      SELECT id, uploaded_by, instrument_name, part_number, serial_number, photo_url, created_at
      FROM instruments
      ORDER BY created_at DESC, id DESC
    `;

    return NextResponse.json(rows.map((row) => ({
      id: String(row.id),
      uploadedBy: row.uploaded_by,
      instrumentName: row.instrument_name,
      partNumber: row.part_number,
      serialNumber: row.serial_number,
      photoUrl: row.photo_url,
      createdAt: row.created_at,
    })));
  } catch (error) {
    console.error("Failed to load instruments", error);
    return NextResponse.json(
      { error: "No se pudo conectar con la base de datos. Revisá POSTGRES_URL." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = instrumentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Completá todos los campos con datos válidos." }, { status: 400 });
  }

  try {
    await ensureInstrumentTable();
    const { uploadedBy, instrumentName, partNumber, serialNumber, photoUrl } = parsed.data;
    const { rows } = await sql`
      INSERT INTO instruments (uploaded_by, instrument_name, part_number, serial_number, photo_url)
      VALUES (${uploadedBy}, ${instrumentName}, ${partNumber}, ${serialNumber}, ${photoUrl})
      RETURNING id, uploaded_by, instrument_name, part_number, serial_number, photo_url, created_at
    `;
    const row = rows[0];

    return NextResponse.json({
      id: String(row.id),
      uploadedBy: row.uploaded_by,
      instrumentName: row.instrument_name,
      partNumber: row.part_number,
      serialNumber: row.serial_number,
      photoUrl: row.photo_url,
      createdAt: row.created_at,
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to save instrument", error);
    return NextResponse.json(
      { error: "No se pudo guardar. Verificá la conexión con la base de datos." },
      { status: 503 },
    );
  }
}