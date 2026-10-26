import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { ServiceWorkerRegister } from "./service-worker-register";
export const viewport: Viewport = { themeColor: "#f4f3ef", width: "device-width", initialScale: 1 };
export const metadata: Metadata = { title: "Sable Ledger | Inventory", description: "A composed inventory workspace for considered independent retail.", applicationName: "Sable Ledger", manifest: "/manifest.webmanifest" };
export default function RootLayout({children}:{children:ReactNode}) { return <html lang="en"><body><ServiceWorkerRegister/><Providers>{children}</Providers></body></html>; }
