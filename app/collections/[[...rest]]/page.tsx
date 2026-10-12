import { permanentRedirect } from "next/navigation";

// Old Shopify collection URLs (/collections, /collections/all, …) go to the shop.
export default function OldCollectionUrl() {
  permanentRedirect("/shop");
}
