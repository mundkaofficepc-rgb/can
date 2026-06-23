import React, { useState } from "react";
import { 
  X, User, CreditCard, HelpCircle, Shield, FileText, Copyright, 
  AlertTriangle, Info, LogOut, ChevronRight, Settings, Bell, 
  Globe, Moon, Smartphone, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsMenuProps {
  onClose: () => void;
}

type SettingSection = 
  | "overview"
  | "profile"
  | "subscription"
  | "help"
  | "privacy"
  | "terms"
  | "dmca"
  | "report"
  | "about";

export default function SettingsMenu({ onClose }: SettingsMenuProps) {
  const [activeSection, setActiveSection] = useState<SettingSection>("overview");

  const menuItems = [
    { id: "profile", label: "My Profile / Account", icon: User, color: "text-blue-400" },
    { id: "subscription", label: "Subscription / Plans", icon: CreditCard, color: "text-emerald-400" },
    { id: "help", label: "Help & Support", icon: HelpCircle, color: "text-orange-400" },
    { id: "privacy", label: "Privacy Policy", icon: Shield, color: "text-purple-400" },
    { id: "terms", label: "Terms of Use", icon: FileText, color: "text-zinc-400" },
    { id: "dmca", label: "DMCA / Copyright", icon: Copyright, color: "text-red-400" },
    { id: "report", label: "Report Issue", icon: AlertTriangle, color: "text-yellow-400" },
    { id: "about", label: "About Us", icon: Info, color: "text-cyan-400" },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5 text-blue-400" />
                Account Intelligence
              </h3>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-mono">Status: Level 4 Operator</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#ff4e00] to-orange-400 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-[#ff4e00]/20">
                  U
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Universal User</p>
                  <p className="text-xs text-zinc-400">operator@cinestream.io</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-zinc-300 hover:bg-white/10 transition-colors uppercase tracking-wider">Edit Credentials</button>
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-zinc-300 hover:bg-white/10 transition-colors uppercase tracking-wider">Security Logs</button>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-1">Network Preferences</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <div>
                      <p className="text-xs font-bold text-zinc-200">Ultra-HD Streaming</p>
                      <p className="text-[9px] text-zinc-500">Enable 4K resolution across all devices</p>
                    </div>
                  </div>
                  <div className="w-8 h-4 bg-[#ff4e00] rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-xs font-bold text-zinc-200">Neural Notifications</p>
                      <p className="text-[9px] text-zinc-500">Smart alerts for classified releases</p>
                    </div>
                  </div>
                  <div className="w-8 h-4 bg-zinc-800 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-zinc-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "subscription":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-white">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-400" />
                Subscription Core
              </h3>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-mono">Current Plan: CineStream Platinum</p>
            </div>
            <div className="space-y-4">
              <div className="relative p-6 bg-gradient-to-br from-[#111] to-[#050505] border border-[#ff4e00]/30 rounded-2xl overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#ff4e00]/10 rounded-full blur-3xl group-hover:bg-[#ff4e00]/20 transition-all duration-700"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-1 bg-[#ff4e00] text-[9px] font-bold rounded uppercase tracking-tighter shadow-lg shadow-[#ff4e00]/20">ACTIVE</span>
                    <span className="text-lg font-black font-mono tracking-tighter text-white">$19.99<span className="text-zinc-500 text-[10px]"> / MO</span></span>
                  </div>
                  <h4 className="mt-4 text-xl font-black italic tracking-tighter text-white">CINESTREAM <span className="text-[#ff4e00]">PLATINUM</span></h4>
                  <ul className="mt-4 space-y-2">
                    {["Unlimited 4K Extraction", "Spatial Audio Core Engaged", "No Signal Interruptions", "Classified Early Access"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <div className="h-1 w-1 rounded-full bg-[#ff4e00]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full py-2.5 bg-white/5 border border-white/10 hover:border-emerald-400/50 hover:bg-emerald-400/10 hover:text-emerald-400 text-zinc-400 text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest cursor-pointer">
                    Manage Uplink
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case "help":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-orange-400" />
                Support Terminal
              </h3>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-mono">Response Time Index: <span className="text-emerald-500">&lt; 15m</span></p>
            </div>
            <div className="space-y-3">
              {[
                { q: "How to initialize offline mode?", a: "Offline mode is available for Platinum users via the secure download portal." },
                { q: "Resetting neural sync preferences?", a: "Navigate to Account > Network Preferences to recalibrate sync levels." },
                { q: "Classified content access levels?", a: "Levels are determined by your operator status and subscription tier." }
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all cursor-pointer group">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">{item.q}</p>
                    <ChevronRight className="h-3 w-3 text-zinc-600 group-hover:text-[#ff4e00]" />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-4 bg-[#ff4e00] text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#ff4e00]/20 hover:scale-[1.02] active:scale-95 transition-all">
              Initialize Live Support Sync
            </button>
          </div>
        );
      case "privacy":
      case "terms":
      case "dmca":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                <Shield className="h-5 w-5 text-purple-400" />
                Legal Framework
              </h3>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-mono">Protocol: v4.2 Secure</p>
            </div>
            <div className="bg-[#050505] border border-white/5 rounded-2xl p-6 h-[400px] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Section 1.0: Neural Data Protocol</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                  At CineStream, we ensure that your cinematic preference patterns are processed within a secure sandbox environment. No data extraction occurs without explicit operator authorization. Metadata generated during atmospheric viewing is encrypted using standard 256-bit protocols.
                </p>
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Section 2.0: Extraction Limits</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                  Operators are permitted to stream high-fidelity cinema within the constraints of their designated plan. unauthorized distribution of extracted streams is strictly prohibited under cinematic law.
                </p>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                  Continued use of this atmosphere constitutes acceptance of these global protocols. Last updated: Sol 45.2.2026.
                </p>
              </div>
            </div>
          </div>
        );
      case "report":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                Signal Anomaly Report
              </h3>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-mono">Priority: Code Yellow</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Anomaly Type</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-zinc-300 focus:outline-none focus:border-[#ff4e00]/50 transition-colors">
                  <option className="bg-[#111]">Signal Interruption / Buffering</option>
                  <option className="bg-[#111]">Extraction UI Error</option>
                  <option className="bg-[#111]">Subscription Sync Issue</option>
                  <option className="bg-[#111]">Other Intelligence Defect</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Details</label>
                <textarea 
                  placeholder="Describe the anomaly detected in the stream..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-zinc-300 focus:outline-none focus:border-[#ff4e00]/50 min-h-[120px] transition-colors resize-none placeholder:text-zinc-700"
                />
              </div>
              <button className="w-full py-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all">
                Transmit Signal Anomaly
              </button>
            </div>
          </div>
        );
      case "about":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                <Info className="h-5 w-5 text-cyan-400" />
                CineStream Origin
              </h3>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-mono">Version: 1.0.4-beta</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                <div className="h-12 w-12 bg-[#ff4e00] rounded-xl flex items-center justify-center shadow-lg shadow-[#ff4e00]/20">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white italic">CINESTREAM GLOBAL</h4>
                  <p className="text-[10px] text-zinc-500">Distributed Architecture Atmospheric Entertainment</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed italic px-2">
                "We built CineStream to bridge the gap between AI intelligence and cinematic emotional depth. Every frame is a mission, every list is a discovery."
              </p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <p className="text-lg font-black text-white font-mono">14M+</p>
                  <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Operators</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <p className="text-lg font-black text-white font-mono">48TB/s</p>
                  <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Flux Rate</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        className="w-full max-w-4xl h-[85vh] max-h-[680px] bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-black/90"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-xl border border-white/10">
              <Settings className="h-5 w-5 text-zinc-400 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">System <span className="text-[#ff4e00]">Settings</span></h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Terminal Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-all border border-transparent hover:border-white/10 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Menu */}
          <div className="w-20 sm:w-64 border-r border-white/5 bg-black/20 overflow-y-auto custom-scrollbar">
            <div className="p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as SettingSection)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                    activeSection === item.id 
                      ? "bg-white/5 border border-white/10 text-white shadow-xl" 
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${activeSection === item.id ? "bg-[#ff4e00]/10" : "bg-white/5 group-hover:bg-white/10"} transition-all`}>
                    <item.icon className={`h-4 w-4 ${activeSection === item.id ? "text-[#ff4e00]" : item.color} transition-all`} />
                  </div>
                  <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
              
              <div className="pt-8 space-y-2">
                <button className="w-full flex items-center gap-3 p-3 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all group">
                  <div className="p-2 bg-red-500/5 rounded-lg group-hover:bg-red-500/10">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest">Log Out Account</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-zinc-600 hover:text-red-900 hover:bg-red-900/5 rounded-xl transition-all group">
                  <div className="p-2 bg-zinc-900/50 rounded-lg group-hover:bg-red-900/10">
                    <X className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest">Relinquish Acc</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Display */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-zinc-900/30 custom-scrollbar">
            {renderSectionContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/40 flex justify-center items-center gap-6">
          <div className="flex -space-x-3">
             {[Smartphone, Globe, Moon].map((Icon, i) => (
               <div key={i} className="h-8 w-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center">
                 <Icon className="h-3 w-3 text-zinc-500" />
               </div>
             ))}
          </div>
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">CineStream Neural Network • Atmospheric Node 7</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
