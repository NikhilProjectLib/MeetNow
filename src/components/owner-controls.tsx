"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Player } from "@/types";
import { useActivityStore } from "@/stores/activity-store";
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
    setEditForm({ name: activity.name, location: activity.location, date: activity.date, time: activity.time, playersNeeded: activity.playersNeeded, description: activity.description });
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
    <div className="p-5 rounded-2xl border-2 border-[#E2E2E2] dark:border-[#333333] bg-[#FFFFFF] dark:bg-[#141414]">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-4 w-4 text-[#000000] dark:text-[#FFFFFF]" />
        <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">Owner Controls</h3>
      </div>

      {/* Actions */}
      {!isEditing && !showDeleteConfirm && !playerToRemove && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F6F6F6] dark:bg-[#1A1A1A] hover:bg-[#EEEEEE] dark:hover:bg-[#262626] transition-colors text-left"
          >
            <Pencil className="h-4 w-4 text-[#000000] dark:text-[#FFFFFF]" />
            <span className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">Edit Activity</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFF0ED] dark:bg-[#1A0500] hover:bg-[#FFE0DB] dark:hover:bg-[#2A0800] transition-colors text-left"
          >
            <Trash2 className="h-4 w-4 text-[#E11900]" />
            <span className="text-sm font-medium text-[#E11900]">Delete Activity</span>
          </button>

          {/* Remove Players */}
          {activity.players.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#E2E2E2] dark:border-[#333333]">
              <p className="text-xs font-semibold text-[#6B6B6B] mb-2 flex items-center gap-1">
                <UserMinus className="h-3.5 w-3.5" />
                Remove a player
              </p>
              <div className="flex flex-col gap-1">
                {activity.players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#F6F6F6] dark:bg-[#333333] flex items-center justify-center text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">
                        {player.name[0]}
                      </div>
                      <span className="text-sm text-[#000000] dark:text-[#FFFFFF]">{player.name}</span>
                    </div>
                    <button
                      onClick={() => setPlayerToRemove(player)}
                      className="text-xs font-medium text-[#E11900] hover:underline"
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
            <label className="text-xs font-semibold text-[#000000] dark:text-[#FFFFFF] mb-1 block">Name</label>
            <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#000000] dark:text-[#FFFFFF] mb-1 block">Location</label>
            <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              className="w-full px-3 py-2 bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-[#000000] dark:text-[#FFFFFF] mb-1 block">Date</label>
              <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="w-full px-3 py-2 bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#000000] dark:text-[#FFFFFF] mb-1 block">Time</label>
              <input type="time" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                className="w-full px-3 py-2 bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF]" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#000000] dark:text-[#FFFFFF] mb-1 block">Players Needed</label>
            <input type="number" min={activity.playersJoined || 2} value={editForm.playersNeeded} onChange={(e) => setEditForm({ ...editForm, playersNeeded: parseInt(e.target.value) || 2 })}
              className="w-20 px-3 py-2 bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF]" />
          </div>
          <div className="flex gap-2 mt-1">
            <button onClick={handleSaveEdit} className="uber-btn text-xs px-4 py-2 gap-1.5"><Save className="h-3.5 w-3.5" />Save</button>
            <button onClick={handleCancelEdit} className="uber-btn uber-btn-secondary text-xs px-4 py-2 gap-1.5"><X className="h-3.5 w-3.5" />Cancel</button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#FFF0ED] dark:bg-[#1A0500] border border-[#E11900]/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#E11900]" />
            <p className="text-sm font-semibold text-[#E11900]">Delete this activity?</p>
          </div>
          <p className="text-xs text-[#6B6B6B]">This will permanently remove the activity. Members will no longer see it.</p>
          <div className="flex gap-2">
            <button onClick={handleDelete} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E11900] text-[#FFFFFF] text-xs font-medium hover:bg-[#C41600] transition-colors">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
            <button onClick={() => setShowDeleteConfirm(false)} className="uber-btn uber-btn-secondary text-xs px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      {/* Remove Player Confirm */}
      {playerToRemove && (
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#FFF8E1] dark:bg-[#1A1500] border border-[#FFB800]/30">
          <div className="flex items-center gap-2">
            <UserMinus className="h-4 w-4 text-[#F9A825]" />
            <p className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">Remove {playerToRemove.name}?</p>
          </div>
          <p className="text-xs text-[#6B6B6B]">They will be removed and their spot will open up.</p>
          <div className="flex gap-2">
            <button onClick={() => handleRemovePlayer(playerToRemove)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F9A825] text-[#000000] text-xs font-medium hover:bg-[#F5B800] transition-colors">
              Remove
            </button>
            <button onClick={() => setPlayerToRemove(null)} className="uber-btn uber-btn-secondary text-xs px-4 py-2">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
