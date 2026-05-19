import type { Metadata } from "next";
import ToastContainer from '@/components/Toast';
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Login - AOI Ticketing System",
  description: "Sign in to Alpha Orion Inc. Ticketing System",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}