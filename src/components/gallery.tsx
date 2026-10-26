"use client";

import Image from "next/image";
import { useState } from "react";

export function Gallery({ name, urls }: { name: string; urls: string[] }) {
  const [active, setActive] = useState(0);

  if (urls.length === 0) {
    return <div className="aspect-square bg-neutral-100" />;
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <Image
          src={urls[active]}
          alt={`${name}, photo ${active + 1} of ${urls.length}`}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        {urls.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActive((active - 1 + urls.length) % urls.length)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white/80 text-lg hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setActive((active + 1) % urls.length)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white/80 text-lg hover:bg-white"
            >
              ›
            </button>
          </>
        )}
      </div>
      {urls.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {urls.map((url, i) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === active}
                className={`relative block aspect-square w-full overflow-hidden bg-neutral-100 ring-offset-2 ${
                  i === active ? "ring-1 ring-black" : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={url} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
