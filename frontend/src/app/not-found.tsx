import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-xs font-semibold tracking-widest text-zinc-500">404</p>
      <h1 className="text-2xl font-bold text-zinc-900">Page not found</h1>
      <p className="text-sm text-zinc-600">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center rounded-md bg-[#1F2D63] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#16224d]"
      >
        Back to home
      </Link>
    </main>
  );
}
