"use client";

import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";

export function BookImagePreview({ initialUrl = "", title = "Book cover" }: { initialUrl?: string; title?: string }) {
  const [previewUrl, setPreviewUrl] = useState(initialUrl);

  useEffect(() => {
    const imageUrlField = document.querySelector<HTMLInputElement>('input[name="imageUrl"]');
    const fileField = document.querySelector<HTMLInputElement>('input[name="image"]');
    let objectUrl = "";

    function updateFromUrl() {
      if (imageUrlField?.value) setPreviewUrl(imageUrlField.value);
    }

    function updateFromFile() {
      const file = fileField?.files?.[0];
      if (!file) return;

      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }

    imageUrlField?.addEventListener("input", updateFromUrl);
    imageUrlField?.addEventListener("change", updateFromUrl);
    fileField?.addEventListener("change", updateFromFile);

    return () => {
      imageUrlField?.removeEventListener("input", updateFromUrl);
      imageUrlField?.removeEventListener("change", updateFromUrl);
      fileField?.removeEventListener("change", updateFromFile);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return (
    <div className="cover-preview">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt={title} className="cover-image" />
      ) : (
        <div className="cover-empty">
          <ImagePlus size={34} aria-hidden="true" />
          <span>Image preview</span>
        </div>
      )}
    </div>
  );
}
