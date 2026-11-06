/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      // El listado de lecciones vive en el inicio.
      { source: "/ayuda", destination: "/", permanent: true },
      // Direcciones anteriores de las lecciones.
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:slug", destination: "/ayuda/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
