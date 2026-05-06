import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const fontBody = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: {
    default: "FINASTRA / ARTHYUG",
    template: "%s | FINASTRA / ARTHYUG"
  },
  description:
    "A premium event management platform for an inter-college commerce and finance fest, built with cinematic visuals and dynamic administration.",
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontBody.variable} ${fontDisplay.variable} page-shell`}>
        <div className="aurora-line" />
        {children}
      </body>
    </html>
  );
}
