import { useState, useEffect } from "react";
import { Player } from "../types";
import { X, Camera, Shield, User, Info, Check, Trash } from "lucide-react";

interface PlayerEditorModalProps {
  player: Player | null;
  onSave: (id: string, updated: Partial<Player>) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
}

// Creative preset cartoon illustration avatars
const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
];

export default function PlayerEditorModal({ player, onSave, onClose, onDelete }: PlayerEditorModalProps) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState<number>(10);
  const [role, setRole] = useState<"GK" | "DEF" | "MID" | "FWD">("MID");
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (player) {
      setName(player.name);
      setNumber(player.number);
      setRole(player.role);
      setPhoto(player.photo);
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
      photo
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-150 flex items-center justify-center p-4">
      <div 
        className="bg-[#0f0f12] border border-white/10 rounded-3xl w-full max-w-[420px] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Kostumisasi Atlet
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:text-white transition-all text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form area */}
        <div className="p-5 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
          {/* Avatar Profile custom uploads */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500 bg-black flex items-center justify-center shadow-lg">
                {photo ? (
                  <img src={photo} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-gray-600" />
                )}
              </div>

              {/* Upload input overlay */}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full cursor-pointer transition-opacity">
                <Camera className="w-5 h-5 text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                />
              </label>
            </div>
            
            <div className="text-center">
              <p className="text-[10px] text-gray-500">Pilih foto wajah atau gunakan avatar default di bawah:</p>
              
              {/* Profile preset selections */}
              <div className="flex justify-center gap-2 mt-2">
                {PRESET_AVATARS.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => setPhoto(preset)}
                    className="w-8 h-8 rounded-full overflow-hidden border border-white/10 hover:border-blue-500 transition-all active:scale-95 shrink-0"
                  >
                    <img src={preset} className="w-full h-full object-cover" />
                  </button>
                ))}
                {photo && (
                  <button
                    onClick={() => setPhoto(null)}
                    className="text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 rounded-xl h-8 shrink-0 flex items-center justify-center"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Input Name */}
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                Nama Punggung
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Nando"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Number select */}
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Nomor Jersey
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
                  Kategori Posisi
                </label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-2 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="GK">GoalKeeper (GK)</option>
                  <option value="DEF">Defender (DEF)</option>
                  <option value="MID">Midfielder (MID)</option>
                  <option value="FWD">Forward (FWD)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-white/10 bg-black/40 flex gap-2 justify-between">
          <div>
            <button 
              onClick={() => onDelete(player.id)}
              className="px-3.5 py-2 rounded-xl bg-rose-950/30 text-rose-400 border border-rose-950/60 hover:bg-rose-950/50 hover:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all transform active:scale-95"
            >
              <Trash className="w-3.5 h-3.5" /> Hapus Pemain
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:text-white font-bold text-xs transition-all"
            >
              Batal
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold text-xs text-white flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
