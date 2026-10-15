import { sql } from "@vercel/postgres";

export async function ensureInstrumentTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS instruments (
      id BIGSERIAL PRIMARY KEY,
      uploaded_by VARCHAR(120) NOT NULL,
      instrument_name VARCHAR(120) NOT NULL,
      part_number VARCHAR(120) NOT NULL,
      serial_number VARCHAR(120) NOT NULL,
      photo_url TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}