import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider } from "./providers";

export const metadata: Metadata = {
  title: "Founder Finder Lab",
  description:
    "Find founder profiles, contact channels, and personalized outreach drafts from a company website.",
  icons: {
    icon: "/fevicon.png",
    shortcut: "/fevicon.png",
    apple: "/fevicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[linear-gradient(160deg,#f9f3e8_0%,#f1ebdd_100%)] font-['IBM_Plex_Sans','Avenir_Next','Segoe_UI',sans-serif] text-[#171311] antialiased">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
