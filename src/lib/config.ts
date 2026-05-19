export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  firebaseStorageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  firebaseMessagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  firebaseAppId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  firebaseMeasurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER ?? "book-market/books",
};

export function hasSupabaseConfig() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasAdminConfig() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export function hasCloudinaryConfig() {
  return Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret);
}

export function hasFirebaseConfig() {
  return Boolean(env.firebaseApiKey && env.firebaseAuthDomain && env.firebaseProjectId && env.firebaseAppId);
}
