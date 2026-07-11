import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes (/api)
  // - static files (/images, /favicon.ico, etc.)
  // - metadata files (site.webmanifest, robots.txt, sitemap.xml, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
