import type { Metadata } from "next";
import "./globals.css";

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
      <body className="page-shell">
        <div className="aurora-line" />
        {children}
      </body>
    </html>
  );
}
