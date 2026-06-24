import React, { useState, useEffect, useRef } from 'react';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const deferredPromptRef = useRef<any>(null);

  useEffect(() => {
    console.log("InstallPrompt: Setting up beforeinstallprompt listener");
    // Check if user already dismissed
    if (localStorage.getItem('dismissed_install_prompt') === 'true') {
      return;
    }

    const handler = (e: any) => {
      console.log("InstallPrompt: beforeinstallprompt event fired", e);
      e.preventDefault();
      deferredPromptRef.current = e;
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('dismissed_install_prompt', 'true');
    setShowPrompt(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPromptRef.current) return;

    deferredPromptRef.current.prompt();
    const { outcome } = await deferredPromptRef.current.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    deferredPromptRef.current = null;
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md p-4 flex items-center justify-between border-b border-white/10 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-bold text-lg">C</div>
        <div>
          <h3 className="font-semibold text-sm">Install CineStream</h3>
          <p className="text-xs text-gray-400">Install for a native-like experience</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white text-sm px-3 py-1 transition-colors"
        >
          Dismiss
        </button>
        <button 
          onClick={handleInstallClick}
          className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Install
        </button>
      </div>
    </div>
  );
}
