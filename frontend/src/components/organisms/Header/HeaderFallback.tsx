import Link from "next/link";

export function HeaderFallback() {
  return (
    <header className="w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-[#1F2D63]"
        >
          DWYEROMEGA
        </Link>
      </div>
    </header>
  );
}
