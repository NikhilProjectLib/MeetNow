import type { Metadata } from "next";
import { ActivityDetail } from "./activity-detail";
import { formatWhen, getPublicActivity, SITE_URL, spotsLabel } from "@/lib/activity-server";

type Props = { params: Promise<{ id: string }> };

/**
 * Link previews (WhatsApp, Instagram, iMessage, X…) — crawlers read these tags
 * without running JS, so every shared activity advertises Meelo.
 * The preview image comes from ./opengraph-image.tsx.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const activity = await getPublicActivity(id);
  const url = `${SITE_URL}/activity/${id}`;

  if (!activity) {
    return {
      title: "Activity not found · Meelo",
      description: "Find and join nearby activities on Meelo.",
      alternates: { canonical: url },
    };
  }

  const title = `${activity.emoji} ${activity.name}`;
  const when = formatWhen(activity.date, activity.time);
  const description = [when, activity.location, spotsLabel(activity)].filter(Boolean).join(" · ") +
    " — Join on Meelo";

  return {
    title: `${title} · Meelo`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "Meelo",
      url,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ActivityPage({ params }: Props) {
  const { id } = await params;
  const initialActivity = await getPublicActivity(id);
  return <ActivityDetail id={id} initialActivity={initialActivity} />;
}
