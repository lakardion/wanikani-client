import { createMiddleware } from "@solidjs/start/middleware";

const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self' https://api.wanikani.com; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";

export default createMiddleware([
  async (event, next) => {
    const response = await next();
    if (import.meta.env.PROD) event.res.headers.set("Content-Security-Policy", CSP);
    return response;
  },
]);
