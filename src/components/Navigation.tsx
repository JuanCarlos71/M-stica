import React from 'react';
import { TabType } from '../types';

interface NavigationProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'inicio', label: 'Inicio', icon: 'home' },
  { id: 'quiromancia', label: 'Quiromancia', icon: 'front_hand' },
  { id: 'tarot', label: 'Tarot', icon: 'style' },
  { id: 'astrologia', label: 'Astrología', icon: 'auto_awesome' }
];

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onChangeTab }) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-black/60 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.7)]">
      <div className="max-w-lg mx-auto flex justify-around items-center h-20 px-4">
        {NAV_ITEMS.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-[#D4AF37] scale-105'
                  : 'text-gray-400 hover:text-gray-200 active:scale-95'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-0.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]"></span>
              )}
              <span
                className={`material-symbols-outlined text-[24px] transition-transform ${
                  isActive ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.7)]' : ''
                }`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span
                className={`font-sans text-[11px] tracking-widest uppercase font-medium ${
                  isActive ? 'font-bold text-[#D4AF37]' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
