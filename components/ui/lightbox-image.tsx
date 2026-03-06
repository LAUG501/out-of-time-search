"use client";

import { useState } from "react";

type LightboxImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export function LightboxImage({ src, alt, className }: LightboxImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="w-full text-left">
        <img src={src} alt={alt} className={className} />
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <img
            src={src}
            alt={alt}
            className="max-h-[88vh] max-w-[92vw] rounded-lg border border-slate-500 object-contain"
          />
        </div>
      ) : null}
    </>
  );
}
