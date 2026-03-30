import React, { useState } from 'react';
import { LogIn, User, CloudUpload, CloudDownload, LogOut, CheckCircle, Save } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  updatedAt: string;
}

export const UserAuth: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState<Project[]>([
    { id: 'p1', name: 'My Landing App', updatedAt: '2025-01-20' },
    { id: 'p2', name: 'Portfolio Template', updatedAt: '2025-02-12' }
  ]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setUser({ name: email.split('@')[0], email });
    }
  };

  return (
    <div className="p-4 bg-slate-800 rounded-lg space-y-4">
      {!user ? (
        <form onSubmit={handleAuth} className="p-4 bg-slate-900 rounded-lg space-y-4">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <LogIn className="w-6 h-6 text-indigo-500" />
            Авторизация
          </div>
          <div>
            <label className="block text-sm text-slate-400">Email</label>
            <input type="email" required className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-400">Password</label>
            <input type="password" required className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700">
            {isLogin ? 'Войти в аккаунт' : 'Зарегистрироваться'}
          </button>
          <div className="text-center text-xs text-slate-400 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Есть аккаунт? Войти'}
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
            <div className="flex items-center gap-2 text-white">
              <User className="w-8 h-8 p-1 bg-indigo-500 rounded-full" />
              <div>
                <div className="font-semibold text-white">{user.name}</div>
                <div className="text-xs text-slate-400">{user.email}</div>
              </div>
            </div>
            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded" onClick={() => setUser(null)}>
              <LogOut className="w-5 h-5 text-red-400" />
            </button>
          </div>

          <div className="p-4 bg-slate-900 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold">
              <CloudUpload className="w-5 h-5 text-cyan-500" />
              Сохранение в облако (Cloud Sync)
            </div>
            <div className="text-xs text-slate-400">Ваш проект автоматически синхронизируется с облаком Supabase / Firebase</div>
            <button className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-lg text-white hover:from-cyan-600 hover:to-indigo-700">
              <Save className="w-4 h-4" />
              Синхронизировать сейчас
            </button>
          </div>

          <div className="p-4 bg-slate-900 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold">
              <CloudDownload className="w-5 h-5 text-emerald-500" />
              Ваши проекты в облаке
            </div>
            {projects.map(project => (
              <div key={project.id} className="flex justify-between items-center p-2 bg-slate-800 rounded">
                <div>
                  <div className="text-sm font-medium text-white">{project.name}</div>
                  <div className="text-xs text-slate-400">Обновлен: {project.updatedAt}</div>
                </div>
                <button className="p-1 hover:bg-slate-700 rounded text-emerald-400 text-xs flex items-center gap-1">
                  <CloudDownload className="w-4 h-4" />
                  Открыть
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
