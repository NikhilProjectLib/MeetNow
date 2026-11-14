import type { MetadataRoute } from "next";
import { listUpcomingActivityIds, SITE_URL } from "@/lib/activity-server";

// Rebuilt at most hourly so new activities get picked up by search engines
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/explore`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.2 },
  ];
  const activities = await listUpcomingActivityIds();
  return [
    ...pages,
    ...activities.map(({ id }) => ({
      url: `${SITE_URL}/activity/${id}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
