const DEFAULT_API_URL = "https://e-commerce-2-zpg7.onrender.com/api/v1";

export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    apiUrl:
      process.env.VITE_API_URL ??
      process.env.API_URL ??
      DEFAULT_API_URL,
  };
}
