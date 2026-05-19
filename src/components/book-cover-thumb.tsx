"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { optimizeCloudinaryImage } from "@/lib/utils";

export function BookCoverThumb({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <BookOpen size={30} aria-hidden="true" />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={optimizeCloudinaryImage(src, 260)}
      alt={title}
      className="cover-image"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
