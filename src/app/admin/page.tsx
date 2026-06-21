"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import {
  isAdminEmail,
  getAppConfig,
  updateAppConfig,
  getSubscriptionTiers,
  updateSubscriptionTier,
  createSubscriptionTier,
  deleteSubscriptionTier,
  getAllUsers,
  grantPremium,
  revokePremium,
  banUser,
  unbanUser,
  AppConfig,
  SubscriptionTier,
  AdminUserRecord,
} from "@/lib/admin-service";
import {
  Shield, Users, Settings, CreditCard, Crown, Ban,
  Check, X, Plus, Trash2, Save, RefreshCw, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

type Tab = "users" | "plans" | "config";

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("users");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [userSearch, setUserSearch] = useState("");

  // Admin access check
  useEffect(() => {
    if (user && !isAdminEmail(user.email)) {
      router.push("/");
      toast.error("Access denied");
    }
  }, [user, router]);

  // Load data
  useEffect(() => {
    if (!user || !isAdminEmail(user.email)) return;
    loadAll();
  }, [user]);

  async function loadAll() {
    setLoading(true);
    try {
      const [u, t, c] = await Promise.all([
        getAllUsers(), getSubscriptionTiers(), getAppConfig(),
      ]);
      setUsers(u); setTiers(t); setConfig(c);
    } catch (err) { toast.error("Failed to load admin data"); }
    setLoading(false);
  }

  if (!user || !isAdminEmail(user.email)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto text-[#E11900] mb-4" />
          <h1 className="text-xl font-black">Admin Access Only</h1>
          <p className="text-sm text-[#6B6B6B] mt-2">You don&apos;t have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-[#7C3AED] border-t-transparent rounded-full" />
      </div>
    );
  }

  const filteredUsers = users.filter((u) =>
    u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.uid.includes(userSearch)
  );

  return (
    <div className="flex flex-col gap-6 px-6 lg:px-14 xl:px-20 py-8 bg-[#FFFFFF] dark:bg-[#000000] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#000000] dark:text-[#FFFFFF] flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#7C3AED]" /> Admin Panel
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-1">Manage users, plans, and app settings</p>
        </div>
        <button onClick={loadAll} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F6F6F6] dark:bg-[#1A1A1A] text-sm font-medium hover:bg-[#E2E2E2] dark:hover:bg-[#333333] transition-colors">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={users.length} icon={Users} />
        <StatCard label="Premium Users" value={users.filter(u => u.isPremium).length} icon={Crown} />
        <StatCard label="Banned" value={users.filter(u => u.isBanned).length} icon={Ban} />
        <StatCard label="Plans" value={tiers.length} icon={CreditCard} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E2E2E2] dark:border-[#333333]">
        {([
          { id: "users", label: "Users", icon: Users },
          { id: "plans", label: "Plans & Limits", icon: CreditCard },
          { id: "config", label: "App Config", icon: Settings },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === id ? "border-[#7C3AED] text-[#7C3AED]" : "border-transparent text-[#6B6B6B] hover:text-[#000000] dark:hover:text-[#FFFFFF]"
            }`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "users" && <UsersTab users={filteredUsers} search={userSearch} setSearch={setUserSearch} tiers={tiers} onRefresh={loadAll} />}
      {tab === "plans" && <PlansTab tiers={tiers} onRefresh={loadAll} />}
      {tab === "config" && config && <ConfigTab config={config} onRefresh={loadAll} />}
    </div>
  );
}

// ========== STAT CARD ==========
function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="p-4 rounded-xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-black text-[#000000] dark:text-[#FFFFFF]">{value}</span>
        <Icon className="h-5 w-5 text-[#6B6B6B]" />
      </div>
      <p className="text-xs text-[#6B6B6B] mt-1">{label}</p>
    </div>
  );
}

// ========== USERS TAB ==========
function UsersTab({ users, search, setSearch, tiers, onRefresh }: {
  users: AdminUserRecord[]; search: string; setSearch: (s: string) => void;
  tiers: SubscriptionTier[]; onRefresh: () => void;
}) {
  const handleGrant = async (uid: string) => {
    await grantPremium(uid); toast.success("Premium granted"); onRefresh();
  };
  const handleRevoke = async (uid: string) => {
    await revokePremium(uid); toast.success("Premium revoked"); onRefresh();
  };
  const handleBan = async (uid: string) => {
    const reason = prompt("Ban reason:");
    if (!reason) return;
    await banUser(uid, reason); toast.success("User banned"); onRefresh();
  };
  const handleUnban = async (uid: string) => {
    await unbanUser(uid); toast.success("User unbanned"); onRefresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        placeholder="Search by name, email, or UID..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-3 bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-xl text-sm outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#7C3AED]"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#6B6B6B] border-b border-[#E2E2E2] dark:border-[#333333]">
              <th className="py-3 px-2">User</th>
              <th className="py-3 px-2">Tier</th>
              <th className="py-3 px-2">Referrals</th>
              <th className="py-3 px-2">Status</th>
              <th className="py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid} className="border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A]">
                <td className="py-3 px-2">
                  <p className="font-medium text-[#000000] dark:text-[#FFFFFF]">{u.displayName || "—"}</p>
                  <p className="text-xs text-[#6B6B6B]">{u.email || u.uid.slice(0, 12)}</p>
                </td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    u.isPremium ? "bg-[#7C3AED]/10 text-[#7C3AED]" : "bg-[#E2E2E2] dark:bg-[#333333] text-[#6B6B6B]"
                  }`}>
                    {u.tier || "free"}
                  </span>
                </td>
                <td className="py-3 px-2 text-[#000000] dark:text-[#FFFFFF]">{u.referralCount}</td>
                <td className="py-3 px-2">
                  {u.isBanned ? (
                    <span className="text-xs text-[#E11900] font-semibold">Banned</span>
                  ) : (
                    <span className="text-xs text-[#06C167] font-semibold">Active</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  <div className="flex gap-1">
                    {!u.isPremium ? (
                      <button onClick={() => handleGrant(u.uid)} title="Grant Premium"
                        className="p-1.5 rounded-lg hover:bg-[#7C3AED]/10 text-[#7C3AED]"><Crown className="h-4 w-4" /></button>
                    ) : (
                      <button onClick={() => handleRevoke(u.uid)} title="Revoke Premium"
                        className="p-1.5 rounded-lg hover:bg-[#E11900]/10 text-[#E11900]"><X className="h-4 w-4" /></button>
                    )}
                    {!u.isBanned ? (
                      <button onClick={() => handleBan(u.uid)} title="Ban User"
                        className="p-1.5 rounded-lg hover:bg-[#E11900]/10 text-[#E11900]"><Ban className="h-4 w-4" /></button>
                    ) : (
                      <button onClick={() => handleUnban(u.uid)} title="Unban User"
                        className="p-1.5 rounded-lg hover:bg-[#06C167]/10 text-[#06C167]"><Check className="h-4 w-4" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center text-[#6B6B6B] py-8">No users found</p>
        )}
      </div>
    </div>
  );
}

// ========== PLANS TAB ==========
function PlansTab({ tiers, onRefresh }: { tiers: SubscriptionTier[]; onRefresh: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<SubscriptionTier>>({});
  const [showNew, setShowNew] = useState(false);
  const [newTier, setNewTier] = useState<Partial<SubscriptionTier>>({
    id: "", name: "", description: "", price: 0, currency: "INR",
    billingCycle: "monthly", isActive: true, order: tiers.length, color: "#7C3AED",
    limits: { maxActivitiesPerDay: 5, maxJoinedActivities: 10, maxPlayersPerActivity: 50,
      canCustomCategory: true, canShareWhatsApp: true, adFree: true, priorityListing: false, premiumBadge: false },
  });

  const startEdit = (tier: SubscriptionTier) => { setEditingId(tier.id); setEditData(tier); };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await updateSubscriptionTier(editingId, editData);
      toast.success(`Plan "${editingId}" updated`);
      setEditingId(null); onRefresh();
    } catch { toast.error("Failed to save"); }
  };

  const handleCreateTier = async () => {
    if (!newTier.id || !newTier.name) { toast.error("ID and Name required"); return; }
    try {
      await createSubscriptionTier(newTier as SubscriptionTier);
      toast.success(`Plan "${newTier.name}" created`);
      setShowNew(false); onRefresh();
    } catch { toast.error("Failed to create"); }
  };

  const handleDelete = async (id: string) => {
    if (id === "free") { toast.error("Cannot delete the free plan"); return; }
    if (!confirm(`Delete plan "${id}"?`)) return;
    await deleteSubscriptionTier(id);
    toast.success("Plan deleted"); onRefresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-[#6B6B6B]">Configure what each plan offers. Changes apply to all users immediately.</p>
        <button onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-colors">
          <Plus className="h-4 w-4" /> Add Plan
        </button>
      </div>

      {/* New Plan Form */}
      {showNew && (
        <div className="p-5 rounded-xl bg-[#F6F6F6] dark:bg-[#1A1A1A] border border-[#7C3AED]/30">
          <h3 className="font-semibold text-sm mb-3">New Subscription Plan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <input placeholder="Plan ID (e.g. pro)" value={newTier.id || ""} onChange={(e) => setNewTier({ ...newTier, id: e.target.value.toLowerCase().replace(/\s/g, "-") })} className="admin-input" />
            <input placeholder="Display Name" value={newTier.name || ""} onChange={(e) => setNewTier({ ...newTier, name: e.target.value })} className="admin-input" />
            <input placeholder="Price" type="number" value={newTier.price || 0} onChange={(e) => setNewTier({ ...newTier, price: Number(e.target.value) })} className="admin-input" />
            <select value={newTier.billingCycle} onChange={(e) => setNewTier({ ...newTier, billingCycle: e.target.value as any })} className="admin-input">
              <option value="free">Free</option><option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option><option value="lifetime">Lifetime</option>
            </select>
          </div>
          <h4 className="text-xs font-semibold text-[#6B6B6B] mb-2">Limits</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <LimitInput label="Activities/Day" value={newTier.limits?.maxActivitiesPerDay || 5} onChange={(v) => setNewTier({ ...newTier, limits: { ...newTier.limits!, maxActivitiesPerDay: v } })} />
            <LimitInput label="Max Joined" value={newTier.limits?.maxJoinedActivities || 10} onChange={(v) => setNewTier({ ...newTier, limits: { ...newTier.limits!, maxJoinedActivities: v } })} />
            <LimitInput label="Max Players" value={newTier.limits?.maxPlayersPerActivity || 50} onChange={(v) => setNewTier({ ...newTier, limits: { ...newTier.limits!, maxPlayersPerActivity: v } })} />
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <ToggleChip label="Ad-Free" checked={newTier.limits?.adFree || false} onChange={(v) => setNewTier({ ...newTier, limits: { ...newTier.limits!, adFree: v } })} />
            <ToggleChip label="Custom Category" checked={newTier.limits?.canCustomCategory || false} onChange={(v) => setNewTier({ ...newTier, limits: { ...newTier.limits!, canCustomCategory: v } })} />
            <ToggleChip label="Priority Listing" checked={newTier.limits?.priorityListing || false} onChange={(v) => setNewTier({ ...newTier, limits: { ...newTier.limits!, priorityListing: v } })} />
            <ToggleChip label="Premium Badge" checked={newTier.limits?.premiumBadge || false} onChange={(v) => setNewTier({ ...newTier, limits: { ...newTier.limits!, premiumBadge: v } })} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreateTier} className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-semibold hover:bg-[#6D28D9]">Create Plan</button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 bg-[#E2E2E2] dark:bg-[#333333] rounded-lg text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      {/* Existing Plans */}
      <div className="flex flex-col gap-4">
        {tiers.map((tier) => (
          <div key={tier.id} className="p-5 rounded-xl bg-[#F6F6F6] dark:bg-[#1A1A1A] border border-[#E2E2E2] dark:border-[#333333]">
            {editingId === tier.id ? (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div><label className="text-[10px] text-[#6B6B6B]">Name</label><input value={editData.name || ""} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="admin-input" /></div>
                  <div><label className="text-[10px] text-[#6B6B6B]">Price</label><input type="number" value={editData.price || 0} onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })} className="admin-input" /></div>
                  <div><label className="text-[10px] text-[#6B6B6B]">Billing</label>
                    <select value={editData.billingCycle || "free"} onChange={(e) => setEditData({ ...editData, billingCycle: e.target.value as any })} className="admin-input">
                      <option value="free">Free</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option><option value="lifetime">Lifetime</option>
                    </select>
                  </div>
                  <div><label className="text-[10px] text-[#6B6B6B]">Active</label>
                    <select value={editData.isActive ? "yes" : "no"} onChange={(e) => setEditData({ ...editData, isActive: e.target.value === "yes" })} className="admin-input">
                      <option value="yes">Yes</option><option value="no">No</option>
                    </select>
                  </div>
                </div>
                <h4 className="text-xs font-semibold text-[#6B6B6B] mb-2">Limits</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <LimitInput label="Activities/Day" value={editData.limits?.maxActivitiesPerDay || 2} onChange={(v) => setEditData({ ...editData, limits: { ...editData.limits!, maxActivitiesPerDay: v } })} />
                  <LimitInput label="Max Joined" value={editData.limits?.maxJoinedActivities || 5} onChange={(v) => setEditData({ ...editData, limits: { ...editData.limits!, maxJoinedActivities: v } })} />
                  <LimitInput label="Max Players" value={editData.limits?.maxPlayersPerActivity || 20} onChange={(v) => setEditData({ ...editData, limits: { ...editData.limits!, maxPlayersPerActivity: v } })} />
                </div>
                <div className="flex flex-wrap gap-3 mb-4">
                  <ToggleChip label="Ad-Free" checked={editData.limits?.adFree || false} onChange={(v) => setEditData({ ...editData, limits: { ...editData.limits!, adFree: v } })} />
                  <ToggleChip label="Custom Category" checked={editData.limits?.canCustomCategory || false} onChange={(v) => setEditData({ ...editData, limits: { ...editData.limits!, canCustomCategory: v } })} />
                  <ToggleChip label="Priority Listing" checked={editData.limits?.priorityListing || false} onChange={(v) => setEditData({ ...editData, limits: { ...editData.limits!, priorityListing: v } })} />
                  <ToggleChip label="Premium Badge" checked={editData.limits?.premiumBadge || false} onChange={(v) => setEditData({ ...editData, limits: { ...editData.limits!, premiumBadge: v } })} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex items-center gap-1 px-4 py-2 bg-[#06C167] text-white rounded-lg text-sm font-semibold"><Save className="h-3.5 w-3.5" /> Save</button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-[#E2E2E2] dark:bg-[#333333] rounded-lg text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tier.color }} />
                    <h3 className="font-bold text-[#000000] dark:text-[#FFFFFF]">{tier.name}</h3>
                    {tier.price > 0 && <span className="text-xs text-[#6B6B6B]">₹{tier.price}/{tier.billingCycle}</span>}
                    {!tier.isActive && <span className="text-[10px] px-2 py-0.5 bg-[#E11900]/10 text-[#E11900] rounded-full font-semibold">Inactive</span>}
                  </div>
                  <p className="text-xs text-[#6B6B6B] mt-1">
                    {tier.limits.maxActivitiesPerDay} creates/day · {tier.limits.maxJoinedActivities} joins · {tier.limits.maxPlayersPerActivity} players
                    {tier.limits.adFree && " · Ad-free"}{tier.limits.premiumBadge && " · Badge"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(tier)} className="p-2 rounded-lg hover:bg-[#E2E2E2] dark:hover:bg-[#333333]"><Settings className="h-4 w-4 text-[#6B6B6B]" /></button>
                  {tier.id !== "free" && <button onClick={() => handleDelete(tier.id)} className="p-2 rounded-lg hover:bg-[#E11900]/10"><Trash2 className="h-4 w-4 text-[#E11900]" /></button>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== CONFIG TAB ==========
function ConfigTab({ config, onRefresh }: { config: AppConfig; onRefresh: () => void }) {
  const [form, setForm] = useState<AppConfig>(config);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAppConfig(form);
      toast.success("App config saved");
      onRefresh();
    } catch { toast.error("Failed to save config"); }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="p-5 rounded-xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
        <h3 className="font-semibold text-sm mb-4 text-[#000000] dark:text-[#FFFFFF]">General Settings</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">Referrals for Premium</p><p className="text-xs text-[#6B6B6B]">How many referrals to earn premium</p></div>
            <input type="number" min={1} max={50} value={form.referralsForPremium} onChange={(e) => setForm({ ...form, referralsForPremium: Number(e.target.value) })} className="w-20 admin-input text-center" />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">Allow New Signups</p><p className="text-xs text-[#6B6B6B]">Disable to close registration</p></div>
            <ToggleSwitch checked={form.allowNewSignups} onChange={(v) => setForm({ ...form, allowNewSignups: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">Maintenance Mode</p><p className="text-xs text-[#6B6B6B]">Show maintenance page to all users</p></div>
            <ToggleSwitch checked={form.maintenanceMode} onChange={(v) => setForm({ ...form, maintenanceMode: v })} />
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
        <h3 className="font-semibold text-sm mb-4 text-[#000000] dark:text-[#FFFFFF]">Payment Integration</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">Enable Payments</p><p className="text-xs text-[#6B6B6B]">Allow paid subscription purchases</p></div>
            <ToggleSwitch checked={form.paymentEnabled} onChange={(v) => setForm({ ...form, paymentEnabled: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">Payment Gateway</p><p className="text-xs text-[#6B6B6B]">Choose payment processor</p></div>
            <select value={form.paymentGateway} onChange={(e) => setForm({ ...form, paymentGateway: e.target.value as any })} className="admin-input w-36">
              <option value="none">None</option>
              <option value="razorpay">Razorpay</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
        <h3 className="font-semibold text-sm mb-4 text-[#000000] dark:text-[#FFFFFF]">Announcement Banner</h3>
        <input value={form.appAnnouncement} onChange={(e) => setForm({ ...form, appAnnouncement: e.target.value })}
          placeholder="Leave empty to hide. Shows to all users at the top."
          className="w-full admin-input" />
      </div>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#7C3AED] text-white rounded-xl font-semibold hover:bg-[#6D28D9] disabled:opacity-50 transition-colors">
        <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Config"}
      </button>
    </div>
  );
}

// ========== HELPER COMPONENTS ==========
function LimitInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-[10px] text-[#6B6B6B] block mb-1">{label}</label>
      <input type="number" min={1} max={9999} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="admin-input w-full" />
    </div>
  );
}

function ToggleChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        checked ? "bg-[#7C3AED] text-white" : "bg-[#E2E2E2] dark:bg-[#333333] text-[#6B6B6B]"
      }`}>
      {checked ? <Check className="h-3 w-3 inline mr-1" /> : null}{label}
    </button>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${
        checked ? "bg-[#06C167] justify-end" : "bg-[#E2E2E2] dark:bg-[#333333] justify-start"
      }`}>
      <div className="h-5 w-5 rounded-full bg-[#FFFFFF] shadow-sm" />
    </button>
  );
}
