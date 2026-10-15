import type { Metadata } from 'next';
import '../globals.css';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';

export const metadata: Metadata = {
  title: 'ChronosLife | Log-10 인생 거버넌스',
  description: '로그 등간격 5단계 계층 시계열 인생 거버넌스 시스템',
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="font-sans antialiased min-h-screen bg-[#0a0e1a] text-[#f1f5f9]">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
