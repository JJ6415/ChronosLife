import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['ja'],
  defaultLocale: 'ja',
  localeDetection: false
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/ko') || pathname.startsWith('/en')) {
    const newPath = pathname.replace(/^\/(ko|en)/, '/ja');
    return NextResponse.redirect(new URL(newPath, req.url));
  }
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/', '/(ko|en|ja)/:path*']
};
