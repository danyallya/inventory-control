import type { Metadata } from "next";
import { Providers } from "./providers";
import { ServiceWorkerRegister } from "./service-worker-register";
export const metadata: Metadata = { title: "Sable Ledger | Inventory", description: "A composed inventory workspace for considered independent retail.", applicationName: "Sable Ledger", manifest: "/manifest.webmanifest", themeColor: "#f4f3ef" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body><ServiceWorkerRegister/><Providers>{children}</Providers></body></html>; }