import { notFound } from "next/navigation";
import { canReadLocalInventoryPreview } from "@/lib/local-inventory-preview";
import { CatalogBrowser } from "./catalog-browser";

export const dynamic = "force-dynamic";

export default function CatalogPage() {
  if (!canReadLocalInventoryPreview()) notFound();
  return <CatalogBrowser />;
}
