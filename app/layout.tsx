export const dynamic = 'force-dynamic'
import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap'
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-ibm-plex-serif',
  display: 'swap'
});

export const metadata: Metadata = {
  title: {
    template: '%s - GCB Bank PLC',
    default: 'GCB Bank PLC'
  },
  description: "GCB is a modern banking platform for everyone.",
  icons: {
    icon: '/icons/logo.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Mobile viewport handled by (root)/layout.tsx */}

      <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>
        {/* FIX: ThemeProvider was imported but never used — children were rendered without it */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
