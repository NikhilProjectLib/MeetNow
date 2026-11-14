import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/activity-server";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal / logged-in pages have nothing to index
      disallow: ["/login", "/create", "/profile", "/my-activities", "/invite"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
