# Instrumenta

Aplicación web en español para registrar y consultar instrumentos. Guarda en cada registro el nombre de quien lo carga, el instrumento, el número de parte, el número de serie y la foto.

## Tecnologías

- Next.js App Router y TypeScript
- Vercel Postgres para los registros
- Vercel Blob para las fotos (JPG, PNG o WebP de hasta 5 MB)

La tabla `instruments` se crea automáticamente al consultar o guardar el primer registro.

## Configuración en Vercel

1. Importá este repositorio como proyecto en Vercel.
2. En el Marketplace de Vercel, conectá una base de datos PostgreSQL y un almacén Blob al proyecto.
3. Confirmá que las variables `POSTGRES_URL` y `BLOB_READ_WRITE_TOKEN` estén disponibles en los entornos de Preview y Production. Para desarrollo local, completá `.env.local` usando `.env.example` como guía o sincronizá las variables del proyecto con la CLI de Vercel.
4. Desplegá el proyecto. No hace falta ejecutar una migración manual.

## Desarrollo local

Se requiere Node.js 22 o superior. Instalá las dependencias con `npm install`, configurá las variables del apartado anterior en `.env.local` y ejecutá `npm run dev`.

Para comprobar el proyecto, ejecutá `npm run lint` y `npm run build`.

## API

- `GET /api/instruments`: lista los registros, del más reciente al más antiguo.
- `POST /api/instruments`: valida y guarda los campos del instrumento.
- `POST /api/uploads`: autoriza la carga de fotos en Vercel Blob.This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
