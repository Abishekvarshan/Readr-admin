import crypto from "crypto";
import { env, hasCloudinaryConfig } from "@/lib/config";
import { slugify } from "@/lib/utils";

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

export async function uploadBookImage(file: File, title: string) {
  if (!hasCloudinaryConfig()) {
    throw new Error("Cloudinary credentials are missing.");
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = `${slugify(title)}-${Date.now()}`;
  const params = {
    folder: env.cloudinaryFolder,
    public_id: publicId,
    timestamp,
  };

  const signaturePayload = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(`${signaturePayload}${env.cloudinaryApiSecret}`)
    .digest("hex");

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", env.cloudinaryApiKey);
  body.append("folder", params.folder);
  body.append("public_id", params.public_id);
  body.append("timestamp", params.timestamp);
  body.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
    {
      method: "POST",
      body,
    },
  );
  const data = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message ?? "Cloudinary upload failed.");
  }

  return data.secure_url;
}
