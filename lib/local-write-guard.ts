import { canReadLocalInventoryPreview } from "@/lib/local-inventory-preview";

function isLoopback(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function canWriteLocalInventory(request: Request): boolean {
  if (!canReadLocalInventoryPreview()) return false;

  try {
    const requestUrl = new URL(request.url);
    const requestHost = request.headers.get("host");
    const origin = request.headers.get("origin");
    const requestHostname = requestHost ? new URL(`http://${requestHost}`).hostname : null;
    if (!isLoopback(requestUrl.hostname) || (requestHostname && !isLoopback(requestHostname))) return false;
    return !origin || isLoopback(new URL(origin).hostname);
  } catch {
    return false;
  }
}
