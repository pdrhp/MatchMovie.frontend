import { ThemeProvider } from "@/components/theme-provider";
import { SignalRProvider } from "@/context/SignalRContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'MatchMovie',
  description: 'Encontre filmes para assistir com seus amigos',
  icons: {
    icon: [
      { rel: 'icon', url: '/ico/favicon.ico' },
      { rel: 'icon', url: '/ico/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { rel: 'icon', url: '/ico/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/ico/apple-touch-icon.png' }
    ],
    other: [
      {
        rel: 'android-chrome',
        url: '/ico/android-chrome-192x192.png',
        sizes: '192x192',
      },
      {
        rel: 'android-chrome',
        url: '/ico/android-chrome-512x512.png',
        sizes: '512x512',
      },
    ],
  },
  manifest: '/ico/site.webmanifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="matchmovie-theme"
        >
          <SignalRProvider>{children}</SignalRProvider>
          <Toaster 
            closeButton
            
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
