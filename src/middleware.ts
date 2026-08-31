export { default as middleware } from "next-auth/middleware";

export const config = {
  matcher: ["/profile/:path*", "/most-bought/:path*", "/notifications/:path*"],
};
