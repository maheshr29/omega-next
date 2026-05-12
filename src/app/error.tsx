"use client";

import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Surface to console for dev; observability hook (instrumentation.ts)
    // captures the server side. Client telemetry would go here.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-bold text-zinc-900">Something went wrong</h1>
      <p className="text-sm text-zinc-600">
        An unexpected error occurred. The team has been notified.
      </p>
      {error.digest ? (
        <p className="text-xs text-zinc-400">Reference: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-4 inline-flex items-center rounded-md bg-[#1F2D63] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#16224d]"
      >
        Try again
      </button>
    </main>
  );
}
