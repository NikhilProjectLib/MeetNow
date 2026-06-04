"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CalendarPickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
  onClose: () => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarPicker({ selectedDate, onSelect, onClose }: CalendarPickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = useState(
    selectedDate ? new Date(selectedDate).getMonth() : today.getMonth()
  );
  const [viewYear, setViewYear] = useState(
    selectedDate ? new Date(selectedDate).getFullYear() : today.getFullYear()
  );

  const todayStr = today.toISOString().split("T")[0];

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days: (number | null)[] = [];

    // Leading blanks
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [viewMonth, viewYear]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const canGoPrev = () => {
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const lastDayOfPrev = new Date(prevYear, prevMonth + 1, 0);
    return lastDayOfPrev >= today;
  };

  const getDateStr = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${viewYear}-${m}-${d}`;
  };

  const isBeforeToday = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isToday = (day: number) => getDateStr(day) === todayStr;
  const isSelected = (day: number) => getDateStr(day) === selectedDate;

  const handleSelect = (day: number) => {
    if (isBeforeToday(day)) return;
    onSelect(getDateStr(day));
    onClose();
  };

  return (
    <div className="absolute top-full left-0 mt-2 z-50 w-[340px] rounded-xl border bg-card shadow-xl p-4 animate-in fade-in-0 zoom-in-95">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          disabled={!canGoPrev()}
          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`blank-${idx}`} className="h-9" />;
          }

          const disabled = isBeforeToday(day);
          const selected = isSelected(day);
          const todayHighlight = isToday(day);

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(day)}
              className={cn(
                "h-9 w-full rounded-lg text-sm transition-all flex items-center justify-center",
                disabled && "text-muted-foreground/40 cursor-not-allowed",
                !disabled && !selected && "hover:bg-primary/10 cursor-pointer",
                selected && "bg-primary text-primary-foreground font-semibold",
                todayHighlight && !selected && "border border-primary text-primary font-medium"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <button
          type="button"
          onClick={() => { onSelect(todayStr); onClose(); }}
          className="text-xs text-primary hover:underline"
        >
          Select Today
        </button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
