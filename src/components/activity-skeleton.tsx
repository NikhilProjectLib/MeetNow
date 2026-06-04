"use client";

import { Card, CardContent } from "@/components/ui/card";

export function ActivitySkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="h-1 bg-secondary" />
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-secondary" />
          <div className="flex-1">
            <div className="h-4 w-3/4 bg-secondary rounded" />
            <div className="h-3 w-1/3 bg-secondary rounded mt-2" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-3 w-24 bg-secondary rounded" />
          <div className="h-3 w-16 bg-secondary rounded" />
        </div>
        <div className="h-2 w-full bg-secondary rounded-full" />
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            <div className="h-7 w-7 rounded-full bg-secondary" />
            <div className="h-7 w-7 rounded-full bg-secondary" />
            <div className="h-7 w-7 rounded-full bg-secondary" />
          </div>
          <div className="h-8 w-16 bg-secondary rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivitySkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <ActivitySkeleton key={i} />
      ))}
    </div>
  );
}
