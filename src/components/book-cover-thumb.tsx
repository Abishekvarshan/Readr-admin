"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

export function BookCoverThumb({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <BookOpen size={30} aria-hidden="true" />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={title} className="cover-image" onError={() => setFailed(true)} />;
}
