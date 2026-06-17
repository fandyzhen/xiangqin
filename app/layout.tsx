import type { Metadata, Viewport } from "next";
import { APP_NAME, APP_SHARE_DESCRIPTION, APP_SHARE_IMAGE, APP_SHARE_TITLE } from "@/lib/brand";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  applicationName: APP_NAME,
  title: APP_SHARE_TITLE,
  description: APP_SHARE_DESCRIPTION,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: APP_NAME,
    title: APP_SHARE_TITLE,
    description: APP_SHARE_DESCRIPTION,
    images: [
      {
        url: APP_SHARE_IMAGE,
        width: 537,
        height: 475,
        alt: APP_SHARE_TITLE
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: APP_SHARE_TITLE,
    description: APP_SHARE_DESCRIPTION,
    images: [APP_SHARE_IMAGE]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#111827"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
