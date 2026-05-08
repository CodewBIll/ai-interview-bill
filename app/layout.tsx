import type { Metadata } from "next";
import Icon from "@/public/interva.png";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Interview Coach - Mock Interview Simulator",
  icons: {
    icon: [
      {
        url: Icon.src,
        sizes: "64x64",
        type: "image/png",
      }
    ],
  },
  description:
    "Latihan interview teknis dengan AI interviewer profesional. Dapatkan feedback real-time untuk setiap jawaban kamu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className='h-full antialiased'
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>

      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}