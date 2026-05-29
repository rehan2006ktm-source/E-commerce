export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    apiUrl:
      process.env.VITE_API_URL ??
      process.env.API_URL ??
      "http://localhost:5000/api/v1",
  };
}
