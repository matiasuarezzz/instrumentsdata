"use client";

import { uploadPresigned } from "@vercel/blob/client";
import {
  ArrowUpRight,
  Check,
  ClipboardList,
  ImagePlus,
  LoaderCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type Instrument = {
  id: string;
  uploadedBy: string;
  instrumentName: string;
  partNumber: string;
  serialNumber: string;
  photoUrl: string;
  createdAt: string;
};

const emptyForm = {
  uploadedBy: "",
  instrumentName: "",
  partNumber: "",
  serialNumber: "",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function Home() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/instruments")
      .then(async (response) => {
        if (!response.ok) throw new Error("No se pudo cargar el inventario.");
        return (await response.json()) as Instrument[];
      })
      .then((items) => {
        if (active) setInstruments(items);
      })
      .catch(() => {
        if (active) setError("No se pudo conectar con la base de datos. Verificá la configuración de Vercel.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const filteredInstruments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");
    if (!query) return instruments;
    return instruments.filter((item) =>
      [item.instrumentName, item.partNumber, item.serialNumber, item.uploadedBy]
        .some((value) => value.toLocaleLowerCase("es").includes(query)),
    );
  }, [instruments, search]);

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError("");
    setMessage("");
    if (file && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Elegí una imagen JPG, PNG o WebP.");
      event.target.value = "";
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setError("La foto debe pesar menos de 5 MB.");
      event.target.value = "";
      return;
    }
    setPhoto(file);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!photo) {
      setError("Agregá una foto del instrumento para continuar.");
      return;
    }

    setIsSaving(true);
    try {
      const blob = await uploadPresigned(photo.name, photo, {
        access: "public",
        handleUploadUrl: "/api/uploads",
      });
      const response = await fetch("/api/instruments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photoUrl: blob.url }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No se pudo guardar el instrumento.");
      setInstruments((current) => [result, ...current]);
      setForm(emptyForm);
      setPhoto(null);
      setMessage("Instrumento registrado correctamente.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ocurrió un error al guardar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f6f3] text-[#1d2926]">
      <header className="border-b border-[#e5e9e4] bg-[#fbfcfa]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <a className="flex items-center gap-3" href="#inicio" aria-label="Instrumenta, inicio">
            <span className="brand-mark"><span /><span /><span /></span>
            <span className="text-[18px] font-bold tracking-[-0.04em]">instrumenta<span className="text-[#73817b]">.</span></span>
          </a>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#e7ebe6] bg-white px-3 py-2 text-[11px] font-semibold text-[#73817b] sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#47a77e]" />
              INVENTARIO ACTIVO
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8eee8] text-xs font-bold text-[#3d6554]">IN</div>
          </div>
        </div>
      </header>

      <div id="inicio" className="mx-auto max-w-[1440px] px-5 pb-16 pt-9 sm:px-8 sm:pt-12 lg:px-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#779083]"><Sparkles size={13} /> Gestión de activos</p>
            <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.055em] sm:text-[40px]">Inventario de instrumentos</h1>
            <p className="mt-2 text-sm text-[#75817c]">Un registro claro para cada pieza de tu equipo.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#e5e9e4] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(30,50,40,.025)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4ef] text-[#57816a]"><ClipboardList size={17} /></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-[.13em] text-[#8a9790]">Registrados</p><p className="text-lg font-semibold leading-5">{instruments.length.toString().padStart(2, "0")}</p></div>
          </div>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
          <section className="order-2 min-w-0 rounded-2xl border border-[#e6eae5] bg-white shadow-[0_5px_24px_rgba(27,49,38,.035)] xl:order-1">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf0ed] px-5 py-5 sm:px-7">
              <div><h2 className="text-[17px] font-semibold tracking-[-.025em]">Instrumentos registrados</h2><p className="mt-1 text-xs text-[#8b9690]">Consultá y buscá en tu inventario</p></div>
              <div className="flex w-full gap-2 sm:w-auto">
                <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#e7ebe7] bg-[#fbfcfa] px-3 py-2.5 sm:w-[230px] sm:flex-none">
                  <Search size={15} className="shrink-0 text-[#93a099]" />
                  <input aria-label="Buscar instrumentos" className="w-full bg-transparent text-xs outline-none placeholder:text-[#a4aea8]" placeholder="Buscar por nombre, serie…" value={search} onChange={(event) => setSearch(event.target.value)} />
                  {search && <button type="button" aria-label="Limpiar búsqueda" onClick={() => setSearch("")}><X size={14} className="text-[#8a9790]" /></button>}
                </label>
                <button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e7ebe7] text-[#87948d]" aria-label="Opciones de filtro"><SlidersHorizontal size={15} /></button>
              </div>
            </div>

            <div className="hidden grid-cols-[minmax(150px,1.3fr)_minmax(100px,.9fr)_minmax(100px,.9fr)_minmax(110px,.9fr)_82px] gap-4 bg-[#fafbf9] px-7 py-3 text-[10px] font-bold uppercase tracking-[.11em] text-[#8c9991] sm:grid">
              <span>Instrumento</span><span>N.º de parte</span><span>N.º de serie</span><span>Cargado por</span><span>Foto</span>
            </div>

            <div>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-[#85928b]"><LoaderCircle className="animate-spin" size={17} /> Cargando inventario…</div>
              ) : filteredInstruments.length ? (
                filteredInstruments.map((item) => (
                  <article key={item.id} className="grid gap-3 border-t border-[#edf0ed] px-5 py-4 first:border-t-0 sm:grid-cols-[minmax(150px,1.3fr)_minmax(100px,.9fr)_minmax(100px,.9fr)_minmax(110px,.9fr)_82px] sm:items-center sm:gap-4 sm:px-7">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#eff2ed]">
                        <Image src={item.photoUrl} alt={item.instrumentName} fill sizes="44px" className="object-cover" unoptimized />
                      </div>
                      <div className="min-w-0"><p className="truncate text-[13px] font-semibold">{item.instrumentName}</p><p className="mt-1 text-[10px] text-[#96a099]">{formatDate(item.createdAt)}</p></div>
                    </div>
                    <p className="flex justify-between text-xs text-[#5e6e65] sm:block"><span className="text-[10px] text-[#9aa49e] sm:hidden">N.º de parte</span><span className="font-medium">{item.partNumber}</span></p>
                    <p className="flex justify-between text-xs text-[#5e6e65] sm:block"><span className="text-[10px] text-[#9aa49e] sm:hidden">N.º de serie</span><span className="font-medium">{item.serialNumber}</span></p>
                    <p className="flex justify-between text-xs text-[#5e6e65] sm:block"><span className="text-[10px] text-[#9aa49e] sm:hidden">Cargado por</span><span className="font-medium">{item.uploadedBy}</span></p>
                    <a href={item.photoUrl} target="_blank" rel="noreferrer" className="hidden items-center gap-1 text-[10px] font-semibold text-[#568069] hover:text-[#31583f] sm:flex">Ver foto <ArrowUpRight size={12} /></a>
                  </article>
                ))
              ) : (
                <div className="flex flex-col items-center px-5 py-16 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f5f1] text-[#779382]"><ClipboardList size={20} /></div>
                  <p className="text-sm font-semibold">{search ? "No hay resultados" : "Todavía no hay instrumentos"}</p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-[#8d9992]">{search ? "Probá con otro nombre, número de parte o serie." : "Completá el formulario para agregar el primer instrumento a tu inventario."}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#edf0ed] px-5 py-3.5 text-[10px] text-[#98a29c] sm:px-7">
              <span>{search ? `${filteredInstruments.length} resultado${filteredInstruments.length === 1 ? "" : "s"}` : `Mostrando ${instruments.length} registro${instruments.length === 1 ? "" : "s"}`}</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-[#6a9b7b}" /> Datos protegidos</span>
            </div>
          </section>

          <aside className="order-1 rounded-2xl border border-[#e6eae5] bg-white p-5 shadow-[0_5px_24px_rgba(27,49,38,.035)] sm:p-6 xl:order-2">
            <div className="mb-5 flex items-start justify-between">
              <div><span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf4ef] text-[#59816b]"><ImagePlus size={15} /></span><h2 className="text-[17px] font-semibold tracking-[-.025em]">Nuevo instrumento</h2><p className="mt-1 text-xs text-[#89958e]">Ingresá los datos para registrarlo.</p></div>
              <span className="rounded-full bg-[#f2f5f2] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-[#7d8b82]">Nuevo</span>
            </div>
            <form className="space-y-3.5" onSubmit={submitForm}>
              <Field label="Persona que carga" hint="Nombre y apellido" value={form.uploadedBy} onChange={(value) => setForm({ ...form, uploadedBy: value })} />
              <Field label="Nombre del instrumento" hint="Ej. Multímetro digital" value={form.instrumentName} onChange={(value) => setForm({ ...form, instrumentName: value })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="N.º de parte" hint="Ej. 87V-MAX" value={form.partNumber} onChange={(value) => setForm({ ...form, partNumber: value })} />
                <Field label="N.º de serie" hint="Ej. 2408A19" value={form.serialNumber} onChange={(value) => setForm({ ...form, serialNumber: value })} />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between"><label htmlFor="instrument-photo" className="text-[11px] font-semibold text-[#46564d]">Foto del instrumento <span className="text-[#bc7461]">*</span></label><span className="text-[9px] text-[#a0aaa3]">JPG, PNG · máx. 5 MB</span></div>
                <label htmlFor="instrument-photo" className={`relative flex min-h-[108px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed transition ${preview ? "border-[#91b59d] bg-[#f7faf7]" : "border-[#dfe6df] bg-[#fafbf9] hover:border-[#9bb9a3] hover:bg-[#f8faf7]"}`}>
                  {preview ? <><Image src={preview} alt="Vista previa de la foto" fill sizes="340px" className="object-contain p-2" unoptimized /><span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[9px] font-semibold text-[#557c65] shadow-sm"><Check size={11} /> Cambiar foto</span></> : <span className="flex flex-col items-center text-center"><span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#72857a] shadow-sm"><UploadCloud size={16} /></span><span className="text-[11px] font-semibold text-[#5c6d62]">Hacé clic para subir una foto</span><span className="mt-1 text-[9px] text-[#a1aaa4]">o arrastrala hasta acá</span></span>}
                  <input id="instrument-photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={choosePhoto} />
                </label>
              </div>

              {error && <p role="alert" className="rounded-lg bg-[#fff4f1] px-3 py-2 text-[11px] leading-4 text-[#a44f40]">{error}</p>}
              {message && <p role="status" className="rounded-lg bg-[#eff7f0] px-3 py-2 text-[11px] text-[#477355]">{message}</p>}
              <button disabled={isSaving} type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#294e3d] px-4 py-3 text-xs font-semibold text-white shadow-[0_3px_8px_rgba(34,76,55,.15)] transition hover:bg-[#203f31] disabled:cursor-not-allowed disabled:opacity-60">
                {isSaving ? <><LoaderCircle className="animate-spin" size={14} /> Guardando instrumento…</> : <>Registrar instrumento <ArrowUpRight size={14} /></>}
              </button>
            </form>
            <div className="mt-4 flex items-start gap-2 border-t border-[#eef1ee] pt-3 text-[10px] leading-4 text-[#8b9790]"><ShieldCheck className="mt-0.5 shrink-0 text-[#78a086]" size={13} />Tus datos y fotos se guardan de forma segura en Vercel.</div>
          </aside>
        </div>

        <footer className="mt-8 flex flex-col items-center justify-between gap-2 text-[10px] text-[#a0aaa4] sm:flex-row"><span>INSTRUMENTA <span className="px-1">·</span> REGISTRO Y CONTROL DE ACTIVOS</span><span>Hecho para mantener tu equipo en orden.</span></footer>
      </div>
    </main>
  );
}

function Field({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-[#46564d]">{label} <span className="text-[#bc7461]">*</span></span>
      <input required maxLength={120} value={value} onChange={(event) => onChange(event.target.value)} placeholder={hint} className="h-10 w-full rounded-lg border border-[#e5eae5] bg-[#fcfdfb] px-3 text-xs text-[#2e3d34] outline-none transition placeholder:text-[#aab3ad] focus:border-[#9eb8a4] focus:bg-white" />
    </label>
  );
}
