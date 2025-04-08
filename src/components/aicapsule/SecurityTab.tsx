
import React from "react";
import { Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface SecurityTabProps {
  encryptionLevel: "standard" | "enhanced" | "quantum";
  setEncryptionLevel: (level: "standard" | "enhanced" | "quantum") => void;
}

const SecurityTab = ({ encryptionLevel, setEncryptionLevel }: SecurityTabProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="text-sm text-neon-blue font-medium">ENCRYPTION LEVEL</label>
        <div className="grid grid-cols-3 gap-4">
          <button
            className={`p-4 rounded-lg border ${
              encryptionLevel === "standard" 
                ? "border-neon-blue bg-neon-blue/20" 
                : "border-white/10 bg-space-light/30 hover:bg-space-light/50"
            } flex flex-col items-center gap-2`}
            onClick={() => setEncryptionLevel("standard")}
          >
            <Lock className="w-6 h-6 text-neon-blue" />
            <span className="text-xs text-white">STANDARD</span>
          </button>
          <button
            className={`p-4 rounded-lg border ${
              encryptionLevel === "enhanced" 
                ? "border-neon-pink bg-neon-pink/20" 
                : "border-white/10 bg-space-light/30 hover:bg-space-light/50"
            } flex flex-col items-center gap-2`}
            onClick={() => setEncryptionLevel("enhanced")}
          >
            <Lock className="w-6 h-6 text-neon-pink" />
            <span className="text-xs text-white">ENHANCED</span>
          </button>
          <button
            className={`p-4 rounded-lg border ${
              encryptionLevel === "quantum" 
                ? "border-neon-green bg-neon-green/20" 
                : "border-white/10 bg-space-light/30 hover:bg-space-light/50"
            } flex flex-col items-center gap-2`}
            onClick={() => setEncryptionLevel("quantum")}
          >
            <Lock className="w-6 h-6 text-neon-green" />
            <span className="text-xs text-white">QUANTUM</span>
          </button>
        </div>
        <p className="text-xs text-white/70 italic">
          {encryptionLevel === "standard" && "Standard encryption provides basic protection for your time capsule."}
          {encryptionLevel === "enhanced" && "Enhanced encryption provides stronger protection with dual-layer security."}
          {encryptionLevel === "quantum" && "Quantum encryption provides the highest level of protection with cutting-edge cryptography."}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm text-neon-blue font-medium">TIME LOCK MECHANISM</label>
            <p className="text-xs text-white/70">Enable blockchain-based time lock for maximum security</p>
          </div>
          <Switch id="timelock" defaultChecked />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm text-neon-blue font-medium">PRIVATE CAPSULE</label>
            <p className="text-xs text-white/70">Only you can view this capsule when opened</p>
          </div>
          <Switch id="private" />
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
