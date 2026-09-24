import React from "react";
import { Header } from "./Header";

export function Layout({ children, className = "", background = null }) {
  return (
    <div className={`min-h-screen bg-background transition-colors duration-500 relative ${className}`}>
      {background}
      <div className="py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8 relative z-10">
        <Header />
        <main className="w-full animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
