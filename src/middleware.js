export { default } from 'next-auth/middleware';

export const config = {
  // Protect everything except the login page, NextAuth API routes,
  // static assets, and Next.js internals.
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico|manifest.json|icon-192.png|icon-512.png).*)',
  ],
};
