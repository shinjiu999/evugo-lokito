import React, { useState } from "react";
import { 
  X, 
  Printer, 
  Download, 
  Shield, 
  Users, 
  Calendar, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  ClipboardList
} from "lucide-react";
import { Player, TacticalPhase } from "../types";

interface MatchBriefingSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  teamLogo: string | null;
  players: Player[];
  formation: string;
  opponentFormation?: string;
  sportMode: string;
  tacticalPhase: TacticalPhase;
  managerName: string;
  primaryColor: string;
  lang: "id" | "en";
  onDownloadPitchPng: () => void;
}

export default function MatchBriefingSheetModal({
  isOpen,
  onClose,
  teamName,
  teamLogo,
  players,
  formation,
  opponentFormation = "4-4-2",
  sportMode,
  tacticalPhase,
  managerName,
  primaryColor,
  lang,
  onDownloadPitchPng
}: MatchBriefingSheetModalProps) {
  if (!isOpen) return null;

  const starters = players.filter((p) => p.isStarting);
  const substitutes = players.filter((p) => !p.isStarting);

  const [matchContext, setMatchContext] = useState(lang === "id" ? "Pekan Pertandingan Liga - Babak 1" : "Matchday Official Briefing - Half 1");
  const [opponentName, setOpponentName] = useState(lang === "id" ? "TIM LAWAN FC" : "OPPOSITION FC");
  const [venue, setVenue] = useState(lang === "id" ? "Stadion Utama Gelora Bung Karno" : "Main Stadium");
  const [coachingNotes, setCoachingNotes] = useState(
    lang === "id" 
      ? "1. Eksploitasi Half-Space kanan saat build-up awal.\n2. Lakukan counter-pressing intensif dalam 5 detik setelah kehilangan bola di sepertiga akhir.\n3. Pertahankan blok pertahanan kompak 30 meter saat transisi negatif."
      : "1. Overload right half-space during progressive build-up.\n2. Counter-press aggressively within 5 seconds of turnover in final third.\n3. Maintain compact 30-meter defensive line during negative transition."
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#081510] border border-emerald-500/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/20 bg-[#040f0a]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{lang === "id" ? "LEMBAR BRIEFING TAKTIK RESMI" : "OFFICIAL TACTICAL BRIEFING SHEET"}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase">
                  UEFA PRO
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                {lang === "id" ? "Dokumen analisis strategi pra-pertandingan & instruksi teknis pemain" : "Pre-match strategy analysis & technical player instructions document"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/25 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              title={lang === "id" ? "Cetak Dokumen" : "Print Sheet"}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === "id" ? "Cetak" : "Print"}</span>
            </button>

            <button
              onClick={onDownloadPitchPng}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
              title={lang === "id" ? "Unduh PNG Lapangan" : "Download Pitch Graphic"}
            >
              <Download className="w-3.5 h-3.5 text-black" />
              <span>{lang === "id" ? "Unduh PNG" : "Export Graphic"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Sheet Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-gray-200">
          
          {/* Match Context Banner */}
          <div className="bg-gradient-to-r from-[#0a2318] via-[#081b13] to-[#040f0a] border border-emerald-500/25 rounded-2xl p-4 sm:p-5 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {teamLogo ? (
                  <img 
                    src={teamLogo} 
                    alt={teamName} 
                    className="w-12 h-12 rounded-xl object-contain bg-black/40 p-1 border border-emerald-500/30" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg border border-emerald-400/40 shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {teamName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">{teamName || "TEAM A"}</h3>
                    <span className="text-xs font-bold text-gray-400">VS</span>
                    <input 
                      type="text"
                      value={opponentName}
                      onChange={(e) => setOpponentName(e.target.value)}
                      className="text-lg sm:text-xl font-black text-emerald-400 uppercase tracking-wider bg-transparent border-b border-emerald-500/30 focus:outline-none focus:border-emerald-400 max-w-[180px]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      {new Date().toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { dateStyle: "medium" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {venue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formations Matchup Badge */}
              <div className="flex items-center gap-3 bg-black/40 border border-emerald-500/20 rounded-2xl px-4 py-2 self-start sm:self-center">
                <div className="text-center">
                  <span className="text-[9px] text-gray-400 uppercase block font-bold">{lang === "id" ? "FORMASI KITA" : "HOME FORMATION"}</span>
                  <span className="text-base font-black text-emerald-400">{formation}</span>
                </div>
                <div className="text-gray-500 font-bold text-sm">VS</div>
                <div className="text-center">
                  <span className="text-[9px] text-gray-400 uppercase block font-bold">{lang === "id" ? "FORMASI LAWAN" : "OPP FORMATION"}</span>
                  <span className="text-base font-black text-rose-400">{opponentFormation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout: Starting XI Table & Coaching Directives */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Column: Starting XI Roster (7 cols) */}
            <div className="lg:col-span-7 bg-[#05170f]/80 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/15">
                <h4 className="text-xs font-black uppercase text-emerald-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>{lang === "id" ? "SUSUNAN 11 PEMAIN UTAMA (STARTING XI)" : "STARTING XI SQUAD ROSTER"}</span>
                </h4>
                <span className="text-[10px] text-gray-400 font-medium">{starters.length} {lang === "id" ? "pemain" : "players"}</span>
              </div>

              <div className="space-y-1.5">
                {starters.map((player) => {
                  const roleBadge = 
                    player.role === "GK" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                    player.role === "DEF" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                    player.role === "MID" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                    "bg-rose-500/20 text-rose-300 border-rose-500/30";

                  return (
                    <div 
                      key={player.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#03110a] border border-emerald-500/10 hover:border-emerald-500/25 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-white/10 text-white font-black flex items-center justify-center text-xs">
                          {player.number}
                        </span>
                        <span className="font-bold text-white">{player.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${roleBadge}`}>
                          {player.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 italic">
                        {player.notes || (player.role === "GK" ? "Distribusi cepat & Sweeper" : player.role === "DEF" ? "Intersepsi & Cover" : player.role === "MID" ? "Koneksi lini & Progresi" : "Penetrasi & Finishing")}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bench Substitutes list */}
              {substitutes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-emerald-500/15">
                  <span className="text-[10px] font-black uppercase text-gray-400 block mb-1.5">
                    {lang === "id" ? "BANGKU CADANGAN (SUBSTITUTES):" : "BENCH SUBSTITUTES:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {substitutes.map((sub) => (
                      <span 
                        key={sub.id}
                        className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-300 font-medium"
                      >
                        #{sub.number} {sub.name} ({sub.role})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Key Tactical Principles & Coaching Directives (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Tactical Phase Directives */}
              <div className="bg-[#05170f]/80 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-2.5">
                <h4 className="text-xs font-black uppercase text-emerald-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>{lang === "id" ? "FASE TAKTIKAL AKTIF" : "ACTIVE TACTICAL PHASE"}</span>
                </h4>
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <div>
                    <span className="text-xs font-black text-white uppercase block">{tacticalPhase}</span>
                    <span className="text-[10px] text-emerald-300/80">
                      {lang === "id" ? "Fokus transisi dan pemanfaatan ruang vertikal" : "Vertical spacing and transition focus"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Head Coach Notes */}
              <div className="bg-[#05170f]/80 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-2.5 flex-1">
                <h4 className="text-xs font-black uppercase text-emerald-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>{lang === "id" ? "INSTRUKSI PELATIH KEPALA" : "HEAD COACH DIRECTIVES"}</span>
                </h4>
                <textarea
                  value={coachingNotes}
                  onChange={(e) => setCoachingNotes(e.target.value)}
                  rows={6}
                  className="w-full bg-[#03110a] border border-emerald-500/20 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 resize-none font-sans leading-relaxed"
                  placeholder={lang === "id" ? "Masukkan instruksi taktikal untuk pemain..." : "Enter tactical directives for players..."}
                />
              </div>

              {/* Manager Signature Block */}
              <div className="p-3 bg-[#05170f]/80 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-bold block">{lang === "id" ? "PELATIH KEPALA (HEAD COACH)" : "HEAD COACH"}</span>
                  <span className="text-sm font-black text-white">{managerName || "Coach"}</span>
                </div>
                <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase">
                  VERIFIED UEFA PRO ✓
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
