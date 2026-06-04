"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActivityStore } from "@/stores/activity-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
  const [autoDeleteMinutes, setAutoDeleteMinutes] = useState(60); // Default: 1 hour after event

  // Location coordinates
  const [lat, setLat] = useState(userLocation?.lat || 0);
  const [lng, setLng] = useState(userLocation?.lng || 0);

  // Build dynamic categories from existing activities + defaults
  const allCategories = useMemo(() => {
    const existing = new Set(defaultCategories.map((c) => c.id));
    const dynamicFromActivities = activities
      .filter((a) => !existing.has(a.category))
      .map((a) => ({
        id: a.category,
        label: categoryLabels[a.category] || a.category,
        emoji: categoryEmojis[a.category] || "✨",
      }));

    return [...defaultCategories, ...dynamicFromActivities];
  }, [activities]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return showAllCategories ? allCategories : allCategories.slice(0, 8);
    const q = categorySearch.toLowerCase();
    return allCategories.filter(
      (c) => c.label.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [allCategories, categorySearch, showAllCategories]);

  // Popular locations derived from existing activities
  const popularLocations = useMemo(() => {
    const locationCounts: Record<string, number> = {};
    activities.forEach((a) => {
      locationCounts[a.location] = (locationCounts[a.location] || 0) + 1;
    });
    return Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([loc]) => loc);
  }, [activities]);

  const [form, setForm] = useState<CreateActivityForm>({
    name: "",
    location: "",
    date: "",
    time: "",
    playersNeeded: 10,
    category: "cricket",
    description: "",
  });

  // Date helpers
  const today = new Date();
  const getDateString = (daysFromNow: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split("T")[0];
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const todayStr = getDateString(0);
    const tomorrowStr = getDateString(1);
    if (dateStr === todayStr) return "Today";
    if (dateStr === tomorrowStr) return "Tomorrow";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
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
    setShowCustomInput(false);
    setCustomCategoryName("");
    setCategorySearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCreateForm(form);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Calculate expiresAt based on event time + auto-delete duration
    let expiresAt: string | undefined;
    let autoDeleteAfter: string | undefined;
    if (autoDeleteMinutes >= 0 && form.date && form.time) {
      const eventEnd = new Date(`${form.date}T${form.time}`);
      eventEnd.setMinutes(eventEnd.getMinutes() + autoDeleteMinutes);
      expiresAt = eventEnd.toISOString();
      const opt = autoDeleteOptions.find((o) => o.value === autoDeleteMinutes);
      autoDeleteAfter = opt?.label || `${autoDeleteMinutes} minutes after event`;
    }

    const activityData = {
      ...form,
      emoji: categoryEmojis[form.category] || "✨",
      lat: lat || userLocation?.lat || 0,
      lng: lng || userLocation?.lng || 0,
      distance: "0 km",
      playersJoined: 0,
      players: [],
      createdBy: currentUser?.id || "anonymous",
      ...(expiresAt && { expiresAt }),
      ...(autoDeleteAfter && { autoDeleteAfter }),
    };

    try {
      if (isFirebaseConnected) {
        await addActivity(activityData);
      } else {
        await addActivity(activityData);
      }
      setIsSubmitting(false);
      setShowSuccess(true);
    } catch (err) {
      console.error("Failed to create activity:", err);
      await addActivity(activityData);
      setIsSubmitting(false);
      setShowSuccess(true);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Create Activity</h1>
        <p className="text-muted-foreground mt-1">Set up your event and invite others to join</p>
        {isFirebaseConnected && (
          <p className="text-xs text-green-600 mt-1">🟢 Connected — activity will be visible to all users instantly</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Activity Name */}
            <Card>
              <CardContent className="p-5">
                <label className="text-sm font-medium mb-2 block">Activity Name</label>
                <Input
                  placeholder="e.g., Evening Cricket Match, Yoga in the Park..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="text-base"
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </CardContent>
            </Card>

            {/* Category - Dynamic with search and custom */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Category</label>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Custom category
                  </button>
                </div>

                {/* Search categories */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    className="pl-9 h-9 text-sm"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />
                </div>

                {/* Custom category input */}
                {showCustomInput && (
                  <div className="flex gap-2 mb-3 p-3 rounded-lg bg-secondary/50 border">
                    <Input
                      placeholder="Emoji"
                      className="w-16 text-center text-lg h-9"
                      value={customCategoryEmoji}
                      onChange={(e) => setCustomCategoryEmoji(e.target.value.slice(-2))}
                      maxLength={2}
                    />
                    <Input
                      placeholder="Category name (e.g., Skateboarding)"
                      className="flex-1 h-9 text-sm"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                    />
                    <Button type="button" size="sm" onClick={handleAddCustomCategory}>
                      Add
                    </Button>
                  </div>
                )}

                {/* Category grid */}
                <div className="flex flex-wrap gap-2">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.id })}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-sm transition-all border",
                        form.category === cat.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                      )}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>

                {!categorySearch && !showAllCategories && allCategories.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setShowAllCategories(true)}
                    className="text-xs text-primary hover:underline mt-2"
                  >
                    Show all {allCategories.length} categories
                  </button>
                )}

                {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
              </CardContent>
            </Card>

            {/* Location with GPS + suggestions */}
            <Card>
              <CardContent className="p-5">
                <LocationPicker
                  location={form.location}
                  lat={lat}
                  lng={lng}
                  onLocationChange={(loc) => setForm({ ...form, location: loc })}
                  onCoordsChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }}
                  error={errors.location}
                  popularLocations={popularLocations}
                />
              </CardContent>
            </Card>

            {/* Date - Quick picks + Calendar Popup */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">When</label>
                </div>

                {/* Quick date picks */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  {quickDates.map((qd) => (
                    <button
                      key={qd.label}
                      type="button"
                      onClick={() => setForm({ ...form, date: qd.value })}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm transition-all border",
                        form.date === qd.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary/50"
                      )}
                    >
                      {qd.label}
                    </button>
                  ))}
                </div>

                {/* Calendar button + selected display */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm",
                        showCalendar
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>{form.date ? formatDateLabel(form.date) : "Pick a date"}</span>
                    </button>

                    {form.date && (
                      <span className="text-sm text-muted-foreground">
                        {new Date(form.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  {/* Calendar Popup */}
                  {showCalendar && (
                    <CalendarPicker
                      selectedDate={form.date}
                      onSelect={(date) => setForm({ ...form, date })}
                      onClose={() => setShowCalendar(false)}
                    />
                  )}
                </div>

                {errors.date && <p className="text-xs text-destructive mt-2">{errors.date}</p>}
              </CardContent>
            </Card>

            {/* Time - Quick slots */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Time</label>
                </div>

                {/* Quick time slots */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {quickTimeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setForm({ ...form, time: slot.time })}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border",
                        form.time === slot.time
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary/50"
                      )}
                    >
                      <span>{slot.icon}</span>
                      <span>{slot.label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom time */}
                <div className="flex items-center gap-3">
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-40"
                  />
                  <span className="text-xs text-muted-foreground">or pick a slot above</span>
                </div>
                {errors.time && <p className="text-xs text-destructive mt-1">{errors.time}</p>}
              </CardContent>
            </Card>

            {/* Players needed - presets */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Group Size</label>
                </div>

                {/* Quick presets */}
                <div className="flex gap-2 mb-3">
                  {playerPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setForm({ ...form, playersNeeded: preset.value })}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm transition-all border",
                        form.playersNeeded === preset.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary/50"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={2}
                    max={500}
                    value={form.playersNeeded}
                    onChange={(e) => setForm({ ...form, playersNeeded: parseInt(e.target.value) || 2 })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">players needed</span>
                </div>
                {errors.playersNeeded && <p className="text-xs text-destructive mt-1">{errors.playersNeeded}</p>}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-5">
                <label className="text-sm font-medium mb-2 block">Description (optional)</label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="What should people know? Skill level, what to bring, meeting point..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </CardContent>
            </Card>

            {/* Auto-Delete Timer */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Auto-delete activity</label>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Activity will be automatically removed after the selected time
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {autoDeleteOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAutoDeleteMinutes(opt.value)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm text-left transition-all border",
                        autoDeleteMinutes === opt.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary/50"
                      )}
                    >
                      <span className="font-medium block text-xs">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Creating...</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Activity
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardContent className="p-5">
              <h3 className="text-sm font-medium mb-4 text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Live Preview
              </h3>
              <div className="flex flex-col gap-3 p-4 rounded-xl border bg-secondary/20">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{categoryEmojis[form.category] || "✨"}</span>
                  <div>
                    <p className="font-semibold text-sm">{form.name || "Your Activity"}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {categoryLabels[form.category] || form.category}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1.5">
                  <p className="flex items-center gap-1.5">📍 {form.location || "Location"}</p>
                  <p className="flex items-center gap-1.5">
                    📅 {form.date ? formatDateLabel(form.date) : "Date"} • {form.time || "Time"}
                  </p>
                  <p className="flex items-center gap-1.5">👥 0/{form.playersNeeded} players</p>
                  {lat !== 0 && (
                    <p className="flex items-center gap-1.5">📌 GPS: {lat.toFixed(3)}, {lng.toFixed(3)}</p>
                  )}
                </div>
                {form.description && (
                  <p className="text-xs text-muted-foreground border-t pt-2 mt-1 line-clamp-3">
                    {form.description}
                  </p>
                )}

                {/* Capacity bar preview */}
                <div className="mt-1">
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-primary rounded-full" />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {isFirebaseConnected
                      ? "Will be visible to all users instantly"
                      : "Preview mode — connect Firebase for real-time sync"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        title="Activity Created!"
        message="Your activity is now live and visible to everyone nearby. People can join anytime!"
        onClose={() => router.push("/")}
      />
    </div>
  );
}
