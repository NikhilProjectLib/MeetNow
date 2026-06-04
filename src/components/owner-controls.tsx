"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Player } from "@/types";
import { useActivityStore } from "@/stores/activity-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Settings,
  Trash2,
  UserMinus,
  Pencil,
  Save,
  X,
  AlertTriangle,
  Shield,
} from "lucide-react";

interface OwnerControlsProps {
  activity: Activity;
}

export function OwnerControls({ activity }: OwnerControlsProps) {
  const router = useRouter();
  const { updateActivity, deleteActivity, removePlayer } = useActivityStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: activity.name,
    location: activity.location,
    date: activity.date,
    time: activity.time,
    playersNeeded: activity.playersNeeded,
    description: activity.description,
  });

  const handleSaveEdit = () => {
    updateActivity(activity.id, editForm);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: activity.name,
      location: activity.location,
      date: activity.date,
      time: activity.time,
      playersNeeded: activity.playersNeeded,
      description: activity.description,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteActivity(activity.id);
    router.push("/");
  };

  const handleRemovePlayer = (player: Player) => {
    removePlayer(activity.id, player.id);
    setPlayerToRemove(null);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Owner Controls</h3>
        </div>

        {/* Action Buttons */}
        {!isEditing && !showDeleteConfirm && !playerToRemove && (
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit Activity Details
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="text-destructive">Delete Activity</span>
            </Button>

            {/* Remove Players Section */}
            {activity.players.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <UserMinus className="h-3.5 w-3.5" />
                  Remove a player
                </p>
                <div className="flex flex-col gap-1">
                  {activity.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                          {player.name[0]}
                        </div>
                        <span className="text-sm">{player.name}</span>
                      </div>
                      <button
                        onClick={() => setPlayerToRemove(player)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Location</label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium mb-1 block">Date</label>
                <Input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Time</label>
                <Input
                  type="time"
                  value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Players Needed</label>
              <Input
                type="number"
                min={activity.playersJoined || 2}
                value={editForm.playersNeeded}
                onChange={(e) => setEditForm({ ...editForm, playersNeeded: parseInt(e.target.value) || 2 })}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Description</label>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2 mt-1">
              <Button size="sm" onClick={handleSaveEdit} className="gap-1.5">
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="gap-1.5">
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="flex flex-col gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium">Delete this activity?</p>
            </div>
            <p className="text-xs text-muted-foreground">
              This will permanently remove the activity and all its data. Members will no longer be able to see it.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" onClick={handleDelete} className="gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                Yes, Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Remove Player Confirmation */}
        {playerToRemove && (
          <div className="flex flex-col gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
            <div className="flex items-center gap-2 text-orange-700">
              <UserMinus className="h-4 w-4" />
              <p className="text-sm font-medium">Remove {playerToRemove.name}?</p>
            </div>
            <p className="text-xs text-muted-foreground">
              They will be removed from this activity and their spot will open up for others.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
                onClick={() => handleRemovePlayer(playerToRemove)}
              >
                Remove
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPlayerToRemove(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
