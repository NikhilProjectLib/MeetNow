"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActivityStore } from "@/stores/activity-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { validateCreateForm } from "@/lib/validators";
import { CreateActivityForm } from "@/types";
import {
  defaultCategories,
  categoryEmojis,
  categoryLabels,
  quickTimeSlots,
  playerPresets,
  autoDeleteOptions,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Plus, Search, Calendar, Clock, Users, Sparkles } from "lucide-react";
import { CalendarPicker } from "@/components/calendar-picker";
import { LocationPicker } from "@/components/location-picker";
import { SuccessModal } from "@/components/success-modal";

export default function CreatePage() {
  const currentUser = useCurrentUser();
  const { addActivity, activities, isFirebaseConnected, userLocation } = useActivityStore();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categorySearch, setCategorySearch] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [customCategoryEmoji, setCustomCategoryEmoji] = useState("✨");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [autoDeleteMinutes, setAutoDeleteMinutes] = useState(60);

  const [lat, setLat] = useState(userLocation?.lat || 0);
  const [lng, setLng] = useState(userLocation?.lng || 0);

  const allCategories = useMemo(() => {
    const existing = new Set(defaultCategories.map((c) => c.id));
    const dynamicFromActivities = activities
      .filter((a) => !existing.has(a.category))
      .map((a) => ({ id: a.category, label: categoryLabels[a.category] || a.category, emoji: categoryEmojis[a.category] || "✨" }));
    return [...defaultCategories, ...dynamicFromActivities];
  }, [activities]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return showAllCategories ? allCategories : allCategories.slice(0, 8);
    const q = categorySearch.toLowerCase();
    return allCategories.filter((c) => c.label.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }, [allCategories, categorySearch, showAllCategories]);

  const popularLocations = useMemo(() => {
    const locationCounts: Record<string, number> = {};
    activities.forEach((a) => { locationCounts[a.location] = (locationCounts[a.location] || 0) + 1; });
    return Object.entries(locationCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([loc]) => loc);
  }, [activities]);

  const [form, setForm] = useState<CreateActivityForm>({
    name: "", location: "", date: "", time: "", playersNeeded: 10, category: "cricket", description: "",
  });

  const today = new Date();
  const getDateString = (daysFromNow: number) => {
    const d = new Date(today); d.setDate(d.getDate() + daysFromNow); return d.toISOString().split("T")[0];
  };
  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "";
    const todayStr = getDateString(0); const tomorrowStr = getDateString(1);
    if (dateStr === todayStr) return "Today";
    if (dateStr === tomorrowStr) return "Tomorrow";
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };
  const quickDates = [
    { label: "Today", value: getDateString(0) },
    { label: "Tomorrow", value: getDateString(1) },
    { label: "This Weekend", value: getDateString(((6 - today.getDay() + 7) % 7) || 7) },
    { label: "Next Week", value: getDateString(7) },
  ];

  const handleAddCustomCategory = () => {
    if (!customCategoryName.trim()) return;
    const id = customCategoryName.toLowerCase().replace(/\s+/g, "-");
    categoryEmojis[id] = customCategoryEmoji;
    categoryLabels[id] = customCategoryName;
    setForm({ ...form, category: id });
    setShowCustomInput(false); setCustomCategoryName(""); setCategorySearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCreateForm(form);
    if (!validation.valid) { setErrors(validation.errors); return; }
    setErrors({}); setIsSubmitting(true);

    let expiresAt: string | undefined; let autoDeleteAfter: string | undefined;
    if (autoDeleteMinutes >= 0 && form.date && form.time) {
      const eventEnd = new Date(`${form.date}T${form.time}`);
      eventEnd.setMinutes(eventEnd.getMinutes() + autoDeleteMinutes);
      expiresAt = eventEnd.toISOString();
      const opt = autoDeleteOptions.find((o) => o.value === autoDeleteMinutes);
      autoDeleteAfter = opt?.label || `${autoDeleteMinutes} minutes after event`;
    }

    const activityData = {
      ...form, emoji: categoryEmojis[form.category] || "✨",
      lat: lat || userLocation?.lat || 0, lng: lng || userLocation?.lng || 0,
      distance: "0 km", playersJoined: 0, players: [], createdBy: currentUser?.id || "anonymous",
      ...(expiresAt && { expiresAt }), ...(autoDeleteAfter && { autoDeleteAfter }),
    };

    try { await addActivity(activityData); } catch { await addActivity(activityData); }
    setIsSubmitting(false); setShowSuccess(true);
  };

  return (
    <div className="flex flex-col gap-8 px-6 lg:px-14 xl:px-20 py-8 bg-[#FFFFFF] dark:bg-[#000000] min-h-screen max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#000000] dark:text-[#FFFFFF]">Create Activity</h1>
        <p className="text-[#6B6B6B] text-sm mt-1">Set up your event and invite others to join</p>
        {isFirebaseConnected && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="uber-green-dot" style={{ width: 6, height: 6 }} />
            <span className="text-xs text-[#06C167] font-medium">Connected — visible to all users instantly</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Activity Name */}
            <div className="p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
              <label className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF] mb-2 block">Activity Name</label>
              <input
                placeholder="e.g., Evening Cricket Match, Yoga in the Park..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#000000] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF] transition-all"
              />
              {errors.name && <p className="text-xs text-[#E11900] mt-1">{errors.name}</p>}
            </div>

            {/* Category */}
            <div className="p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">Category</label>
                <button type="button" onClick={() => setShowCustomInput(!showCustomInput)} className="text-xs text-[#000000] dark:text-[#FFFFFF] hover:underline flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Custom
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B6B6B]" />
                <input
                  placeholder="Search categories..."
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FFFFFF] dark:bg-[#000000] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF]"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
              </div>

              {/* Custom input */}
              {showCustomInput && (
                <div className="flex gap-2 mb-3 p-3 rounded-xl bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333]">
                  <input placeholder="😀" className="w-14 text-center text-lg py-2 bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-lg outline-none" value={customCategoryEmoji} onChange={(e) => setCustomCategoryEmoji(e.target.value.slice(-2))} maxLength={2} />
                  <input placeholder="Category name" className="flex-1 px-3 py-2 text-sm bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-lg outline-none text-[#000000] dark:text-[#FFFFFF]" value={customCategoryName} onChange={(e) => setCustomCategoryName(e.target.value)} />
                  <button type="button" onClick={handleAddCustomCategory} className="uber-btn text-xs px-4 py-2">Add</button>
                </div>
              )}

              {/* Category chips */}
              <div className="flex flex-wrap gap-2">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id} type="button"
                    onClick={() => setForm({ ...form, category: cat.id })}
                    className={cn("uber-chip", form.category === cat.id && "uber-chip-active")}
                  >
                    <span className="text-sm">{cat.emoji}</span> {cat.label}
                  </button>
                ))}
              </div>
              {!categorySearch && !showAllCategories && allCategories.length > 8 && (
                <button type="button" onClick={() => setShowAllCategories(true)} className="text-xs text-[#000000] dark:text-[#FFFFFF] hover:underline mt-2">
                  Show all {allCategories.length} categories
                </button>
              )}
              {errors.category && <p className="text-xs text-[#E11900] mt-1">{errors.category}</p>}
            </div>

            {/* Location */}
            <div className="p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
              <LocationPicker
                location={form.location} lat={lat} lng={lng}
                onLocationChange={(loc) => setForm({ ...form, location: loc })}
                onCoordsChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }}
                error={errors.location} popularLocations={popularLocations}
              />
            </div>

            {/* Date */}
            <div className="p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-[#6B6B6B]" />
                <label className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">When</label>
              </div>
              <div className="flex gap-2 mb-3 flex-wrap">
                {quickDates.map((qd) => (
                  <button key={qd.label} type="button" onClick={() => setForm({ ...form, date: qd.value })}
                    className={cn("uber-chip", form.date === qd.value && "uber-chip-active")}>
                    {qd.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setShowCalendar(!showCalendar)}
                    className={cn("flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all", showCalendar ? "uber-chip-active" : "uber-chip")}>
                    <Calendar className="h-4 w-4" />
                    <span>{form.date ? formatDateLabel(form.date) : "Pick a date"}</span>
                  </button>
                  {form.date && (
                    <span className="text-sm text-[#6B6B6B]">
                      {new Date(form.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </span>
                  )}
                </div>
                {showCalendar && (
                  <CalendarPicker selectedDate={form.date} onSelect={(date) => setForm({ ...form, date })} onClose={() => setShowCalendar(false)} />
                )}
              </div>
              {errors.date && <p className="text-xs text-[#E11900] mt-2">{errors.date}</p>}
            </div>

            {/* Time */}
            <div className="p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-[#6B6B6B]" />
                <label className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">Time</label>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {quickTimeSlots.map((slot) => (
                  <button key={slot.time} type="button" onClick={() => setForm({ ...form, time: slot.time })}
                    className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all", form.time === slot.time ? "bg-[#000000] text-[#FFFFFF] dark:bg-[#FFFFFF] dark:text-[#000000]" : "bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] hover:border-[#000000] dark:hover:border-[#FFFFFF]")}>
                    <span>{slot.icon}</span><span>{slot.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="px-4 py-2.5 bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] outline-none focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF]" />
                <span className="text-xs text-[#6B6B6B]">or pick a slot above</span>
              </div>
              {errors.time && <p className="text-xs text-[#E11900] mt-1">{errors.time}</p>}
            </div>

            {/* Group Size */}
            <div className="p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-[#6B6B6B]" />
                <label className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">Group Size</label>
              </div>
              <div className="flex gap-2 mb-3">
                {playerPresets.map((preset) => (
                  <button key={preset.label} type="button" onClick={() => setForm({ ...form, playersNeeded: preset.value })}
                    className={cn("uber-chip", form.playersNeeded === preset.value && "uber-chip-active")}>
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input type="number" min={2} max={500} value={form.playersNeeded}
                  onChange={(e) => setForm({ ...form, playersNeeded: parseInt(e.target.value) || 2 })}
                  className="w-20 px-3 py-2.5 bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] outline-none focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF]" />
                <span className="text-sm text-[#6B6B6B]">players needed</span>
              </div>
            </div>

            {/* Description */}
            <div className="p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
              <label className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF] mb-2 block">Description (optional)</label>
              <textarea
                className="w-full min-h-[100px] px-4 py-3 bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] outline-none focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF] resize-none"
                placeholder="What should people know? Skill level, what to bring, meeting point..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Auto-Delete */}
            <div className="p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-[#6B6B6B]" />
                <label className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">Auto-delete</label>
              </div>
              <p className="text-xs text-[#6B6B6B] mb-3">Activity removed automatically after selected time</p>
              <div className="grid grid-cols-2 gap-2">
                {autoDeleteOptions.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setAutoDeleteMinutes(opt.value)}
                    className={cn("uber-chip text-left", autoDeleteMinutes === opt.value && "uber-chip-active")}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting} className="uber-btn w-full py-4 text-[0.9375rem]">
              {isSubmitting ? "Creating..." : "Create Activity"}
            </button>
          </form>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
            <h3 className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF] mb-4 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" /> Live Preview
            </h3>
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333]">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-center text-2xl">
                  {categoryEmojis[form.category] || "✨"}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#000000] dark:text-[#FFFFFF]">{form.name || "Your Activity"}</p>
                  <p className="text-xs text-[#6B6B6B] capitalize">{categoryLabels[form.category] || form.category}</p>
                </div>
              </div>
              <div className="text-xs text-[#6B6B6B] space-y-1.5">
                <p>📍 {form.location || "Location"}</p>
                <p>📅 {form.date ? formatDateLabel(form.date) : "Date"} · {form.time || "Time"}</p>
                <p>👥 0/{form.playersNeeded} players</p>
                {lat !== 0 && <p>📌 GPS: {lat.toFixed(3)}, {lng.toFixed(3)}</p>}
              </div>
              {form.description && (
                <p className="text-xs text-[#6B6B6B] border-t border-[#E2E2E2] dark:border-[#333333] pt-2 mt-1 line-clamp-3">{form.description}</p>
              )}
              <div className="mt-1">
                <div className="h-[4px] bg-[#E2E2E2] dark:bg-[#333333] rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-[#000000] dark:bg-[#FFFFFF] rounded-full" />
                </div>
                <p className="text-[10px] text-[#6B6B6B] mt-1.5">
                  {isFirebaseConnected ? "Visible to all users instantly" : "Preview mode"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        title="Activity Created!"
        message="Your activity is now live and visible to everyone nearby."
        onClose={() => router.push("/")}
      />
    </div>
  );
}
