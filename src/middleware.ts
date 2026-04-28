export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    '/',              // Home page
    '/dashboard',
    '/inventory',
    '/sales',
    '/billing',
    '/ledger',
    '/gst-calculator',
  ]
};
