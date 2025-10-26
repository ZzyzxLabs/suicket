/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENDGRID_API_KEY: string;
  readonly VITE_SENDGRID_FROM_EMAIL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
