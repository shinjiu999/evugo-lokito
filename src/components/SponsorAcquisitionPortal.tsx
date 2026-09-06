import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Megaphone,
  Sparkles,
  Send,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Mail,
  Eye,
  Calendar,
  DollarSign,
  Building2,
  FileText,
  Tag,
  ShieldCheck,
  TrendingUp,
  Clock,
  Trash2,
  Award,
  ChevronRight
} from "lucide-react";
import { soundManager } from "../utils/sound";

interface SponsorInquiry {
  id: string;
  brandName: string;
  category: string;
  contactName: string;
  contactWhatsapp: string;
  contactEmail: string;
  websiteUrl: string;
  slotChoice: "pitch_banner" | "briefing_sheet" | "virtual_gear";
  duration: "1_week" | "1_month" | "3_months";
  budgetOffer: string;
  proposalMessage: string;
  submittedAt: string;
  status: "pending_review" | "slot_scheduled" | "active";
}

interface SponsorAcquisitionPortalProps {
  lang?: "id" | "en";
}

export default function SponsorAcquisitionPortal({ lang = "id" }: SponsorAcquisitionPortalProps) {
  const [activeTab, setActiveTab] = useState<"apply" | "history" | "slots">("apply");
  const [isExpanded, setIsExpanded] = useState(false);

  // Form states
  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState("Apparel & Sepatu Bola");
  const [contactName, setContactName] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [slotChoice, setSlotChoice] = useState<"pitch_banner" | "briefing_sheet" | "virtual_gear">("pitch_banner");
  const [duration, setDuration] = useState<"1_week" | "1_month" | "3_months">("1_month");
  const [budgetOffer, setBudgetOffer] = useState("");
  const [proposalMessage, setProposalMessage] = useState("");

  // Submission feedback
  const [submittedInquiry, setSubmittedInquiry] = useState<SponsorInquiry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiryList, setInquiryList] = useState<SponsorInquiry[]>([]);

  // Load inquiries from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tactigen_sponsor_inquiries");
      if (stored) {
        setInquiryList(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // Save inquiries helper
  const saveInquiries = (updated: SponsorInquiry[]) => {
    setInquiryList(updated);
    try {
      localStorage.setItem("tactigen_sponsor_inquiries", JSON.stringify(updated));
    } catch (e) {}
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !contactWhatsapp.trim()) {
      return;
    }

    setIsSubmitting(true);

    const newInquiry: SponsorInquiry = {
      id: `TACTI-ADV-${Math.floor(10000 + Math.random() * 90000)}`,
      brandName: brandName.trim(),
      category,
      contactName: contactName.trim() || brandName.trim(),
      contactWhatsapp: contactWhatsapp.trim(),
      contactEmail: contactEmail.trim(),
      websiteUrl: websiteUrl.trim(),
      slotChoice,
      duration,
      budgetOffer: budgetOffer.trim() || "Penawaran Terbuka / Nego",
      proposalMessage: proposalMessage.trim(),
      submittedAt: new Date().toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      status: "pending_review"
    };

    setTimeout(() => {
      const updated = [newInquiry, ...inquiryList];
      saveInquiries(updated);
      setSubmittedInquiry(newInquiry);
      setIsSubmitting(false);

      try {
        soundManager.playWhistle();
      } catch (err) {}
    }, 600);
  };

  const handleDeleteInquiry = (id: string) => {
    const filtered = inquiryList.filter((item) => item.id !== id);
    saveInquiries(filtered);
    if (submittedInquiry?.id === id) {
      setSubmittedInquiry(null);
    }
  };

  const slotLabels = {
    pitch_banner: lang === "id" ? "Slot 1: Banner Papan Utama (Pitch Billboard)" : "Slot 1: Tactical Pitch Billboard",
    briefing_sheet: lang === "id" ? "Slot 2: Lembar Match Briefing UEFA Pro (PDF/Cetak)" : "Slot 2: UEFA Pro Match Briefing Sheet (PDF/Print)",
    virtual_gear: lang === "id" ? "Slot 3: Partner Perlengkapan Virtual (Bola/Jersey)" : "Slot 3: Tactical Virtual Gear Partner"
  };

  const durationLabels = {
    "1_week": lang === "id" ? "1 Pekan (Turnamen/Uji Coba)" : "1 Week (Tournament Special)",
    "1_month": lang === "id" ? "1 Bulan (Rekomendasi Terbaik)" : "1 Month (Best Recommended)",
    "3_months": lang === "id" ? "3 Bulan / 1 Musim Penuh" : "3 Months / Full Season"
  };

  // Preformatted WhatsApp message for instant advertiser dispatch
  const getWhatsappUrl = (inquiry: SponsorInquiry) => {
    const text = encodeURIComponent(
      `Halo Tim Manajemen Tactigen Pro!\n\n` +
      `Saya tertarik memasang iklan / sponsorship resmi di platform Tactigen:\n` +
      `📌 No. Pengajuan: ${inquiry.id}\n` +
      `🏷️ Brand: ${inquiry.brandName} (${inquiry.category})\n` +
      `🎯 Pilihan Slot: ${slotLabels[inquiry.slotChoice]}\n` +
      `⏱️ Durasi: ${durationLabels[inquiry.duration]}\n` +
      `💰 Budget Tawaran: ${inquiry.budgetOffer}\n` +
      `🌐 Link/Web: ${inquiry.websiteUrl || "-"}\n` +
      `💬 Pesan Tambahan: ${inquiry.proposalMessage || "Mohon info jadwal tayang & ketersediaan slot."}\n\n` +
      `Terima kasih!`
    );
    // WhatsApp direct click link
    return `https://wa.me/6281234567890?text=${text}`;
  };

  const getEmailUrl = (inquiry: SponsorInquiry) => {
    const subject = encodeURIComponent(`[SPONSORSHIP TACTIGEN] Pengajuan Iklan: ${inquiry.brandName} (${inquiry.id})`);
    const body = encodeURIComponent(
      `Kepada Tim Kemitraan & Periklanan Tactigen Pro,\n\n` +
      `Berikut adalah proposal kemitraan penayangan iklan kami:\n` +
      `- ID Pengajuan: ${inquiry.id}\n` +
      `- Brand: ${inquiry.brandName}\n` +
      `- Kategori: ${inquiry.category}\n` +
      `- Kontak WhatsApp: ${inquiry.contactWhatsapp}\n` +
      `- Email: ${inquiry.contactEmail}\n` +
      `- Slot Pilihan: ${slotLabels[inquiry.slotChoice]}\n` +
      `- Durasi: ${durationLabels[inquiry.duration]}\n` +
      `- Tawaran Budget: ${inquiry.budgetOffer}\n` +
      `- Link Website: ${inquiry.websiteUrl}\n` +
      `- Rincian Kampanye: ${inquiry.proposalMessage}\n\n` +
      `Mohon konfirmasi ketersediaan slot dan proses penjadwalan.\n\nSalam hormat,\n${inquiry.contactName}`
    );
    return `mailto:sponsor@tactigen.pro?subject=${subject}&body=${body}`;
  };

  return (
    <div id="sponsor-acquisition-portal" className="w-full bg-[#0b0c10] border border-emerald-500/20 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 shrink-0 mt-0.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-white tracking-wide uppercase">
                {lang === "id" ? "Ruang Kemitraan & Pasang Iklan Resmi" : "Official Advertising & Sponsorship Hub"}
              </h3>
              <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {lang === "id" ? "Slot Terbuka" : "Slots Available"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
              {lang === "id"
                ? "Promosikan akademi, brand apparel, suplemen, atau produk Anda langsung ke hadapan ribuan pelatih & analis taktik."
                : "Promote your football academy, gear brand, or sports products directly to active coaches & tactical analysts."}
            </p>
          </div>
        </div>

        {/* Quick Tab Switcher */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0 self-start md:self-auto">
          <button
            onClick={() => {
              setActiveTab("apply");
              setIsExpanded(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "apply"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{lang === "id" ? "Pasang Iklan" : "Advertise Here"}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("slots");
              setIsExpanded(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "slots"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{lang === "id" ? "Pilihan Slot" : "View Slots"}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("history");
              setIsExpanded(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
              activeTab === "history"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === "id" ? "Pengajuan Saya" : "My Inquiries"}</span>
            {inquiryList.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-black flex items-center justify-center">
                {inquiryList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all text-xs font-mono ml-1"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* QUICK HIGHLIGHT METRICS (Always visible) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-white block">35,000+</span>
            <span className="text-[9px] text-gray-400 font-medium leading-tight block">
              {lang === "id" ? "Tayangan Taktis / Bulan" : "Monthly Tactical Views"}
            </span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-white block">100% Sepakbola</span>
            <span className="text-[9px] text-gray-400 font-medium leading-tight block">
              {lang === "id" ? "Pelatih, SSB & Analis" : "Coaches, Academies, Staff"}
            </span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-white block">PDF & Print Briefing</span>
            <span className="text-[9px] text-gray-400 font-medium leading-tight block">
              {lang === "id" ? "Branding Masuk Ruang Ganti" : "Branding In Match Sheets"}
            </span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-white block">Automated Booking</span>
            <span className="text-[9px] text-gray-400 font-medium leading-tight block">
              {lang === "id" ? "Verifikasi & Tayang Cepat" : "Instant Direct Connect"}
            </span>
          </div>
        </div>
      </div>

      {/* EXPANDABLE BODY CONTENT */}
      {isExpanded && (
        <div className="pt-2 border-t border-white/5 space-y-4 animate-fadeIn">
          {/* TAB 1: FORM PENGAJUAN IKLAN OTOMATIS */}
          {activeTab === "apply" && (
            <div className="space-y-4">
              {/* Submission Confirmation Card */}
              {submittedInquiry && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 space-y-3 shadow-lg shadow-emerald-500/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wide">
                          {lang === "id" ? "Pengajuan Kemitraan Berhasil Dicatat!" : "Sponsorship Inquiry Registered!"}
                        </h4>
                        <p className="text-[10.5px] text-emerald-300">
                          {lang === "id" 
                            ? `ID Registrasi: ${submittedInquiry.id} • Kami siap menjadwalkan slot promosi ${submittedInquiry.brandName}.`
                            : `Registration ID: ${submittedInquiry.id} • Ready to schedule promotion for ${submittedInquiry.brandName}.`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSubmittedInquiry(null)}
                      className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 bg-white/5 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href={getWhatsappUrl(submittedInquiry)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{lang === "id" ? "Hubungi via WhatsApp (Konfirmasi Otomatis)" : "Connect via WhatsApp"}</span>
                    </a>

                    <a
                      href={getEmailUrl(submittedInquiry)}
                      className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{lang === "id" ? "Kirim Email Resmi" : "Send Formal Email"}</span>
                    </a>
                  </div>
                </motion.div>
              )}

              {/* Form & Live Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* FORM LEFT COLUMN */}
                <form onSubmit={handleFormSubmit} className="lg:col-span-7 space-y-3 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      {lang === "id" ? "Formulir Pendaftaran Pengiklan" : "Advertiser Registration Form"}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {lang === "id" ? "Proses verifikasi < 2 jam" : "Fast verification"}
                    </span>
                  </div>

                  {/* Brand & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block">
                        {lang === "id" ? "Nama Brand / Usaha / Akademi" : "Brand / Business / Academy Name"} *
                      </label>
                      <input
                        type="text"
                        required
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g., Team A Soccer Academy / Strike Gear"
                        className="w-full bg-black/50 border border-white/10 text-xs rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block">
                        {lang === "id" ? "Kategori Usaha" : "Business Category"}
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-medium"
                      >
                        <option value="Apparel & Sepatu Bola">👟 Apparel & Sepatu Bola</option>
                        <option value="Akademi & SSB (Sekolah Sepakbola)">⚽ Akademi & SSB Sepakbola</option>
                        <option value="Nutrisi & Suplemen Atlet">⚡ Nutrisi & Suplemen Olahraga</option>
                        <option value="Turnamen & Event Olahraga">🏆 Turnamen & Event Sepakbola</option>
                        <option value="Aplikasi & Analitik Olahraga">📱 Software / App Olahraga</option>
                        <option value="Fasilitas & Sewa Lapangan">🏟️ Fasilitas & Mini Soccer / Futsal</option>
                        <option value="Brand Komersial / Lainnya">💼 Brand Komersial Lainnya</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact WhatsApp & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block">
                        {lang === "id" ? "Nomor WhatsApp Kontak" : "WhatsApp Number"} *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactWhatsapp}
                        onChange={(e) => setContactWhatsapp(e.target.value)}
                        placeholder="e.g., 08123456789 atau +62..."
                        className="w-full bg-black/50 border border-white/10 text-xs rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-medium font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block">
                        {lang === "id" ? "Email Resmi / Website" : "Official Email / Website"}
                      </label>
                      <input
                        type="text"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="partner@brandanda.com"
                        className="w-full bg-black/50 border border-white/10 text-xs rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Slot Choice & Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block">
                        {lang === "id" ? "Pilihan Slot Penayangan" : "Advertising Slot"}
                      </label>
                      <select
                        value={slotChoice}
                        onChange={(e) => setSlotChoice(e.target.value as any)}
                        className="w-full bg-black/50 border border-white/10 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-medium"
                      >
                        <option value="pitch_banner">📍 Slot 1: Papan Billboard Lapangan</option>
                        <option value="briefing_sheet">📄 Slot 2: Lembar Briefing UEFA Pro (Cetak)</option>
                        <option value="virtual_gear">⚽ Slot 3: Branding Perlengkapan Taktis</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block">
                        {lang === "id" ? "Rencana Durasi Promosi" : "Promotion Duration"}
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value as any)}
                        className="w-full bg-black/50 border border-white/10 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-medium"
                      >
                        <option value="1_week">1 Pekan (Event / Peluncuran)</option>
                        <option value="1_month">1 Bulan Penuh (Rekomendasi Terbaik)</option>
                        <option value="3_months">3 Bulan / 1 Musim Kompetisi</option>
                      </select>
                    </div>
                  </div>

                  {/* Budget offer & Message */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block">
                        {lang === "id" ? "Tawaran Anggaran / Budget (IDR)" : "Budget Proposal"}
                      </label>
                      <input
                        type="text"
                        value={budgetOffer}
                        onChange={(e) => setBudgetOffer(e.target.value)}
                        placeholder="e.g., Rp 500.000 / fleksibel"
                        className="w-full bg-black/50 border border-white/10 text-xs rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block">
                        {lang === "id" ? "Tautan Website / Akun IG" : "Website / Social Media Link"}
                      </label>
                      <input
                        type="text"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://instagram.com/brandanda"
                        className="w-full bg-black/50 border border-white/10 text-xs rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block">
                      {lang === "id" ? "Pesan / Slogan Promosi untuk Materi Iklan" : "Ad Tagline / Campaign Message"}
                    </label>
                    <textarea
                      rows={2}
                      value={proposalMessage}
                      onChange={(e) => setProposalMessage(e.target.value)}
                      placeholder="e.g., Diskon 20% pendaftaran siswa akademi baru. Kunjungi booth kami di..."
                      className="w-full bg-black/50 border border-white/10 text-xs rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-medium resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[9.5px] text-gray-500">
                      🔒 Data kontak Anda dijaga aman & rahasia.
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmitting || !brandName.trim() || !contactWhatsapp.trim()}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-40 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>Merekam Pengajuan...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{lang === "id" ? "Kirim Pengajuan Iklan" : "Submit Ad Proposal"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* RIGHT COLUMN: LIVE SIMULATOR PREVIEW */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-between flex-1">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {lang === "id" ? "Simulasi Tayangan Iklan Anda" : "Live Banner Preview Simulator"}
                      </span>
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        {lang === "id"
                          ? "Lihat bagaimana identitas brand Anda akan langsung ditampilkan kepada pelatih sepakbola saat menyusun strategi di papan taktik:"
                          : "Preview how your brand will appear to coaches during tactical sessions:"}
                      </p>
                    </div>

                    {/* LIVE SIMULATED BANNER CARD */}
                    <div className="my-3 p-4 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-[#0e1814] via-[#09120e] to-[#060c0a] shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[8.5px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-black font-mono uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                          <Award className="w-2.5 h-2.5" /> {category}
                        </span>
                        <span className="text-[8px] text-gray-500 font-mono">
                          {slotLabels[slotChoice].split(":")[0]}
                        </span>
                      </div>

                      <h5 className="text-xs font-black text-white uppercase tracking-wide truncate">
                        {brandName.trim() || "NAMA BRAND ANDA"}
                      </h5>

                      <p className="text-[10px] text-gray-300 mt-1 leading-relaxed line-clamp-2">
                        {proposalMessage.trim() || "Promosikan penawaran spesial, pendaftaran akademi, atau produk perlengkapan bola Anda di sini dengan jangkauan 35.000+ tayangan taktis."}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Partner Resmi Terverifikasi
                        </span>
                        <span className="px-2.5 py-1 bg-emerald-600 text-white text-[9.5px] font-black rounded-lg flex items-center gap-1 shadow-sm">
                          Lihat Detail <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>

                    {/* Quick benefits check */}
                    <div className="space-y-1.5 pt-2 border-t border-white/5 text-[9.5px] text-gray-400">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        ✓ Laporan tayangan berkala (impression insights)
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        ✓ Tautan langsung ke nomor WhatsApp atau Toko Online Anda
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        ✓ Dukungan materi grafis tim desainer Tactigen Pro
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAIL PILIHAN SLOT */}
          {activeTab === "slots" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Slot 1 */}
              <div className="bg-white/[0.02] border border-emerald-500/20 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-black font-mono uppercase">
                      Paling Populer
                    </span>
                    <span className="text-xs font-bold text-gray-400">Slot 1</span>
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wide">
                    Banner Billboard Papan Taktik
                  </h4>
                  <p className="text-[10.5px] text-gray-300 leading-relaxed">
                    Tampil permanen tepat di bawah papan simulasi formasi. Dilihat terus-menerus oleh pelatih sepanjang sesi latihan & racikan strategi.
                  </p>
                </div>
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">~35.000 Tayangan/Bulan</span>
                  <button
                    onClick={() => {
                      setSlotChoice("pitch_banner");
                      setActiveTab("apply");
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Pilih Slot Ini →
                  </button>
                </div>
              </div>

              {/* Slot 2 */}
              <div className="bg-white/[0.02] border border-blue-500/20 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-black font-mono uppercase">
                      Nilai Prestise
                    </span>
                    <span className="text-xs font-bold text-gray-400">Slot 2</span>
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wide">
                    Lembar Briefing UEFA Pro (PDF/Cetak)
                  </h4>
                  <p className="text-[10.5px] text-gray-300 leading-relaxed">
                    Logo & sponsor tertera pada lembar dokumen matchday resmi yang dicetak dan dibawa pelatih ke ruang ganti pertandingan.
                  </p>
                </div>
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">12.000+ Lembar Dicetak</span>
                  <button
                    onClick={() => {
                      setSlotChoice("briefing_sheet");
                      setActiveTab("apply");
                    }}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Pilih Slot Ini →
                  </button>
                </div>
              </div>

              {/* Slot 3 */}
              <div className="bg-white/[0.02] border border-amber-500/20 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-black font-mono uppercase">
                      Interaktif
                    </span>
                    <span className="text-xs font-bold text-gray-400">Slot 3</span>
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wide">
                    Partner Perlengkapan Virtual (Gear)
                  </h4>
                  <p className="text-[10.5px] text-gray-300 leading-relaxed">
                    Logo brand Anda disematkan pada item taktis interaktif (bola sepak resmi, rompi latihan, cone drill lapangan).
                  </p>
                </div>
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Interaksi Langsung</span>
                  <button
                    onClick={() => {
                      setSlotChoice("virtual_gear");
                      setActiveTab("apply");
                    }}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Pilih Slot Ini →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RIWAYAT PENGAJUAN SAYA */}
          {activeTab === "history" && (
            <div className="space-y-3">
              {inquiryList.length === 0 ? (
                <div className="p-6 text-center bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                  <Clock className="w-8 h-8 text-gray-500 mx-auto" />
                  <h5 className="text-xs font-bold text-white">Belum Ada Pengajuan Tersimpan</h5>
                  <p className="text-[10px] text-gray-400 max-w-sm mx-auto">
                    Kirim formulir penawaran sponsor Anda melalui tab "Pasang Iklan" untuk memantau status pengajuan slot di sini.
                  </p>
                  <button
                    onClick={() => setActiveTab("apply")}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg mt-2 cursor-pointer"
                  >
                    Buka Formulir Pendaftaran →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {inquiryList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-white">{item.brandName}</span>
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            {item.id}
                          </span>
                          <span className="text-[8px] bg-white/5 text-gray-400 px-1.5 py-0.2 rounded font-mono">
                            {item.submittedAt}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-2 flex-wrap">
                          <span>📍 {slotLabels[item.slotChoice]}</span>
                          <span>• ⏱️ {durationLabels[item.duration]}</span>
                          <span>• 💰 {item.budgetOffer}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        <a
                          href={getWhatsappUrl(item)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border border-emerald-500/30"
                          title="Kirim via WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          onClick={() => handleDeleteInquiry(item.id)}
                          className="p-1.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-all"
                          title="Hapus riwayat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
