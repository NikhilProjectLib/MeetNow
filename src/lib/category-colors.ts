/**
 * Category color system — each category gets a unique color for visual distinction.
 * Used across cards, filters, and badges.
 */
export const categoryColors: Record<string, { bg: string; text: string; border: string; light: string }> = {
  cricket: { bg: "bg-green-500", text: "text-green-700", border: "border-green-200", light: "bg-green-50" },
  football: { bg: "bg-blue-500", text: "text-blue-700", border: "border-blue-200", light: "bg-blue-50" },
  clubbing: { bg: "bg-purple-500", text: "text-purple-700", border: "border-purple-200", light: "bg-purple-50" },
  trekking: { bg: "bg-amber-500", text: "text-amber-700", border: "border-amber-200", light: "bg-amber-50" },
  "bike-ride": { bg: "bg-orange-500", text: "text-orange-700", border: "border-orange-200", light: "bg-orange-50" },
  basketball: { bg: "bg-red-500", text: "text-red-700", border: "border-red-200", light: "bg-red-50" },
  swimming: { bg: "bg-cyan-500", text: "text-cyan-700", border: "border-cyan-200", light: "bg-cyan-50" },
  yoga: { bg: "bg-teal-500", text: "text-teal-700", border: "border-teal-200", light: "bg-teal-50" },
  running: { bg: "bg-lime-500", text: "text-lime-700", border: "border-lime-200", light: "bg-lime-50" },
  badminton: { bg: "bg-indigo-500", text: "text-indigo-700", border: "border-indigo-200", light: "bg-indigo-50" },
  tennis: { bg: "bg-yellow-500", text: "text-yellow-700", border: "border-yellow-200", light: "bg-yellow-50" },
  gaming: { bg: "bg-violet-500", text: "text-violet-700", border: "border-violet-200", light: "bg-violet-50" },
  movies: { bg: "bg-rose-500", text: "text-rose-700", border: "border-rose-200", light: "bg-rose-50" },
  food: { bg: "bg-orange-500", text: "text-orange-700", border: "border-orange-200", light: "bg-orange-50" },
  study: { bg: "bg-sky-500", text: "text-sky-700", border: "border-sky-200", light: "bg-sky-50" },
  music: { bg: "bg-fuchsia-500", text: "text-fuchsia-700", border: "border-fuchsia-200", light: "bg-fuchsia-50" },
  photography: { bg: "bg-slate-500", text: "text-slate-700", border: "border-slate-200", light: "bg-slate-50" },
  volunteering: { bg: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-200", light: "bg-emerald-50" },
  other: { bg: "bg-gray-500", text: "text-gray-700", border: "border-gray-200", light: "bg-gray-50" },
};

export function getCategoryColor(category: string) {
  return categoryColors[category] || categoryColors.other;
}

/**
 * Get urgency label and color based on how soon the activity starts.
 */
export function getUrgencyInfo(date: string, time: string): { label: string; color: string; bgColor: string } | null {
  const activityDate = new Date(`${date}T${time || "23:59"}`);
  const now = new Date();
  const diffMs = activityDate.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 0) {
    return { label: "Started", color: "text-gray-600", bgColor: "bg-gray-100" };
  }
  if (diffMins <= 30) {
    return { label: "Starting soon!", color: "text-red-700", bgColor: "bg-red-50" };
  }
  if (diffMins <= 60) {
    return { label: `In ${diffMins}m`, color: "text-orange-700", bgColor: "bg-orange-50" };
  }
  if (diffMins <= 180) {
    const hours = Math.floor(diffMins / 60);
    return { label: `In ${hours}h`, color: "text-amber-700", bgColor: "bg-amber-50" };
  }
  if (diffMins <= 1440) {
    const hours = Math.floor(diffMins / 60);
    return { label: `In ${hours}h`, color: "text-blue-700", bgColor: "bg-blue-50" };
  }
  return null; // More than 24h, no urgency badge
}
