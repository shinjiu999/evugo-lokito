import React, { useState, useMemo } from "react";
import { Player } from "../types";
import {
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Edit3,
  Search,
  Check,
  Sparkles,
  ArrowRightLeft,
  Trash2,
  CheckSquare,
  Square,
  Shield,
  Zap,
  Hash,
  X,
  Sliders,
  UserCheck,
  UserMinus,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Interactive3DCard from "./Interactive3DCard";
import { soundManager } from "../utils/sound";

export interface SquadManagementProps {
  players: Player[];
  onSortPlayers: (
    sortBy: "role" | "number" | "name",
    order?: "asc" | "desc",
    target?: "all" | "starters" | "bench"
  ) => void;
  onSelectPlayer?: (playerId: string) => void;
  onRemovePlayer?: (playerId: string) => void;
  onToggleStarter?: (playerId: string) => void;
  onAddPlayer?: (name: string, number: number, role: "GK" | "DEF" | "MID" | "FWD") => void;
  onOpenImport?: () => void;
  primaryColor?: string;
  gkColor?: string;
  numberColor?: string;
  lang?: "id" | "en";
  onBulkUpdatePlayers?: (updates: { id: string; changes: Partial<Player> }[]) => void;
  onBulkDeletePlayers?: (playerIds: string[]) => void;
}

export default function SquadManagement({
  players,
  onSortPlayers,
  onSelectPlayer,
  onRemovePlayer,
  onToggleStarter,
  onAddPlayer,
  onOpenImport,
  primaryColor = "#dc2626",
  gkColor = "#eab308",
  numberColor = "#ffffff",
  lang = "id",
  onBulkUpdatePlayers,
  onBulkDeletePlayers
}: SquadManagementProps) {
  const [activeTab, setActiveTab] = useState<"all" | "starters" | "bench">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSort, setActiveSort] = useState<"role" | "number" | "name" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortTarget, setSortTarget] = useState<"all" | "starters" | "bench">("all");
  const [sortFeedback, setSortFeedback] = useState<string | null>(null);

  // Bulk Selection State
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [activeBulkTab, setActiveBulkTab] = useState<"role" | "number" | "status">("role");
  const [seqStartNumber, setSeqStartNumber] = useState<number>(1);
  const [exactNumber, setExactNumber] = useState<number>(10);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Quick Add Player State
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState<number | "">("");
  const [newRole, setNewRole] = useState<"GK" | "DEF" | "MID" | "FWD">("MID");

  const starters = useMemo(() => players.filter((p) => p.isStarting), [players]);
  const bench = useMemo(() => players.filter((p) => !p.isStarting), [players]);

  const filteredPlayers = useMemo(() => {
    let list = players;
    if (activeTab === "starters") list = starters;
    if (activeTab === "bench") list = bench;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.number.toString().includes(q) ||
          p.role.toLowerCase().includes(q)
      );
    }
    return list;
  }, [players, activeTab, starters, bench, searchQuery]);

  // Selected player objects in current filtered/display order
  const selectedPlayersList = useMemo(() => {
    return players.filter((p) => selectedPlayerIds.has(p.id));
  }, [players, selectedPlayerIds]);

  const areAllFilteredSelected = useMemo(() => {
    if (filteredPlayers.length === 0) return false;
    return filteredPlayers.every((p) => selectedPlayerIds.has(p.id));
  }, [filteredPlayers, selectedPlayerIds]);

  // Toast feedback helper
  const showNotification = (msg: string) => {
    setSortFeedback(msg);
    setTimeout(() => {
      setSortFeedback(null);
    }, 3200);
  };

  // --- SELECTION HANDLERS ---
  const handleToggleSelectPlayer = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    soundManager.playClick();
    setSelectedPlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    soundManager.playClick();
    setSelectedPlayerIds((prev) => {
      const next = new Set(prev);
      if (areAllFilteredSelected) {
        filteredPlayers.forEach((p) => next.delete(p.id));
      } else {
        filteredPlayers.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const handleSelectByRole = (role: "GK" | "DEF" | "MID" | "FWD") => {
    soundManager.playClick();
    const rolePlayers = players.filter((p) => p.role === role);
    setSelectedPlayerIds((prev) => {
      const next = new Set(prev);
      rolePlayers.forEach((p) => next.add(p.id));
      return next;
    });
    showNotification(
      lang === "id"
        ? `✓ Memilih semua pemain dengan posisi ${role} (${rolePlayers.length})`
        : `✓ Selected all ${role} players (${rolePlayers.length})`
    );
  };

  const handleSelectBySquadCategory = (category: "starters" | "bench") => {
    soundManager.playClick();
    const group = category === "starters" ? starters : bench;
    setSelectedPlayerIds((prev) => {
      const next = new Set(prev);
      group.forEach((p) => next.add(p.id));
      return next;
    });
    showNotification(
      lang === "id"
        ? `✓ Memilih semua ${category === "starters" ? "Starter XI" : "Cadangan"} (${group.length})`
        : `✓ Selected all ${category === "starters" ? "Starters" : "Bench"} (${group.length})`
    );
  };

  const handleClearSelection = () => {
    soundManager.playClick();
    setSelectedPlayerIds(new Set());
    setShowDeleteConfirm(false);
  };

  // --- BULK OPERATIONS ---
  // 1. Bulk Assign Role
  const handleBulkAssignRole = (newRole: "GK" | "DEF" | "MID" | "FWD") => {
    if (selectedPlayerIds.size === 0) return;
    soundManager.playClick();

    const ids = Array.from(selectedPlayerIds);
    const updates = ids.map((id) => ({
      id,
      changes: { role: newRole }
    }));

    if (onBulkUpdatePlayers) {
      onBulkUpdatePlayers(updates);
    }

    const roleName =
      newRole === "GK"
        ? lang === "id"
          ? "Kiper (GK)"
          : "Goalkeeper (GK)"
        : newRole === "DEF"
        ? lang === "id"
          ? "Bek (DEF)"
          : "Defender (DEF)"
        : newRole === "MID"
        ? lang === "id"
          ? "Gelandang (MID)"
          : "Midfielder (MID)"
        : lang === "id"
        ? "Penyerang (FWD)"
        : "Forward (FWD)";

    showNotification(
      lang === "id"
        ? `✓ Posisi ${ids.length} pemain berhasil diubah ke ${roleName}`
        : `✓ Role of ${ids.length} players updated to ${roleName}`
    );
  };

  // 2. Bulk Sequential Jersey Renumbering
  const handleBulkSequentialRenumber = () => {
    if (selectedPlayerIds.size === 0) return;
    soundManager.playClick();

    // Preserve order: first from filtered view, then remaining players
    const orderedSelected = filteredPlayers.filter((p) => selectedPlayerIds.has(p.id));
    const remainingSelected = players.filter(
      (p) => selectedPlayerIds.has(p.id) && !orderedSelected.some((o) => o.id === p.id)
    );
    const allOrdered = [...orderedSelected, ...remainingSelected];

    const updates = allOrdered.map((p, index) => ({
      id: p.id,
      changes: { number: Math.min(99, Math.max(1, seqStartNumber + index)) }
    }));

    if (onBulkUpdatePlayers) {
      onBulkUpdatePlayers(updates);
    }

    showNotification(
      lang === "id"
        ? `✓ ${allOrdered.length} pemain dinomori berurutan (#${seqStartNumber} - #${
            seqStartNumber + allOrdered.length - 1
          })`
        : `✓ ${allOrdered.length} players numbered sequentially (#${seqStartNumber} - #${
            seqStartNumber + allOrdered.length - 1
          })`
    );
  };

  // 3. Bulk Offset Jersey Numbers (+1, -1, +10, -10)
  const handleBulkOffsetNumber = (offset: number) => {
    if (selectedPlayerIds.size === 0) return;
    soundManager.playClick();

    const selectedList = players.filter((p) => selectedPlayerIds.has(p.id));
    const updates = selectedList.map((p) => ({
      id: p.id,
      changes: { number: Math.min(99, Math.max(1, p.number + offset)) }
    }));

    if (onBulkUpdatePlayers) {
      onBulkUpdatePlayers(updates);
    }

    const sign = offset > 0 ? `+${offset}` : `${offset}`;
    showNotification(
      lang === "id"
        ? `✓ Nomor jersey ${selectedList.length} pemain digeser (${sign})`
        : `✓ Shifted shirt numbers of ${selectedList.length} players (${sign})`
    );
  };

  // 4. Bulk Set Exact Number
  const handleBulkSetExactNumber = () => {
    if (selectedPlayerIds.size === 0) return;
    soundManager.playClick();

    const ids = Array.from(selectedPlayerIds);
    const validNum = Math.min(99, Math.max(1, exactNumber));
    const updates = ids.map((id) => ({
      id,
      changes: { number: validNum }
    }));

    if (onBulkUpdatePlayers) {
      onBulkUpdatePlayers(updates);
    }

    showNotification(
      lang === "id"
        ? `✓ Nomor jersey ${ids.length} pemain diatur ke #${validNum}`
        : `✓ Shirt number of ${ids.length} players set to #${validNum}`
    );
  };

  // 5. Smart Positional Traditional Renumbering (1 for GK, 2-5 for DEF, 6-8 for MID, 9-11 for FWD)
  const handleBulkSmartTraditionalRenumber = () => {
    if (selectedPlayerIds.size === 0) return;
    soundManager.playClick();

    const selectedList = players.filter((p) => selectedPlayerIds.has(p.id));

    // Sort by role order: GK -> DEF -> MID -> FWD
    const roleRank: Record<string, number> = { GK: 1, DEF: 2, MID: 3, FWD: 4 };
    const sorted = [...selectedList].sort(
      (a, b) => (roleRank[a.role] || 99) - (roleRank[b.role] || 99)
    );

    let gkCount = 0;
    let defCount = 0;
    let midCount = 0;
    let fwdCount = 0;

    const gkDefaults = [1, 13, 25, 30];
    const defDefaults = [2, 3, 4, 5, 12, 14, 15, 23];
    const midDefaults = [6, 8, 10, 16, 17, 20, 21, 22];
    const fwdDefaults = [7, 9, 11, 18, 19, 27, 29, 33];

    const updates = sorted.map((p) => {
      let num = p.number;
      if (p.role === "GK") {
        num = gkDefaults[gkCount % gkDefaults.length];
        gkCount++;
      } else if (p.role === "DEF") {
        num = defDefaults[defCount % defDefaults.length];
        defCount++;
      } else if (p.role === "MID") {
        num = midDefaults[midCount % midDefaults.length];
        midCount++;
      } else {
        num = fwdDefaults[fwdCount % fwdDefaults.length];
        fwdCount++;
      }
      return { id: p.id, changes: { number: num } };
    });

    if (onBulkUpdatePlayers) {
      onBulkUpdatePlayers(updates);
    }

    showNotification(
      lang === "id"
        ? `✓ Auto-nomor taktis tradisional diterapkan pada ${updates.length} pemain`
        : `✓ Classic positional squad numbers applied to ${updates.length} players`
    );
  };

  // 6. Bulk Lineup Status
  const handleBulkSetStartingStatus = (isStarting: boolean) => {
    if (selectedPlayerIds.size === 0) return;
    soundManager.playClick();

    const ids = Array.from(selectedPlayerIds);
    const updates = ids.map((id) => ({
      id,
      changes: {
        isStarting,
        ...(isStarting ? { x: 50, y: 50 } : {})
      }
    }));

    if (onBulkUpdatePlayers) {
      onBulkUpdatePlayers(updates);
    }

    showNotification(
      lang === "id"
        ? `✓ ${ids.length} pemain dipindahkan ke ${isStarting ? "Starter XI" : "Cadangan"}`
        : `✓ ${ids.length} players moved to ${isStarting ? "Starters XI" : "Bench"}`
    );
  };

  // 7. Bulk Delete
  const handleBulkDelete = () => {
    if (selectedPlayerIds.size === 0) return;
    soundManager.playClick();

    const ids = Array.from(selectedPlayerIds);
    if (onBulkDeletePlayers) {
      onBulkDeletePlayers(ids);
    } else if (onRemovePlayer) {
      ids.forEach((id) => onRemovePlayer(id));
    }

    setSelectedPlayerIds(new Set());
    setShowDeleteConfirm(false);

    showNotification(
      lang === "id"
        ? `✓ ${ids.length} pemain telah dihapus dari skuad`
        : `✓ ${ids.length} players removed from squad`
    );
  };

  // --- SORTING TRIGGER ---
  const handleSortTrigger = (sortBy: "role" | "number" | "name") => {
    let nextOrder: "asc" | "desc" = "asc";
    if (activeSort === sortBy) {
      nextOrder = sortOrder === "asc" ? "desc" : "asc";
    }
    setActiveSort(sortBy);
    setSortOrder(nextOrder);

    onSortPlayers(sortBy, nextOrder, sortTarget);

    let feedbackMsg = "";
    if (lang === "id") {
      const sortName =
        sortBy === "role"
          ? "Posisi (GK-DEF-MID-FWD)"
          : sortBy === "number"
          ? "Nomor Punggung"
          : "Nama Pemain";
      const targetLabel =
        sortTarget === "all"
          ? "Semua Skuad"
          : sortTarget === "starters"
          ? "Starter XI"
          : "Cadangan";
      const orderLabel = nextOrder === "asc" ? "Naik (Asc)" : "Turun (Desc)";
      feedbackMsg = `✓ ${targetLabel} diurutkan menurut ${sortName} [${orderLabel}]`;
    } else {
      const sortName =
        sortBy === "role"
          ? "Role (GK-DEF-MID-FWD)"
          : sortBy === "number"
          ? "Shirt Number"
          : "Player Name";
      const targetLabel =
        sortTarget === "all" ? "All Squad" : sortTarget === "starters" ? "Starters (XI)" : "Bench";
      const orderLabel = nextOrder === "asc" ? "Asc" : "Desc";
      feedbackMsg = `✓ ${targetLabel} organized by ${sortName} [${orderLabel}]`;
    }

    showNotification(feedbackMsg);
  };

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const num = typeof newNumber === "number" ? newNumber : Math.floor(Math.random() * 88) + 12;
    if (onAddPlayer) {
      onAddPlayer(newName.trim(), num, newRole);
    }
    setNewName("");
    setNewNumber("");
    setNewRole("MID");
    setIsAddFormOpen(false);
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "GK":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "DEF":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      case "MID":
        return "bg-purple-500/20 text-purple-400 border-purple-500/40";
      case "FWD":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    }
  };

  return (
    <Interactive3DCard glowColor="rgba(16, 185, 129, 0.45)">
      <div className="p-4 flex flex-col gap-3.5 select-none text-left">
        {/* Header with Title & Stats Pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest leading-none">
                  {lang === "id" ? "Manajemen Skuad & Pemain" : "Squad & Player Management"}
                </h4>
                {selectedPlayerIds.size > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-500 text-black shadow-sm animate-pulse">
                    {selectedPlayerIds.size} {lang === "id" ? "Dipilih" : "Selected"}
                  </span>
                )}
              </div>
              <span className="text-[8.5px] text-gray-400 font-medium mt-0.5 block">
                {starters.length} {lang === "id" ? "Starter" : "Starters"} • {bench.length}{" "}
                {lang === "id" ? "Cadangan" : "Bench"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {selectedPlayerIds.size > 0 ? (
              <button
                onClick={handleClearSelection}
                className="px-2 py-1 rounded-lg text-[8px] font-black bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white border border-white/15 transition-all flex items-center gap-1 cursor-pointer"
                title={lang === "id" ? "Batalkan pilihan semua pemain" : "Clear selection"}
              >
                <X className="w-2.5 h-2.5" />
                <span>{lang === "id" ? "Batal Pilih" : "Clear"}</span>
              </button>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                {players.length} {lang === "id" ? "Pemain" : "Players"}
              </span>
            )}
          </div>
        </div>

        {/* Core Feature: Auto-Sort Toolbar */}
        <div className="bg-[#05160e]/80 border border-emerald-500/25 rounded-2xl p-2.5 flex flex-col gap-2 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-emerald-300 animate-pulse" />
              {lang === "id" ? "Urutkan Otomatis (Auto-Sort)" : "Auto-Sort Squad"}
            </span>

            {/* Scope selection: All / Starters / Bench */}
            <div className="flex items-center gap-0.5 bg-black/50 p-0.5 rounded-lg border border-white/10">
              {(["all", "starters", "bench"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSortTarget(t)}
                  className={`px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase transition-all cursor-pointer ${
                    sortTarget === t
                      ? "bg-emerald-500 text-black shadow-sm font-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title={
                    lang === "id"
                      ? t === "all"
                        ? "Urutkan semua pemain"
                        : t === "starters"
                        ? "Hanya urutkan starter XI"
                        : "Hanya urutkan cadangan"
                      : t === "all"
                      ? "Sort all players"
                      : t === "starters"
                      ? "Sort starters only"
                      : "Sort bench only"
                  }
                >
                  {t === "all"
                    ? lang === "id"
                      ? "Semua"
                      : "All"
                    : t === "starters"
                    ? "XI"
                    : "Bench"}
                </button>
              ))}
            </div>
          </div>

          {/* Sorting Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            {/* Sort by Role */}
            <button
              onClick={() => handleSortTrigger("role")}
              className={`px-2 py-2 rounded-xl text-[8.5px] font-black uppercase transition-all flex flex-col items-center justify-center gap-0.5 border cursor-pointer active:scale-95 ${
                activeSort === "role"
                  ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                  : "bg-black/40 hover:bg-emerald-950/40 text-gray-200 border-white/10 hover:border-emerald-500/40"
              }`}
              title={
                lang === "id"
                  ? "Urutkan berdasarkan posisi standar: GK → DEF → MID → FWD"
                  : "Organize by role: GK → DEF → MID → FWD"
              }
            >
              <div className="flex items-center gap-1">
                <span>{lang === "id" ? "Posisi" : "Role"}</span>
                {activeSort === "role" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
                  ) : (
                    <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
                  )
                ) : (
                  <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                )}
              </div>
              <span
                className={`text-[6.5px] tracking-tight ${
                  activeSort === "role" ? "text-black/80 font-bold" : "text-emerald-400/80"
                }`}
              >
                GK → FWD
              </span>
            </button>

            {/* Sort by Shirt Number */}
            <button
              onClick={() => handleSortTrigger("number")}
              className={`px-2 py-2 rounded-xl text-[8.5px] font-black uppercase transition-all flex flex-col items-center justify-center gap-0.5 border cursor-pointer active:scale-95 ${
                activeSort === "number"
                  ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                  : "bg-black/40 hover:bg-emerald-950/40 text-gray-200 border-white/10 hover:border-emerald-500/40"
              }`}
              title={
                lang === "id"
                  ? "Urutkan nomor punggung: 1, 2, 3 ... 99"
                  : "Organize by shirt number: 1, 2, 3 ... 99"
              }
            >
              <div className="flex items-center gap-1">
                <span>{lang === "id" ? "No. Jersey" : "Shirt No."}</span>
                {activeSort === "number" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
                  ) : (
                    <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
                  )
                ) : (
                  <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                )}
              </div>
              <span
                className={`text-[6.5px] tracking-tight ${
                  activeSort === "number" ? "text-black/80 font-bold" : "text-emerald-400/80"
                }`}
              >
                #1 → #99
              </span>
            </button>

            {/* Sort by Name */}
            <button
              onClick={() => handleSortTrigger("name")}
              className={`px-2 py-2 rounded-xl text-[8.5px] font-black uppercase transition-all flex flex-col items-center justify-center gap-0.5 border cursor-pointer active:scale-95 ${
                activeSort === "name"
                  ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                  : "bg-black/40 hover:bg-emerald-950/40 text-gray-200 border-white/10 hover:border-emerald-500/40"
              }`}
              title={lang === "id" ? "Urutkan alfabetis nama pemain A ke Z" : "Organize by player name A to Z"}
            >
              <div className="flex items-center gap-1">
                <span>{lang === "id" ? "Nama" : "Name"}</span>
                {activeSort === "name" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
                  ) : (
                    <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
                  )
                ) : (
                  <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                )}
              </div>
              <span
                className={`text-[6.5px] tracking-tight ${
                  activeSort === "name" ? "text-black/80 font-bold" : "text-emerald-400/80"
                }`}
              >
                A → Z
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Notification Toast */}
        <AnimatePresence>
          {sortFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[8.5px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md overflow-hidden"
            >
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{sortFeedback}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* DEDICATED BULK SELECTION ACTION TOOLBAR (WHEN ACTIVE)     */}
        {/* ======================================================== */}
        <AnimatePresence>
          {selectedPlayerIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -6 }}
              className="bg-gradient-to-br from-[#0c2419] to-[#06150e] border-2 border-emerald-500/60 ring-2 ring-emerald-500/20 rounded-2xl p-3 flex flex-col gap-2.5 shadow-xl shadow-black/60 relative overflow-hidden"
            >
              {/* Header inside Bulk Toolbar */}
              <div className="flex items-center justify-between pb-1.5 border-b border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-black text-[10px] shadow-sm">
                    {selectedPlayerIds.size}
                  </div>
                  <div>
                    <span className="text-[9.5px] font-black text-white uppercase tracking-wider">
                      {lang === "id" ? "Operasi Massal Pemain" : "Bulk Player Actions"}
                    </span>
                    <span className="text-[7.5px] text-emerald-300 block">
                      {lang === "id"
                        ? `${selectedPlayerIds.size} pemain terpilih siap diedit bersamaan`
                        : `${selectedPlayerIds.size} players selected for simultaneous edits`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Category switcher tabs */}
                  <div className="flex items-center bg-black/50 p-0.5 rounded-lg border border-emerald-500/30">
                    <button
                      onClick={() => setActiveBulkTab("role")}
                      className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                        activeBulkTab === "role"
                          ? "bg-emerald-500 text-black shadow-sm"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      <Shield className="w-2.5 h-2.5" />
                      <span>{lang === "id" ? "Ganti Posisi" : "Assign Role"}</span>
                    </button>
                    <button
                      onClick={() => setActiveBulkTab("number")}
                      className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                        activeBulkTab === "number"
                          ? "bg-emerald-500 text-black shadow-sm"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      <Hash className="w-2.5 h-2.5" />
                      <span>{lang === "id" ? "No. Jersey" : "Jersey No."}</span>
                    </button>
                    <button
                      onClick={() => setActiveBulkTab("status")}
                      className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                        activeBulkTab === "status"
                          ? "bg-emerald-500 text-black shadow-sm"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      <UserCheck className="w-2.5 h-2.5" />
                      <span>{lang === "id" ? "Status" : "Status"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 1. BULK TAB: ASSIGN ROLES */}
              {activeBulkTab === "role" && (
                <div className="flex flex-col gap-1.5 animate-fadeIn">
                  <span className="text-[8px] text-gray-300 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                    {lang === "id"
                      ? "Pilih Posisi untuk Diterapkan ke Semua Pemain Terpilih:"
                      : "Quickly assign role to all selected players:"}
                  </span>

                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      onClick={() => handleBulkAssignRole("GK")}
                      className="py-1.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-black text-[9px] uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                      title={lang === "id" ? "Tugaskan posisi Kiper" : "Assign Goalkeeper"}
                    >
                      <span>🧤 GK</span>
                      <span className="text-[6.5px] opacity-75 font-semibold">
                        {lang === "id" ? "Kiper" : "Goalkeeper"}
                      </span>
                    </button>

                    <button
                      onClick={() => handleBulkAssignRole("DEF")}
                      className="py-1.5 px-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 hover:border-blue-400 text-blue-300 font-black text-[9px] uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                      title={lang === "id" ? "Tugaskan posisi Bek / Pemain Bertahan" : "Assign Defender"}
                    >
                      <span>🛡️ DEF</span>
                      <span className="text-[6.5px] opacity-75 font-semibold">
                        {lang === "id" ? "Bek / Defender" : "Defender"}
                      </span>
                    </button>

                    <button
                      onClick={() => handleBulkAssignRole("MID")}
                      className="py-1.5 px-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 hover:border-purple-400 text-purple-300 font-black text-[9px] uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                      title={lang === "id" ? "Tugaskan posisi Gelandang" : "Assign Midfielder"}
                    >
                      <span>⚙️ MID</span>
                      <span className="text-[6.5px] opacity-75 font-semibold">
                        {lang === "id" ? "Gelandang" : "Midfielder"}
                      </span>
                    </button>

                    <button
                      onClick={() => handleBulkAssignRole("FWD")}
                      className="py-1.5 px-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 hover:border-rose-400 text-rose-300 font-black text-[9px] uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                      title={lang === "id" ? "Tugaskan posisi Penyerang / Sayap" : "Assign Forward"}
                    >
                      <span>⚡ FWD</span>
                      <span className="text-[6.5px] opacity-75 font-semibold">
                        {lang === "id" ? "Penyerang" : "Forward"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. BULK TAB: CHANGE JERSEY NUMBERS */}
              {activeBulkTab === "number" && (
                <div className="flex flex-col gap-2 animate-fadeIn">
                  {/* Mode A: Sequential Renumbering */}
                  <div className="bg-black/40 border border-white/10 rounded-xl p-2 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <Hash className="w-2.5 h-2.5" />
                        {lang === "id"
                          ? "1. Urutkan Sekuensial (Mulai dari X)"
                          : "1. Sequential Renumbering"}
                      </span>
                      <span className="text-[7px] text-gray-400">
                        {lang === "id" ? "Contoh: #1, #2, #3..." : "e.g. #1, #2, #3..."}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 bg-black/60 border border-white/15 rounded-lg px-2 py-1">
                        <span className="text-[8px] text-gray-400 font-bold">#</span>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={seqStartNumber}
                          onChange={(e) =>
                            setSeqStartNumber(Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="w-10 bg-transparent text-white text-[9.5px] font-black focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={handleBulkSequentialRenumber}
                        className="flex-1 py-1 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-sm"
                      >
                        {lang === "id"
                          ? `Terapkan Berurutan (#${seqStartNumber} s/d #${
                              seqStartNumber + selectedPlayerIds.size - 1
                            })`
                          : `Apply Sequence (#${seqStartNumber} to #${
                              seqStartNumber + selectedPlayerIds.size - 1
                            })`}
                      </button>
                    </div>
                  </div>

                  {/* Mode B: Quick Shift (+1, -1, +10, -10) & Smart Positional */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[7.5px] text-gray-400 font-bold uppercase">
                        {lang === "id" ? "Geser No:" : "Shift:"}
                      </span>
                      {[-1, +1, -10, +10].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleBulkOffsetNumber(val)}
                          className="px-1.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-[8px] font-black transition-all cursor-pointer active:scale-95"
                          title={
                            lang === "id"
                              ? `Geser nomor semua pemain terpilih sebesar ${val > 0 ? "+" + val : val}`
                              : `Shift jersey numbers by ${val > 0 ? "+" + val : val}`
                          }
                        >
                          {val > 0 ? `+${val}` : val}
                        </button>
                      ))}
                    </div>

                    {/* Smart Positional Assignment */}
                    <button
                      onClick={handleBulkSmartTraditionalRenumber}
                      className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                      title={
                        lang === "id"
                          ? "Otomatis nomor klasik: GK=1, DEF=2-5, MID=6-8, FWD=7-11"
                          : "Auto classic positional numbering"
                      }
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{lang === "id" ? "Auto Posisi (1-11)" : "Auto Role (1-11)"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. BULK TAB: STATUS & MANAGEMENT */}
              {activeBulkTab === "status" && (
                <div className="flex flex-col gap-2 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleBulkSetStartingStatus(true)}
                      className="py-1.5 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-black text-[8.5px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <UserCheck className="w-3 h-3 text-emerald-400" />
                      <span>{lang === "id" ? "Jadikan Starter (XI)" : "Set to Starters (XI)"}</span>
                    </button>

                    <button
                      onClick={() => handleBulkSetStartingStatus(false)}
                      className="py-1.5 px-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-black text-[8.5px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <UserMinus className="w-3 h-3 text-blue-400" />
                      <span>{lang === "id" ? "Jadikan Cadangan" : "Set to Bench"}</span>
                    </button>
                  </div>

                  {/* Bulk Delete with confirmation */}
                  <div className="pt-1 border-t border-white/10 flex items-center justify-between">
                    {showDeleteConfirm ? (
                      <div className="w-full flex items-center justify-between gap-2 bg-red-950/40 border border-red-500/40 p-1.5 rounded-xl">
                        <span className="text-[8px] text-red-300 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                          {lang === "id"
                            ? `Hapus ${selectedPlayerIds.size} pemain ini?`
                            : `Delete these ${selectedPlayerIds.size} players?`}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handleBulkDelete}
                            className="px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[8px] font-black uppercase cursor-pointer"
                          >
                            {lang === "id" ? "Ya, Hapus" : "Confirm"}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-2 py-0.5 rounded-lg bg-white/10 text-gray-300 text-[8px] font-black uppercase cursor-pointer"
                          >
                            {lang === "id" ? "Batal" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="py-1 px-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-[8px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        <span>
                          {lang === "id"
                            ? `Hapus ${selectedPlayerIds.size} Pemain Terpilih`
                            : `Delete ${selectedPlayerIds.size} Selected`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Filter, Quick Multi-Select Presets & Search Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-1 flex-wrap sm:flex-nowrap">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-black/45 p-0.5 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase transition-all cursor-pointer ${
                  activeTab === "all"
                    ? "bg-white/15 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {lang === "id" ? "Semua" : "All"} ({players.length})
              </button>
              <button
                onClick={() => setActiveTab("starters")}
                className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase transition-all cursor-pointer ${
                  activeTab === "starters"
                    ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                XI ({starters.length})
              </button>
              <button
                onClick={() => setActiveTab("bench")}
                className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase transition-all cursor-pointer ${
                  activeTab === "bench"
                    ? "bg-blue-500/25 text-blue-300 border border-blue-500/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {lang === "id" ? "Cadangan" : "Bench"} ({bench.length})
              </button>
            </div>

            {/* Compact Search Input */}
            <div className="relative flex-1 max-w-[130px]">
              <Search className="w-2.5 h-2.5 text-gray-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={lang === "id" ? "Cari pemain / no..." : "Search player / no..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-5 pr-2 py-1 text-[8.5px] text-white focus:outline-none focus:border-emerald-500/70"
              />
            </div>
          </div>

          {/* QUICK SELECTION PRESETS BAR */}
          <div className="flex items-center justify-between gap-1 py-1 px-1.5 bg-black/30 border border-white/[0.06] rounded-xl text-[7.5px] overflow-x-auto scrollbar-none">
            {/* Select All Checkbox */}
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 font-black uppercase transition-colors cursor-pointer shrink-0"
              title={
                areAllFilteredSelected
                  ? lang === "id"
                    ? "Batalkan pilihan semua pemain ini"
                    : "Deselect all displayed players"
                  : lang === "id"
                  ? "Pilih semua pemain dalam tampilan saat ini"
                  : "Select all displayed players"
              }
            >
              {areAllFilteredSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/20" />
              ) : selectedPlayerIds.size > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400/60" />
              ) : (
                <Square className="w-3.5 h-3.5 text-gray-500" />
              )}
              <span>
                {areAllFilteredSelected
                  ? lang === "id"
                    ? "Batal Pilih Semua"
                    : "Deselect All"
                  : lang === "id"
                  ? "Pilih Semua"
                  : "Select All"}
              </span>
            </button>

            {/* Quick Presets */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-gray-500 font-medium">| {lang === "id" ? "Pilih:" : "Select:"}</span>
              <button
                onClick={() => handleSelectBySquadCategory("starters")}
                className="px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold transition-all cursor-pointer"
              >
                XI
              </button>
              <button
                onClick={() => handleSelectBySquadCategory("bench")}
                className="px-1.5 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold transition-all cursor-pointer"
              >
                Bench
              </button>
              {(["GK", "DEF", "MID", "FWD"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleSelectByRole(r)}
                  className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white font-bold transition-all cursor-pointer"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Player Roster List with Multi-Select Checkboxes */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-emerald-500/20">
          <AnimatePresence initial={false}>
            {filteredPlayers.length === 0 ? (
              <div className="py-6 text-center text-[9px] text-gray-500 italic">
                {lang === "id" ? "Tidak ada pemain ditemukan." : "No players match query."}
              </div>
            ) : (
              filteredPlayers.map((player) => {
                const isSelected = selectedPlayerIds.has(player.id);
                const bg = player.role === "GK" ? gkColor : primaryColor;

                return (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => handleToggleSelectPlayer(player.id)}
                    className={`flex items-center justify-between p-1.5 rounded-xl transition-all group cursor-pointer border ${
                      isSelected
                        ? "bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30"
                        : "bg-black/35 hover:bg-emerald-950/20 border-white/[0.07] hover:border-emerald-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Checkbox for Bulk Multi-Selection */}
                      <div
                        onClick={(e) => handleToggleSelectPlayer(player.id, e)}
                        className="p-1 -m-1 text-gray-400 hover:text-emerald-400 cursor-pointer shrink-0 transition-colors"
                        title={
                          isSelected
                            ? lang === "id"
                              ? "Hapus dari pilihan"
                              : "Deselect player"
                            : lang === "id"
                            ? "Pilih untuk aksi massal"
                            : "Select player for bulk actions"
                        }
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 fill-emerald-500/30" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                        )}
                      </div>

                      {/* Player Jersey Number Avatar */}
                      <div
                        style={{ backgroundColor: bg, color: numberColor }}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 shadow-sm border border-white/20"
                      >
                        {player.number}
                      </div>

                      {/* Player Name & Role */}
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-[9.5px] font-extrabold truncate leading-tight transition-colors ${
                            isSelected
                              ? "text-emerald-300 font-black"
                              : "text-white group-hover:text-emerald-300"
                          }`}
                        >
                          {player.name}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className={`text-[6.5px] font-black px-1 py-0.2 rounded border ${getRoleBadgeStyle(
                              player.role
                            )}`}
                          >
                            {player.role}
                          </span>
                          <span className="text-[7px] text-gray-400 font-medium">
                            {player.isStarting
                              ? lang === "id"
                                ? "• Starter"
                                : "• Starting XI"
                              : lang === "id"
                              ? "• Cadangan"
                              : "• Sub"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Starter/Bench Swap toggle */}
                      {onToggleStarter && (
                        <button
                          onClick={() => onToggleStarter(player.id)}
                          className={`p-1 rounded-lg border transition-all cursor-pointer ${
                            player.isStarting
                              ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30"
                          }`}
                          title={
                            player.isStarting
                              ? lang === "id"
                                ? "Tukar ke bangku cadangan"
                                : "Demote to bench"
                              : lang === "id"
                              ? "Masukkan ke lapangan (Starter)"
                              : "Promote to starting XI"
                          }
                        >
                          <ArrowRightLeft className="w-2.5 h-2.5" />
                        </button>
                      )}

                      {/* Edit Player Icon (Opens Individual Modal) */}
                      {onSelectPlayer && (
                        <button
                          onClick={() => onSelectPlayer(player.id)}
                          className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                          title={lang === "id" ? "Edit detail pemain ini" : "Edit individual player"}
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                        </button>
                      )}

                      {/* Delete Player Icon */}
                      {onRemovePlayer && (
                        <button
                          onClick={() => onRemovePlayer(player.id)}
                          className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer border border-red-500/20"
                          title={lang === "id" ? "Hapus pemain dari skuad" : "Remove player from squad"}
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Actions: Add Player & Import */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-white/[0.08]">
          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[8.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>
              {isAddFormOpen
                ? lang === "id"
                  ? "Tutup"
                  : "Close"
                : lang === "id"
                ? "Tambah Pemain"
                : "Add Player"}
            </span>
          </button>

          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-[8.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
              title={lang === "id" ? "Impor banyak pemain sekaligus" : "Bulk roster import"}
            >
              <span>{lang === "id" ? "📥 Impor Skuad" : "📥 Import Roster"}</span>
            </button>
          )}
        </div>

        {/* Quick Add Player Form Dropdown */}
        <AnimatePresence>
          {isAddFormOpen && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreatePlayer}
              className="bg-black/60 border border-emerald-500/30 rounded-2xl p-2.5 flex flex-col gap-2 overflow-hidden"
            >
              <div className="text-[8.5px] font-black uppercase text-emerald-400">
                {lang === "id" ? "+ Tambah Pemain Baru" : "+ Add New Player"}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder={lang === "id" ? "Nama Pemain..." : "Player Name..."}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1 text-[8.5px] text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder={lang === "id" ? "No..." : "No..."}
                    value={newNumber}
                    onChange={(e) =>
                      setNewNumber(e.target.value === "" ? "" : parseInt(e.target.value))
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-2 py-1 text-[8.5px] text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Role selection buttons */}
              <div className="grid grid-cols-4 gap-1">
                {(["GK", "DEF", "MID", "FWD"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setNewRole(r)}
                    className={`py-1 rounded-lg text-[7.5px] font-black uppercase transition-all border cursor-pointer ${
                      newRole === r
                        ? "bg-emerald-500 text-black border-emerald-400"
                        : "bg-black/40 text-gray-400 border-white/10 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[8.5px] uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-md"
              >
                {lang === "id" ? "Simpan ke Cadangan" : "Save to Bench"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Interactive3DCard>
  );
}
