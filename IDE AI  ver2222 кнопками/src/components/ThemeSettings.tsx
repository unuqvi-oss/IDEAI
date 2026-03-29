import React, { useState } from 'react';
import { Palette, Trash2, CheckCircle, Sliders } from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export const ThemeSettings: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([
    { id: '1', name: 'Dark Cyberpunk', colors: { primary: '#06b6d4', secondary: '#ec4899', accent: '#f59e0b', background: '#0f172a', text: '#f8fafc' } },
    { id: '2', name: 'Forest Mint', colors: { primary: '#10b981', secondary: '#34d399', accent: '#f59e0b', background: '#064e3b', text: '#f8fafc' } }
  ]);
  const [activeThemeId, setActiveThemeId] = useState('1');
  const [newTheme, setNewTheme] = useState<Omit<Theme, 'id'>>({
    name: 'Custom Theme',
    colors: { primary: '#3b82f6', secondary: '#10b981', accent: '#f59e0b', background: '#111827', text: '#f9fafb' }
  });

  const handleApplyTheme = (theme: Theme) => {
    setActiveThemeId(theme.id);
    document.documentElement.style.setProperty('--color-primary', theme.colors.primary);
    document.documentElement.style.setProperty('--color-secondary', theme.colors.secondary);
    document.documentElement.style.setProperty('--color-accent', theme.colors.accent);
    document.documentElement.style.setProperty('--color-bg', theme.colors.background);
    document.documentElement.style.setProperty('--color-text', theme.colors.text);
  };

  const handleSaveCustom = () => {
    const theme = { id: Date.now().toString(), ...newTheme };
    setThemes([...themes, theme]);
    handleApplyTheme(theme);
  };

  return (
    <div className="p-4 bg-slate-800 rounded-lg space-y-4">
      <div className="flex items-center gap-2 text-xl font-bold text-white">
        <Palette className="w-6 h-6 text-cyan-500" />
        Настройки тем и кастомных цветов
      </div>

      <div className="grid grid-cols-2 gap-4">
        {themes.map(theme => (
          <div key={theme.id} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${activeThemeId === theme.id ? 'border-cyan-500 bg-slate-700' : 'border-slate-700 bg-slate-900'}`} onClick={() => handleApplyTheme(theme)}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">{theme.name}</span>
              {activeThemeId === theme.id && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
            <div className="flex gap-2 mt-2">
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors.secondary }} />
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors.background }} />
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors.text }} />
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-900 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Sliders className="w-5 h-5 text-pink-500" />
          Создать свою палитру
        </div>
        <div>
          <label className="block text-sm text-slate-400">Название темы</label>
          <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" value={newTheme.name} onChange={e => setNewTheme({ ...newTheme, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(newTheme.colors).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs text-slate-400 capitalize">{key}</label>
              <div className="flex items-center gap-2">
                <input type="color" className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer" value={value} onChange={e => setNewTheme({ ...newTheme, colors: { ...newTheme.colors, [key]: e.target.value } })} />
                <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white" value={value} onChange={e => setNewTheme({ ...newTheme, colors: { ...newTheme.colors, [key]: e.target.value } })} />
              </div>
            </div>
          ))}
        </div>
        <button className="w-full py-2 bg-gradient-to-r from-pink-500 to-violet-600 rounded-lg text-white font-medium hover:from-pink-600 hover:to-violet-700" onClick={handleSaveCustom}>
          Применить и сохранить палитру
        </button>
      </div>
    </div>
  );
};
