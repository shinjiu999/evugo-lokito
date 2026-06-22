import { useState, useEffect } from "react";
import { Player } from "../types";
import { X, Camera, Shield, User, Info, Check, Trash, Scale, Printer, Download, Sparkles } from "lucide-react";

interface PlayerEditorModalProps {
  player: Player | null;
  allPlayers?: Player[];
  onSave: (id: string, updated: Partial<Player>) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  lang: "id" | "en";
  setLang: (lang: "id" | "en") => void;
}

export default function PlayerEditorModal({ player, allPlayers = [], onSave, onClose, onDelete, lang, setLang }: PlayerEditorModalProps) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState<number>(10);
  const [role, setRole] = useState<"GK" | "DEF" | "MID" | "FWD">("MID");
  const [photo, setPhoto] = useState<string | null>(null);

  // Individual athlete metrics/capabilities (speed, stamina, passing, defending, dribbling)
  const [speed, setSpeed] = useState<number>(75);
  const [stamina, setStamina] = useState<number>(75);
  const [passing, setPassing] = useState<number>(75);
  const [defending, setDefending] = useState<number>(75);
  const [dribbling, setDribbling] = useState<number>(75);

  // Comparison module states
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [comparePlayerId, setComparePlayerId] = useState<string>("");
  const [showPrintMode, setShowPrintMode] = useState<boolean>(false);

  const t = {
    customization: lang === "id" ? "Kustomisasi Atlet" : "Athlete Customization",
    comparisonTitle: lang === "id" ? "Perbandingan & Analisis Taktikal" : "Comparison & Tactical Analysis",
    previewPrintTitle: lang === "id" ? "Pratinjau & Cetak Kartu" : "Preview & Print Card",
    deletePhotoText: lang === "id" ? "Hapus Foto" : "Delete Photo",
    avatarSelectSubtitle: lang === "id" ? "Pilih foto wajah atau gunakan avatar default di bawah:" : "Select avatar photo or use default presets below:",
    backName: lang === "id" ? "Nama Punggung" : "Jersey Name",
    jerseyNumber: lang === "id" ? "Nomor Jersey" : "Jersey Number",
    positionCategory: lang === "id" ? "Kategori Posisi" : "Position Category",
    attributesTitle: lang === "id" ? "Atribut & Kemampuan Atlet" : "Athlete Stats & Attributes",
    speedLabel: lang === "id" ? "Kecepatan (Speed)" : "Speed",
    staminaLabel: lang === "id" ? "Stamina" : "Stamina",
    passingLabel: lang === "id" ? "Operan (Passing)" : "Passing",
    dribblingLabel: lang === "id" ? "Giringan (Dribbling)" : "Dribbling",
    defendingLabel: lang === "id" ? "Pertahanan (Defending)" : "Defending",
    selectAthleteToCompare: lang === "id" ? "Pilih Atlet Untuk Dibandingkan" : "Select Athlete to Compare",
    noOtherAthletesText: lang === "id" ? "Tidak ada atlet lain dalam tim untuk dibandingkan. Tambah atlet dalam daftar tim terlebih dahulu." : "No other athletes in the squad list to compare. Please add athletes first.",
    radarGraphComparison: lang === "id" ? "Grafik Radar Perbandingan" : "Comparison Radar Chart",
    headToHeadMetrics: lang === "id" ? "Analisis Metrik Berhadapan" : "Head-to-Head Metric Analysis",
    btnhideCompare: lang === "id" ? "Sembunyikan Banding" : "Hide Comparison",
    btnShowCompare: lang === "id" ? "Bandingkan" : "Compare",
    btnHidePrint: lang === "id" ? "Sembunyi Cetak" : "Hide Print",
    btnShowPrint: lang === "id" ? "Mode Cetak" : "Print Mode",
    btnDeletePlayer: lang === "id" ? "Hapus Pemain" : "Delete Athlete",
    btnCancel: lang === "id" ? "Batal" : "Cancel",
    btnSave: lang === "id" ? "Simpan" : "Save",
    cardPreviewHeader: lang === "id" ? "✨ Pratinjau Desain Kartu Atlet" : "✨ Athlete Card Design Preview",
    readyLabel: lang === "id" ? "SIAP" : "READY",
    printFormatTitle: lang === "id" ? "Format Cetak Utama" : "Primary Export Formats",
    printFormatDesc: lang === "id" ? "Pilih salah satu mode di bawah untuk menyimpan spesifikasi data kemampuan atlet dalam bentuk desain grafik berkualitas tinggi." : "Choose one of the modes below to save the athlete's stats and specification data in a high-quality tactical graphic layout.",
    downloadPngText: lang === "id" ? "Unduh PNG" : "Download PNG",
    printPdfText: lang === "id" ? "Cetak Kartu PDF" : "Print Card PDF",
    downloadCardTitle: lang === "id" ? "KARTU SPESIFIKASI ATLET" : "ATHLETE SPECIFICATION CARD",
    overallTitle: lang === "id" ? "OVR ATLET" : "ATHLETE OVR",
    tacticalSystemTitle: lang === "id" ? "★ SISTEM TAKTIKAL UTAMA ★" : "★ TACTICAL CORE SYSTEM ★",
    attributeListTitle: lang === "id" ? "DAFTAR ATRIBUT UTAMA ATLET" : "ATHLETE KEY ATTRIBUTIVES LIST",
    tacticalProCard: lang === "id" ? "KARTU TAKTIKAL PRO" : "TACTICAL PRO CARD",
    goldenSquad: lang === "id" ? "★ SKUAD EMAS" : "★ GOLD SQUAD",
    speedShort: lang === "id" ? "Kecepatan (SPD)" : "Speed (SPD)",
    staminaShort: lang === "id" ? "Stamina (STM)" : "Stamina (STM)",
    passingShort: lang === "id" ? "Operan (PAS)" : "Passing (PAS)",
    dribblingShort: lang === "id" ? "Giringan (DRI)" : "Dribbling (DRI)",
    defendingShort: lang === "id" ? "Pertahanan (DEF)" : "Defending (DEF)",
    speedShortAbbr: "SPD",
    staminaShortAbbr: "STM",
    passingShortAbbr: "PAS",
    dribblingShortAbbr: "DRI",
    defendingShortAbbr: "DEF",
    speedFullName: lang === "id" ? "Kecepatan Larian (Speed)" : "Running Speed (Speed)",
    staminaFullName: lang === "id" ? "Stamina Daya Tahan (Stamina)" : "Endurance Stamina (Stamina)",
    passingFullName: lang === "id" ? "Akurasi Operan (Passing)" : "Passing Accuracy (Passing)",
    dribblingFullName: lang === "id" ? "Kontrol & Giringan (Dribble)" : "Dribbling & Control (Dribbling)",
    defendingFullName: lang === "id" ? "Pertahanan Posisi (Defense)" : "Positional Defense (Defending)",
    systemTacticalLabel: lang === "id" ? "DIJANA MELALUI SISTEM TAKTIKAL PASUKAN" : "GENERATED VIA TEAM TACTICAL SYSTEM",
    printReportTitle: lang === "id" ? "LAPORAN KINERJA ATLET" : "ATHLETE PERFORMANCE REPORT",
    printReportSubtitle: lang === "id" ? "★ DIAGRAM KINERJA TAKTIKAL ★" : "★ TACTICAL PERFORMANCE DIAGRAM ★",
    printReportOvr: lang === "id" ? "SKOR OVR" : "OVR SCORE",
    printReportListTitle: lang === "id" ? "DAFTAR ATRIBUT UTAMA" : "CORE ATTRIBUTES LIST",
    printReportSpeed: lang === "id" ? "🏃 Kecepatan Larian" : "🏃 Running Speed",
    printReportStamina: lang === "id" ? "🔋 Stamina Daya Tahan" : "🔋 Endurance Stamina",
    printReportPassing: lang === "id" ? "🎯 Akurasi Operan (Passing)" : "🎯 Passing Accuracy",
    printReportDribbling: lang === "id" ? "⚽ Kontrol Giringan (Dribble)" : "⚽ Dribble Control",
    printReportDefending: lang === "id" ? "🛡️ Pertahanan Posisi (Defense)" : "🛡️ Positional Defense",
    printReportFooter: lang === "id" ? "DIREKA DENGAN PAPARAN TAKTIKAL PRO" : "DESIGNED WITH TACTICAL PRO INTERFACE",
    printReportPageTitle: lang === "id" ? "Cetak Laporan" : "Print Report",
    printNow: lang === "id" ? "Cetak Sekarang" : "Print Now",
    close: lang === "id" ? "Tutup" : "Close",
    forward: lang === "id" ? "PENYERANG" : "FORWARD",
    midfielder: lang === "id" ? "GELANDANG" : "MIDFIELDER",
    defender: lang === "id" ? "BEK" : "DEFENDER",
    goalkeeper: lang === "id" ? "KIPER" : "GOALKEEPER",
  };

  useEffect(() => {
    if (player) {
      setName(player.name);
      setNumber(player.number);
      setRole(player.role);
      setPhoto(player.photo);
      
      const currentStats = player.stats;
      setSpeed(currentStats?.speed ?? (player.role === "FWD" ? 85 : player.role === "MID" ? 78 : player.role === "DEF" ? 72 : 65));
      setStamina(currentStats?.stamina ?? (player.role === "MID" ? 85 : player.role === "DEF" ? 80 : player.role === "FWD" ? 75 : 70));
      setPassing(currentStats?.passing ?? (player.role === "MID" ? 84 : player.role === "FWD" ? 72 : player.role === "DEF" ? 68 : 55));
      setDefending(currentStats?.defending ?? (player.role === "DEF" ? 86 : player.role === "GK" ? 80 : player.role === "MID" ? 70 : 35));
      setDribbling(currentStats?.dribbling ?? (player.role === "FWD" ? 84 : player.role === "MID" ? 78 : player.role === "DEF" ? 60 : 30));
    }
  }, [player]);

  if (!player) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(player.id, {
      name: name.trim() || player.name,
      number: isNaN(number) ? player.number : number,
      role,
      photo,
      stats: {
        speed,
        stamina,
        passing,
        defending,
        dribbling
      }
    });
  };

  // Find other players dynamically for comparisons
  const otherPlayers = allPlayers.filter((p) => p.id !== player.id);

  useEffect(() => {
    if (otherPlayers.length > 0 && !comparePlayerId) {
      setComparePlayerId(otherPlayers[0].id);
    }
  }, [allPlayers, player.id]);

  const traits = [
    { key: "speed" as const, label: t.speedShort, icon: "🏃" },
    { key: "stamina" as const, label: t.staminaShort, icon: "🔋" },
    { key: "passing" as const, label: t.passingShort, icon: "🎯" },
    { key: "dribbling" as const, label: t.dribblingShort, icon: "⚽" },
    { key: "defending" as const, label: t.defendingShort, icon: "🛡️" },
  ];

  const center = 120;
  const radius = 62;

  const getCoordinates = (value: number, index: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const x = center + (value / 100) * radius * Math.cos(angle);
    const y = center + (value / 100) * radius * Math.sin(angle);
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  };

  const localStats = {
    speed,
    stamina,
    passing,
    dribbling,
    defending,
  };

  const comparePlayer = otherPlayers.find((p) => p.id === comparePlayerId) || null;

  const targetStats = comparePlayer ? {
    speed: comparePlayer.stats?.speed ?? (comparePlayer.role === "FWD" ? 85 : comparePlayer.role === "MID" ? 78 : comparePlayer.role === "DEF" ? 72 : 65),
    stamina: comparePlayer.stats?.stamina ?? (comparePlayer.role === "MID" ? 85 : comparePlayer.role === "DEF" ? 80 : comparePlayer.role === "FWD" ? 75 : 70),
    passing: comparePlayer.stats?.passing ?? (comparePlayer.role === "MID" ? 84 : comparePlayer.role === "FWD" ? 72 : comparePlayer.role === "DEF" ? 68 : 55),
    dribbling: comparePlayer.stats?.dribbling ?? (comparePlayer.role === "FWD" ? 84 : comparePlayer.role === "MID" ? 78 : comparePlayer.role === "DEF" ? 60 : 30),
    defending: comparePlayer.stats?.defending ?? (comparePlayer.role === "DEF" ? 86 : comparePlayer.role === "GK" ? 80 : comparePlayer.role === "MID" ? 70 : 35),
  } : null;

  const localPoints = [
    getCoordinates(localStats.speed, 0),
    getCoordinates(localStats.stamina, 1),
    getCoordinates(localStats.passing, 2),
    getCoordinates(localStats.dribbling, 3),
    getCoordinates(localStats.defending, 4),
  ].map((p) => `${p.x},${p.y}`).join(" ");

  const targetPoints = targetStats ? [
    getCoordinates(targetStats.speed, 0),
    getCoordinates(targetStats.stamina, 1),
    getCoordinates(targetStats.passing, 2),
    getCoordinates(targetStats.dribbling, 3),
    getCoordinates(targetStats.defending, 4),
  ].map((p) => `${p.x},${p.y}`).join(" ") : "";

  const bgPentagons = [20, 40, 60, 80, 100].map((level) => {
    return [0, 1, 2, 3, 4].map((index) => {
      const p = getCoordinates(level, index);
      return `${p.x},${p.y}`;
    }).join(" ");
  });

  const axisLines = [0, 1, 2, 3, 4].map((index) => {
    const outer = getCoordinates(100, index);
    return { x1: center, y1: center, x2: outer.x, y2: outer.y };
  });

  const getLabelAnchor = (index: number) => {
    if (index === 0) return "middle";
    if (index === 1 || index === 2) return "start";
    return "end";
  };

  const labelPositions = [0, 1, 2, 3, 4].map((index) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    // slightly further out
    const textRadius = radius + (index === 0 ? 12 : index === 2 || index === 3 ? 20 : 16);
    const x = center + textRadius * Math.cos(angle);
    const y = center + textRadius * Math.sin(angle);
    return { x, y };
  });

  const getTacticalVerdict = () => {
    if (!comparePlayer || !targetStats) return "";
    
    // Find the attribute with the biggest difference in favor of local edited player
    let maxDiff = -999;
    let preferredTrait = "";
    
    traits.forEach((t) => {
      const diff = localStats[t.key] - targetStats[t.key];
      if (diff > maxDiff) {
        maxDiff = diff;
        preferredTrait = t.label;
      }
    });

    if (maxDiff > 3) {
      if (lang === "id") {
        return `💡 Keputusan Taktikal: ${name || player.name} lebih unggul dalam aspek ${preferredTrait} dibanding ${comparePlayer.name}. Cocok digunakan untuk meningkatkan kualitas serangan/pertahanan posisi ini.`;
      } else {
        return `💡 Tactical Verdict: ${name || player.name} is superior in ${preferredTrait} compared to ${comparePlayer.name}. Suitable to boost play quality in this position.`;
      }
    } else {
      if (lang === "id") {
        return `💡 Posisi Seimbang: Kedua pemain memiliki profil statistik yang hampir sama. Pilihan taktikal bergantung pada stamina saat ini atau kecocokan formasi.`;
      } else {
        return `💡 Balanced Matchup: Both players have highly similar statistical profiles. Tactical choice depends on current stamina or formation fit.`;
      }
    }
  };

  const handleDownloadImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 700;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawCard = (imgObj?: HTMLImageElement) => {
      // 1. Card Background
      const cardGrad = ctx.createLinearGradient(0, 0, 0, 700);
      cardGrad.addColorStop(0, "#08070d");
      cardGrad.addColorStop(0.3, "#0e0e1a");
      cardGrad.addColorStop(0.7, "#120f26");
      cardGrad.addColorStop(1, "#070609");
      ctx.fillStyle = cardGrad;
      ctx.fillRect(0, 0, 500, 700);

      // Gold styling metallic lines
      ctx.strokeStyle = "rgba(99, 102, 241, 0.35)";
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, 488, 688);

      ctx.strokeStyle = "#4f46e5";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(14, 14, 472, 672);

      // Card Header
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.fillRect(14, 14, 472, 80);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t.downloadCardTitle, 250, 48);

      ctx.fillStyle = "#818cf8";
      ctx.font = "bold 10px monospace";
      ctx.fillText(t.tacticalSystemTitle, 250, 72);

      // Left Column stats (OVR rating, Name, Role, Jersey Number)
      const contentY = 130;
      
      // Calculate overall rating
      const ovr = Math.round((speed + stamina + passing + dribbling + defending) / 5);

      // Draw overall rating badge
      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(40, contentY, 80, 80);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 38px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(ovr.toString(), 80, contentY + 54);

      ctx.fillStyle = "#34d399";
      ctx.font = "bold 10px monospace";
      ctx.fillText(t.overallTitle, 80, contentY + 70);

      // Draw Name tag
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText((name || player.name).toUpperCase(), 140, contentY + 34);

      // Draw Position and Jersey number badges
      const roleText = role === "FWD" ? t.forward : role === "MID" ? t.midfielder : role === "DEF" ? t.defender : t.goalkeeper;
      
      // Role background
      ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
      ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(140, contentY + 48, 140, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#818cf8";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${roleText} (${role})`, 210, contentY + 64);

      // Jersey Number
      ctx.fillStyle = "rgba(244, 63, 94, 0.15)";
      ctx.strokeStyle = "rgba(244, 63, 94, 0.3)";
      ctx.beginPath();
      ctx.rect(295, contentY + 48, 50, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#fb7185";
      ctx.font = "bold 10px monospace";
      ctx.fillText(`#${number}`, 320, contentY + 64);

      // Photo Section on the right
      const rx = 360;
      const ry = contentY - 15;
      const rSize = 100;

      ctx.save();
      ctx.beginPath();
      ctx.arc(rx + rSize/2, ry + rSize/2, rSize/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (imgObj) {
        ctx.drawImage(imgObj, rx, ry, rSize, rSize);
      } else {
        // Draw elegant default icon shape if no photo could be loaded / is null
        ctx.fillStyle = "#1e1b4b";
        ctx.fillRect(rx, ry, rSize, rSize);
        ctx.fillStyle = "#4f46e5";
        ctx.beginPath();
        ctx.arc(rx + rSize/2, ry + rSize/3.5, rSize/5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rx + rSize/2, ry + rSize, rSize/2.2, Math.PI, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Border for photo circle
      ctx.strokeStyle = "rgba(99, 102, 241, 0.5)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(rx + rSize/2, ry + rSize/2, rSize/2, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Separator line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, 245);
      ctx.lineTo(470, 245);
      ctx.stroke();

      // Let's draw the diagram/radar section
      const mapCenter = { x: 250, y: 395 };
      const mapRadius = 100;

      const getCoordinatesMap = (value: number, index: number) => {
        const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
        const x = mapCenter.x + (value / 100) * mapRadius * Math.cos(angle);
        const y = mapCenter.y + (value / 100) * mapRadius * Math.sin(angle);
        return { x, y };
      };

      // Draw Background Pentagons
      [20, 40, 60, 80, 100].forEach((level) => {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const pt = getCoordinatesMap(level, i);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.stroke();
      });

      // Draw Axis Lines
      for (let i = 0; i < 5; i++) {
        const outer = getCoordinatesMap(100, i);
        ctx.beginPath();
        ctx.moveTo(mapCenter.x, mapCenter.y);
        ctx.lineTo(outer.x, outer.y);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.stroke();
      }

      // Draw Player Polygon (Cyan/Blue)
      const statsArray = [speed, stamina, passing, dribbling, defending];
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const pt = getCoordinatesMap(statsArray[i], i);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(59, 130, 246, 0.35)";
      ctx.strokeStyle = "rgba(59, 130, 246, 1)";
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.fill();
      ctx.stroke();

      // Label Names Around Diagram
      const fullLabels = [
        `${lang === "id" ? "SPD" : "SPD"} (${speed})`,
        `${lang === "id" ? "STM" : "STM"} (${stamina})`,
        `${lang === "id" ? "OPR" : "PAS"} (${passing})`,
        `${lang === "id" ? "GIR" : "DRI"} (${dribbling})`,
        `${lang === "id" ? "TAH" : "DEF"} (${defending})`
      ];

      for (let i = 0; i < 5; i++) {
        const angle = (index: number) => (index * 2 * Math.PI) / 5 - Math.PI / 2;
        const textRadius = mapRadius + 22;
        const tx = mapCenter.x + textRadius * Math.cos(angle(i));
        const ty = mapCenter.y + textRadius * Math.sin(angle(i));

        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = i === 0 ? "center" : i === 1 || i === 2 ? "left" : "right";
        ctx.fillText(fullLabels[i], tx, ty);
      }

      // Separator above list
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, 525);
      ctx.lineTo(470, 525);
      ctx.stroke();

      // Detail breakdown
      const startTextY = 555;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(t.attributeListTitle, 40, startTextY);

      const items = [
        { name: t.speedFullName, val: speed, color: "#3b82f6" },
        { name: t.staminaFullName, val: stamina, color: "#10b981" },
        { name: t.passingFullName, val: passing, color: "#f59e0b" },
        { name: t.dribblingFullName, val: dribbling, color: "#ec4899" },
        { name: t.defendingFullName, val: defending, color: "#ef4444" },
      ];

      items.forEach((item, index) => {
        const itemY = startTextY + 22 + index * 18;
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "normal 10px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`${index + 1}. ${item.name}`, 40, itemY);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "right";
        ctx.fillText(`${item.val} / 99`, 460, itemY);
      });

      // Footer branding/disclaimer
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.font = "italic 8px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t.systemTacticalLabel, 250, 665);
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = "rgba(99, 102, 241, 0.6)";
      ctx.fillText(`${t.tacticalProCard} • EXPORT GRADE PNG`, 250, 680);

      // Trigger automatic file download
      try {
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `kad_${(name || player.name).toLowerCase().replace(/\s+/g, "_")}.png`;
        link.href = dataURL;
        link.click();
      } catch (err) {
        console.error("Gagal menjana imej:", err);
      }
    };

    if (photo && (photo.startsWith("data:") || photo.startsWith("blob:") || photo.includes("unsplash.com"))) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        drawCard(img);
      };
      img.onerror = () => {
        drawCard();
      };
      img.src = photo;
    } else {
      drawCard();
    }
  };

  const handleTriggerPrint = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 700;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderForPrint = (imgObj?: HTMLImageElement) => {
      // Background and layouts (Light theme for printer friendliness)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 500, 700);

      // Clean print border (high contrast black border for printer paper friendly)
      ctx.strokeStyle = "#4f46e5";
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, 490, 690);

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.strokeRect(15, 15, 470, 670);

      // Header
      ctx.fillStyle = "#1e1b4b";
      ctx.fillRect(15, 15, 470, 75);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t.printReportTitle, 250, 48);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 11px monospace";
      ctx.fillText(t.printReportSubtitle, 250, 68);

      // Content placement
      const contentY = 130;
      const ovr = Math.round((speed + stamina + passing + dribbling + defending) / 5);

      // Overall box
      ctx.fillStyle = "#111827";
      ctx.beginPath();
      ctx.rect(40, contentY, 80, 80);
      ctx.fill();

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 36px monospace";
      ctx.textAlign = "center";
      ctx.fillText(ovr.toString(), 80, contentY + 54);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(t.printReportOvr, 80, contentY + 70);

      // Name
      ctx.fillStyle = "#111827";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText((name || player.name).toUpperCase(), 140, contentY + 34);

      // Role
      const roleText = role === "FWD" ? t.forward : role === "MID" ? t.midfielder : role === "DEF" ? t.defender : t.goalkeeper;
      ctx.fillStyle = "#4f46e5";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(`${roleText} (${role}) — ${lang === "id" ? "Jersey" : "Jersey"} #${number}`, 140, contentY + 58);

      // Photo Frame
      const rx = 360;
      const ry = contentY - 15;
      const rSize = 100;
      ctx.save();
      ctx.beginPath();
      ctx.arc(rx + rSize/2, ry + rSize/2, rSize/2, 0, Math.PI * 2);
      ctx.clip();

      if (imgObj) {
        ctx.drawImage(imgObj, rx, ry, rSize, rSize);
      } else {
        ctx.fillStyle = "#e5e7eb";
        ctx.fillRect(rx, ry, rSize, rSize);
        ctx.fillStyle = "#9ca3af";
        ctx.beginPath();
        ctx.arc(rx + rSize/2, ry + rSize/3.5, rSize/5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rx + rSize/2, ry + rSize, rSize/2.2, Math.PI, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.strokeStyle = "#4f46e5";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(rx + rSize/2, ry + rSize/2, rSize/2, 0, Math.PI * 2);
      ctx.stroke();

      // Divider
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(35, 235);
      ctx.lineTo(465, 235);
      ctx.stroke();

      // Radar Diagram Section
      const mapCenter = { x: 250, y: 385 };
      const mapRadius = 90;

      const getCoord = (val: number, idx: number) => {
        const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
        return {
          x: mapCenter.x + (val / 100) * mapRadius * Math.cos(angle),
          y: mapCenter.y + (val / 100) * mapRadius * Math.sin(angle),
        };
      };

      // Grid Pentagons
      [20, 40, 60, 80, 100].forEach((lvl) => {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const pt = getCoord(lvl, i);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.strokeStyle = "#bfdbfe";
        ctx.stroke();
      });

      // Axis
      for (let i = 0; i < 5; i++) {
        const pt = getCoord(100, i);
        ctx.beginPath();
        ctx.moveTo(mapCenter.x, mapCenter.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.strokeStyle = "#e5e7eb";
        ctx.stroke();
      }

      // Stats Area
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const pt = getCoord([speed, stamina, passing, dribbling, defending][i], i);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(79, 70, 229, 0.15)";
      ctx.strokeStyle = "rgba(79, 70, 229, 1)";
      ctx.lineWidth = 3.5;
      ctx.fill();
      ctx.stroke();

      // Labels
      const labels = [
        `${lang === "id" ? "SPD" : "SPD"} (${speed})`,
        `${lang === "id" ? "STM" : "STM"} (${stamina})`,
        `${lang === "id" ? "OPR" : "PAS"} (${passing})`,
        `${lang === "id" ? "GIR" : "DRI"} (${dribbling})`,
        `${lang === "id" ? "TAH" : "DEF"} (${defending})`,
      ];

      for (let i = 0; i < 5; i++) {
        const angle = (idx: number) => (idx * 2 * Math.PI) / 5 - Math.PI / 2;
        const tx = mapCenter.x + (mapRadius + 20) * Math.cos(angle(i));
        const ty = mapCenter.y + (mapRadius + 16) * Math.sin(angle(i));
        ctx.fillStyle = "#111827";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = i === 0 ? "center" : i === 1 || i === 2 ? "left" : "right";
        ctx.fillText(labels[i], tx, ty);
      }

      // Divider
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(35, 505);
      ctx.lineTo(465, 505);
      ctx.stroke();

      // Table representation of stats
      const tableY = 525;
      ctx.fillStyle = "#111827";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(t.printReportListTitle, 40, tableY);

      const itemsDefCount = [
        { name: t.printReportSpeed, val: speed },
        { name: t.printReportStamina, val: stamina },
        { name: t.printReportPassing, val: passing },
        { name: t.printReportDribbling, val: dribbling },
        { name: t.printReportDefending, val: defending },
      ];

      itemsDefCount.forEach((item, index) => {
        const rowY = tableY + 20 + index * 20;
        ctx.fillStyle = "#374151";
        ctx.font = "normal 10px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(item.name, 40, rowY);

        ctx.fillStyle = "#111827";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "right";
        ctx.fillText(`${item.val} / 99`, 460, rowY);

        // draw small gauge line
        ctx.fillStyle = "#e5e7eb";
        ctx.fillRect(240, rowY - 7, 120, 4);
        ctx.fillStyle = "#4f46e5";
        ctx.fillRect(240, rowY - 7, (item.val / 100) * 120, 4);
      });

      // footer
      ctx.fillStyle = "#6b7280";
      ctx.font = "normal 8px monospace";
      ctx.textAlign = "center";
      ctx.fillText(t.printReportFooter, 250, 665);

      // Open a popup window with image content to print cleanly
      const pWin = window.open("", "_blank");
      if (pWin) {
        const printImgUrl = canvas.toDataURL("image/png");
        pWin.document.write(`
          <html>
            <head>
              <title>${t.printReportPageTitle} - ${name || player.name}</title>
              <style>
                body {
                  margin: 0;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  background-color: #f3f4f6;
                  font-family: system-ui, sans-serif;
                }
                img {
                  max-width: 100%;
                  height: auto;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                  border-radius: 8px;
                }
                .btn-container {
                  margin-top: 20px;
                  display: flex;
                  gap: 12px;
                }
                button {
                  padding: 10px 20px;
                  background-color: #4f46e5;
                  color: white;
                  border: none;
                  border-radius: 6px;
                  font-weight: bold;
                  cursor: pointer;
                  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                  font-size: 14px;
                }
                button.secondary {
                  background-color: #6b7280;
                }
                @media print {
                  .btn-container {
                    display: none;
                  }
                  body {
                    background-color: white;
                  }
                  img {
                    box-shadow: none;
                  }
                }
              </style>
            </head>
            <body>
              <img src="${printImgUrl}" />
              <div class="btn-container">
                <button onclick="window.print()">${t.printNow}</button>
                <button class="secondary" onclick="window.close()">${t.close}</button>
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                  }, 500);
                }
              </script>
            </body>
          </html>
        `);
        pWin.document.close();
      }
    };

    if (photo && (photo.startsWith("data:") || photo.startsWith("blob:") || photo.includes("unsplash.com"))) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        renderForPrint(img);
      };
      img.onerror = () => {
        renderForPrint();
      };
      img.src = photo;
    } else {
      renderForPrint();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-150 flex items-center justify-center p-4">
      <div 
        className={`bg-[#0f0f12] border border-white/10 rounded-3xl w-full overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${showComparison || showPrintMode ? "max-w-[850px]" : "max-w-[420px]"} max-h-[95vh] md:max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-black/40 gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              {showComparison ? t.comparisonTitle : showPrintMode ? t.previewPrintTitle : t.customization}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-0.5 rounded-xl ml-auto shrink-0">
            <button
              type="button"
              onClick={() => setLang("id")}
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wider transition-all duration-200 ${
                lang === "id" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wider transition-all duration-200 ${
                lang === "en" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              EN
            </button>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:text-white transition-all text-gray-400 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-column Body layout */}
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10 overflow-hidden">
          {/* Left Column: Form area */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col gap-4 sm:gap-5 overflow-y-auto max-h-[65vh] sm:max-h-[72vh] md:max-h-[78vh] scrollbar-thin">
            {/* Avatar Profile custom uploads */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500/50 bg-[#121214] flex items-center justify-center shadow-lg transition-colors group-hover:border-blue-500">
                  {photo ? (
                    <img src={photo} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#121214]" />
                  )}
                </div>

                {/* Upload input overlay */}
                <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center rounded-full cursor-pointer transition-opacity text-center p-1">
                  <Camera className="w-5 h-5 text-white mb-0.5" />
                  <span className="text-[7.5px] text-gray-300 font-bold uppercase tracking-wider">
                    {lang === "id" ? "Unggah" : "Upload"}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
              
              <div className="text-center">
                <p className="text-[10px] text-gray-400">
                  {photo 
                    ? (lang === "id" ? "Klik lingkaran foto untuk mengganti foto" : "Click image circle to replace photo") 
                    : (lang === "id" ? "Klik lingkaran untuk mengunggah foto atlet" : "Click circle above to upload athlete photo")
                  }
                </p>
                
                {photo && (
                  <div className="flex justify-center mt-2">
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-xl transition-all hover:bg-rose-500/20 active:scale-95 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash className="w-2.5 h-2.5" />
                      {t.deletePhotoText}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Input Name */}
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  {t.backName}
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nando"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Compare and Statistics Buttons right below the Player Name */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button 
                  type="button"
                  onClick={() => {
                    setShowComparison(!showComparison);
                    if (!showComparison) setShowPrintMode(false);
                  }}
                  className={`py-2 px-3 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all transform active:scale-95 shadow-md cursor-pointer ${
                    showComparison 
                      ? "bg-indigo-600 border-indigo-400/40 text-white shadow-lg font-extrabold" 
                      : "bg-[#16161a] text-blue-400 border-blue-900/30 hover:bg-blue-950/40 hover:text-blue-300"
                  }`}
                  title={showComparison ? (lang === "id" ? "Sembunyikan Perbandingan" : "Hide Comparison") : (lang === "id" ? "Bandingkan Atlet Ini dengan Rekan Tim" : "Compare with Teammates")}
                >
                  <Scale className="w-3.5 h-3.5" /> 
                  <span className="truncate">{showComparison ? t.btnhideCompare : t.btnShowCompare}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setShowPrintMode(!showPrintMode);
                    if (!showPrintMode) setShowComparison(false);
                  }}
                  className={`py-2 px-3 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all transform active:scale-95 shadow-md cursor-pointer ${
                    showPrintMode 
                      ? "bg-emerald-600 border-emerald-400/40 text-white shadow-lg font-extrabold" 
                      : "bg-[#16161a] text-indigo-400 border-indigo-900/30 hover:bg-indigo-950/40 hover:text-indigo-300"
                  }`}
                  title={showPrintMode ? (lang === "id" ? "Sembunyikan Statistik & Kartu" : "Hide Stats Card") : (lang === "id" ? "Tinggi & Statistik Cetak Kartu" : "Card Stats & Print")}
                >
                  <Printer className="w-3.5 h-3.5" /> 
                  <span className="truncate">{showPrintMode ? t.btnHidePrint : t.btnShowPrint}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Number select */}
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                    {t.jerseyNumber}
                  </label>
                  <input 
                    type="number" 
                    value={number} 
                    onChange={(e) => setNumber(parseInt(e.target.value))}
                    placeholder="10"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Role selector */}
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                    {t.positionCategory}
                  </label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-2 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="GK">{t.goalkeeper} (GK)</option>
                    <option value="DEF">{t.defender} (DEF)</option>
                    <option value="MID">{t.midfielder} (MID)</option>
                    <option value="FWD">{t.forward} (FWD)</option>
                  </select>
                </div>
              </div>

              {/* Athlete Capabilities Panel (0-100 attributes) */}
              <div className="border-t border-white/5 pt-4">
                <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider block mb-3.5 flex items-center gap-1.5">
                  ⚡ {t.attributesTitle}
                </span>

                <div className="space-y-3.5">
                  {/* Speed Attribute */}
                  <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl">
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="text-gray-300 font-semibold flex items-center gap-1">🏃 {t.speedLabel}</span>
                      <div className="flex items-center gap-1 font-mono">
                        <span className={`font-black tracking-tight px-2 py-0.5 rounded text-[10px] ${
                          speed >= 85 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          speed >= 70 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          speed >= 50 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-white/5 text-gray-400"
                        }`}>{speed}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="99"
                      value={speed}
                      onChange={(e) => setSpeed(parseInt(e.target.value))}
                      className="w-full accent-blue-500 bg-black/60 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Stamina Attribute */}
                  <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl">
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="text-gray-300 font-semibold flex items-center gap-1">🔋 {t.staminaLabel}</span>
                      <div className="flex items-center gap-1 font-mono">
                        <span className={`font-black tracking-tight px-2 py-0.5 rounded text-[10px] ${
                          stamina >= 85 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          stamina >= 70 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          stamina >= 50 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-white/5 text-gray-400"
                        }`}>{stamina}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="99"
                      value={stamina}
                      onChange={(e) => setStamina(parseInt(e.target.value))}
                      className="w-full accent-blue-500 bg-black/60 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Passing Attribute */}
                  <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl">
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="text-gray-300 font-semibold flex items-center gap-1">🎯 {t.passingLabel}</span>
                      <div className="flex items-center gap-1 font-mono">
                        <span className={`font-black tracking-tight px-2 py-0.5 rounded text-[10px] ${
                          passing >= 85 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          passing >= 70 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          passing >= 50 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-white/5 text-gray-400"
                        }`}>{passing}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="99"
                      value={passing}
                      onChange={(e) => setPassing(parseInt(e.target.value))}
                      className="w-full accent-blue-500 bg-black/60 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Dribbling Attribute */}
                  <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl">
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="text-gray-300 font-semibold flex items-center gap-1">⚽ {t.dribblingLabel}</span>
                      <div className="flex items-center gap-1 font-mono">
                        <span className={`font-black tracking-tight px-2 py-0.5 rounded text-[10px] ${
                          dribbling >= 85 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          dribbling >= 70 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          dribbling >= 50 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-white/5 text-gray-400"
                        }`}>{dribbling}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="99"
                      value={dribbling}
                      onChange={(e) => setDribbling(parseInt(e.target.value))}
                      className="w-full accent-blue-500 bg-black/60 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Defending Attribute */}
                  <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl">
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="text-gray-300 font-semibold flex items-center gap-1">🛡️ {t.defendingLabel}</span>
                      <div className="flex items-center gap-1 font-mono">
                        <span className={`font-black tracking-tight px-2 py-0.5 rounded text-[10px] ${
                          defending >= 85 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          defending >= 70 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          defending >= 50 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-white/5 text-gray-400"
                        }`}>{defending}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="99"
                      value={defending}
                      onChange={(e) => setDefending(parseInt(e.target.value))}
                      className="w-full accent-blue-500 bg-black/60 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Comparative Dashboard (shown if showComparison is true) */}
          {showComparison && (
            <div className="flex-1 p-4 sm:p-5 flex flex-col gap-4 bg-slate-950/45 overflow-y-auto max-h-[65vh] sm:max-h-[72vh] md:max-h-[78vh] border-t md:border-t-0 border-white/10 scrollbar-thin">
              <div>
                <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  📊 Pilih Atlet Untuk Dibandingkan
                </span>
                {otherPlayers.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center text-xs text-slate-500">
                    Tiada atlet lain dalam pasukan untuk dibandingkan. Tambah atlet dalam senarai pasukan terlebih dahulu.
                  </div>
                ) : (
                  <select
                    value={comparePlayerId}
                    onChange={(e) => setComparePlayerId(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {otherPlayers.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#0f0f12]">
                        {p.name} ({p.role} #{p.number})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {comparePlayer && targetStats && (
                <div className="space-y-4">
                  {/* Radar Chart Section */}
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 text-center">
                      Radar Grafik Perbandingan
                    </span>
                    
                    {/* SVG Radar Chart */}
                    <svg width="240" height="240" viewBox="0 0 240 240" className="overflow-visible select-none">
                      {/* Nested background pentagons (grid) */}
                      {bgPentagons.map((points, idx) => (
                        <polygon
                          key={idx}
                          points={points}
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.04)"
                          strokeWidth="1"
                          strokeDasharray={idx === 4 ? "none" : "3,3"}
                        />
                      ))}

                      {/* Axis Lines */}
                      {axisLines.map((line, idx) => (
                        <line
                          key={idx}
                          x1={line.x1}
                          y1={line.y1}
                          x2={line.x2}
                          y2={line.y2}
                          stroke="rgba(255, 255, 255, 0.05)"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Target Player B Polygon (Pink) */}
                      <polygon
                        points={targetPoints}
                        fill="rgba(244, 63, 94, 0.15)"
                        stroke="rgba(244, 63, 94, 0.8)"
                        strokeWidth="2"
                        className="transition-all duration-300"
                      />

                      {/* Current Player A Polygon (Cyan/Blue) */}
                      <polygon
                        points={localPoints}
                        fill="rgba(59, 130, 246, 0.25)"
                        stroke="rgba(59, 130, 246, 0.9)"
                        strokeWidth="2.5"
                        className="transition-all duration-300"
                        strokeLinejoin="round"
                      />

                      {/* Outer boundary labels */}
                      {traits.map((trait, idx) => {
                        const pos = labelPositions[idx];
                        const anchor = getLabelAnchor(idx);
                        return (
                          <g key={idx}>
                            <text
                              x={pos.x}
                              y={pos.y}
                              textAnchor={anchor}
                              dominantBaseline="middle"
                              fill="#94a3b8"
                              className="text-[9px] font-black uppercase tracking-tight"
                            >
                              {trait.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Chart Legend */}
                    <div className="flex gap-4 mt-2 border-t border-white/5 pt-2 w-full justify-center text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-gray-300 font-bold">{name || player.name} (A)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span className="text-gray-400 font-bold">{comparePlayer.name} (B)</span>
                      </div>
                    </div>
                  </div>

                  {/* Comparisons list table */}
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-3.5 space-y-3">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block border-b border-white/5 pb-1.5">
                      {t.headToHeadMetrics}
                    </span>

                    <div className="space-y-3">
                      {traits.map((trait) => {
                        const valA = localStats[trait.key];
                        const valB = targetStats[trait.key];
                        const diff = valA - valB;
                        
                        return (
                          <div key={trait.key} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400 font-medium flex items-center gap-1">
                                {trait.icon} {trait.label}
                              </span>
                              <div className="flex items-center gap-1.5 font-mono text-xs">
                                <span className="text-blue-400 font-extrabold">{valA}</span>
                                <span className="text-gray-650">vs</span>
                                <span className="text-rose-400 font-extrabold">{valB}</span>
                                <span className={`text-[10px] font-black px-1 py-0.5 rounded ml-1 ${
                                  diff > 0 
                                    ? "bg-emerald-500/10 text-emerald-400" 
                                    : diff < 0 
                                      ? "bg-rose-500/10 text-rose-400" 
                                      : "bg-white/5 text-gray-400"
                                }`}>
                                  {diff > 0 ? `+${diff}` : diff}
                                </span>
                              </div>
                            </div>

                            {/* Dual stacked visual gauge with absolute overlap so they normalize perfectly to width without wrapping/overflowing */}
                            <div className="relative h-2 bg-black/60 rounded-full overflow-hidden">
                              {/* Background compare bar (Player B) - Pink */}
                              <div 
                                style={{ width: `${valB}%` }} 
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-rose-600 to-rose-400 opacity-50 rounded-full transition-all duration-300" 
                              />
                              {/* Foreground current active bar (Player A) - Blue */}
                              <div 
                                style={{ width: `${valA}%` }} 
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-300" 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Verbal evaluation feedback card */}
                  <div className="bg-indigo-950/20 border border-indigo-500/10 p-3.5 rounded-2xl">
                    <p className="text-[11px] leading-relaxed text-indigo-200 text-center uppercase tracking-wide font-medium">
                      {getTacticalVerdict()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Column: Interactive Print Card Preview (shown if showPrintMode is true) */}
          {showPrintMode && (
            <div className="flex-1 p-4 sm:p-5 flex flex-col gap-4 bg-[#0a0a0c] overflow-y-auto max-h-[65vh] sm:max-h-[72vh] md:max-h-[78vh] border-t md:border-t-0 border-white/10 scrollbar-thin">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                  {t.cardPreviewHeader}
                </span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">{t.readyLabel}</span>
              </div>

              {/* Card visualizer wrapper */}
              <div className="flex justify-center p-2">
                <div className="relative w-[280px] h-[400px] rounded-3xl overflow-hidden border-2 border-indigo-500/30 bg-gradient-to-b from-[#0e0e1a] via-[#120f26] to-[#070609] p-4 flex flex-col justify-between shadow-2xl shadow-indigo-950/20 group hover:border-indigo-500 transition-all duration-300">
                  {/* Glowing neon lines */}
                  <div className="absolute inset-2 border border-indigo-500/10 rounded-2xl pointer-events-none" />

                  {/* Header info */}
                  <div className="flex justify-between items-start z-10">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-emerald-400 leading-none">
                        {Math.round((speed + stamina + passing + dribbling + defending) / 5)}
                      </span>
                      <span className="text-[8px] tracking-widest font-bold text-emerald-500/70">OVR</span>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] font-black text-white truncate max-w-[130px]">
                        {(name || player.name).toUpperCase()}
                      </div>
                      <div className="text-[8px] text-indigo-300 font-bold uppercase tracking-wider">
                        {role === "FWD" ? t.forward : role === "MID" ? t.midfielder : role === "DEF" ? t.defender : t.goalkeeper}
                      </div>
                    </div>

                    {/* Number overlay label */}
                    <div className="bg-rose-500/10 text-rose-400 text-[10px] font-mono px-1.5 py-0.5 rounded font-black border border-rose-500/20">
                      #{number}
                    </div>
                  </div>

                  {/* Body diagram placeholder preview / visual styling */}
                  <div className="flex-1 flex flex-col items-center justify-center py-2 z-10 gap-3">
                    {/* Circle avatar */}
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500/50 bg-[#07070a] shadow-lg flex items-center justify-center">
                      {photo ? (
                        <img src={photo} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-7 h-7 text-gray-700" />
                      )}
                    </div>

                    {/* Mini SVG Radar graph representing live attributes */}
                    <svg width="140" height="140" viewBox="0 0 240 240" className="overflow-visible select-none opacity-80 group-hover:opacity-100 transition-opacity">
                      {bgPentagons.map((points, idx) => (
                        <polygon
                          key={idx}
                          points={points}
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.03)"
                          strokeWidth="1"
                        />
                      ))}
                      {axisLines.map((line, idx) => (
                        <line
                          key={idx}
                          x1={line.x1}
                          y1={line.y1}
                          x2={line.x2}
                          y2={line.y2}
                          stroke="rgba(255, 255, 255, 0.04)"
                          strokeWidth="1"
                        />
                      ))}
                      <polygon
                        points={localPoints}
                        fill="rgba(59, 130, 246, 0.2)"
                        stroke="rgba(59, 130, 246, 0.85)"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                      />
                      {traits.map((trait, idx) => {
                        const pos = labelPositions[idx];
                        const anchor = getLabelAnchor(idx);
                        return (
                          <text
                            key={idx}
                            x={pos.x}
                            y={pos.y}
                            textAnchor={anchor}
                            dominantBaseline="middle"
                            fill="#64748b"
                            className="text-[10px] font-bold"
                          >
                            {trait.key.toUpperCase()}
                          </text>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Foot styling brand */}
                  <div className="text-center z-10 border-t border-white/5 pt-1.5 flex justify-between items-center text-[8px] text-gray-500">
                    <span className="font-mono tracking-wider text-[7px]">{t.tacticalProCard}</span>
                    <span className="font-bold text-indigo-400">{t.goldenSquad}</span>
                  </div>
                </div>
              </div>

              {/* Interactive export trigger section */}
              <div className="bg-[#0f0f15]/80 border border-white/5 p-4 rounded-2xl flex flex-col gap-2.5 mt-auto">
                <span className="text-[11px] font-bold text-gray-300">{t.printFormatTitle}</span>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {t.printFormatDesc}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> {t.downloadPngText}
                  </button>
                  <button
                    type="button"
                    onClick={handleTriggerPrint}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" /> {t.printPdfText}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row gap-2.5 justify-between">
          <div className="flex gap-2 flex-wrap">
            <button 
              type="button"
              onClick={() => onDelete(player.id)}
              className="px-3.5 py-2 rounded-xl bg-rose-950/30 text-rose-400 border border-rose-950/60 hover:bg-rose-950/50 hover:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all transform active:scale-95"
            >
              <Trash className="w-3.5 h-3.5" /> {t.btnDeletePlayer}
            </button>
          </div>
          <div className="flex gap-2 justify-end">
            <button 
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:text-white font-bold text-xs transition-all"
            >
              {t.btnCancel}
            </button>
            <button 
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold text-xs text-white flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
            >
              {t.btnSave}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
