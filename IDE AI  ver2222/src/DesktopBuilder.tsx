import { useState, useEffect } from 'react';
import {
  Monitor, Apple, Download, Loader2, CheckCircle,
  AlertCircle, Settings, Package, Shield, HardDrive,
  Cpu, Zap, FileDown, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Platform = 'windows' | 'macos' | 'linux';
type BuildStatus = 'idle' | 'building' | 'success' | 'error';

interface BuildConfig {
  appName: string;
  appVersion: string;
  appIcon: string;
  windowWidth: number;
  windowHeight: number;
  resizable: boolean;
  fullscreen: boolean;
  autoUpdate: boolean;
  singleInstance: boolean;
  framework: 'electron' | 'tauri';
}

interface BuildLog {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

const PLATFORM_INFO = {
  windows: {
    name: 'Windows',
    ext: '.exe',
    icon: Monitor,
    color: 'blue',
    gradient: 'from-blue-600 to-blue-800',
    bgLight: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-500/60',
    textColor: 'text-blue-400',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    description: 'Установщик для Windows 10/11 (x64)',
    fileSize: '~68 MB',
    steps: [
      { msg: '📦 Сборка веб-проекта (npm run build)...', delay: 1200 },
      { msg: '⚡ Инициализация Electron Forge...', delay: 1500 },
      { msg: '🔧 Настройка main.js и preload.js...', delay: 1000 },
      { msg: '📋 Генерация package.json для Electron...', delay: 800 },
      { msg: '🖼️ Конвертация иконки в формат .ico (256x256)...', delay: 1200 },
      { msg: '🏗️ Компиляция нативных модулей (node-gyp)...', delay: 2500 },
      { msg: '📦 Упаковка asar-архива приложения...', delay: 1800 },
      { msg: '🔨 Создание NSIS-установщика (.exe)...', delay: 2000 },
      { msg: '🔑 Подпись кода (Code Signing Certificate)...', delay: 1500 },
      { msg: '✅ Файл MyApp-Setup-1.0.0.exe готов!', delay: 500 }
    ]
  },
  macos: {
    name: 'macOS',
    ext: '.dmg',
    icon: Apple,
    color: 'gray',
    gradient: 'from-gray-600 to-gray-800',
    bgLight: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    hoverBorder: 'hover:border-gray-400/60',
    textColor: 'text-gray-300',
    btnBg: 'bg-gray-600 hover:bg-gray-700',
    description: 'Установщик для macOS 12+ (Apple Silicon & Intel)',
    fileSize: '~72 MB',
    steps: [
      { msg: '📦 Сборка веб-проекта (npm run build)...', delay: 1200 },
      { msg: '⚡ Инициализация Electron Forge для macOS...', delay: 1500 },
      { msg: '🔧 Настройка main.js и entitlements.plist...', delay: 1000 },
      { msg: '🖼️ Конвертация иконки в формат .icns...', delay: 1200 },
      { msg: '🏗️ Компиляция Universal Binary (arm64 + x64)...', delay: 3000 },
      { msg: '📦 Создание .app бандла...', delay: 1800 },
      { msg: '🔨 Генерация DMG-образа с фоном установки...', delay: 2000 },
      { msg: '🔑 Подпись Apple Developer Certificate...', delay: 1500 },
      { msg: '📤 Нотаризация через Apple (notarytool)...', delay: 2500 },
      { msg: '✅ Файл MyApp-1.0.0-universal.dmg готов!', delay: 500 }
    ]
  },
  linux: {
    name: 'Linux',
    ext: '.AppImage',
    icon: Cpu,
    color: 'orange',
    gradient: 'from-orange-600 to-orange-800',
    bgLight: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    hoverBorder: 'hover:border-orange-500/60',
    textColor: 'text-orange-400',
    btnBg: 'bg-orange-600 hover:bg-orange-700',
    description: 'AppImage / DEB / RPM для Linux (x64)',
    fileSize: '~65 MB',
    steps: [
      { msg: '📦 Сборка веб-проекта (npm run build)...', delay: 1200 },
      { msg: '⚡ Инициализация Electron Builder для Linux...', delay: 1500 },
      { msg: '🔧 Настройка main.js и desktop entry...', delay: 1000 },
      { msg: '🖼️ Конвертация иконки в PNG (512x512)...', delay: 800 },
      { msg: '🏗️ Компиляция нативных модулей...', delay: 2000 },
      { msg: '📦 Создание AppImage бандла...', delay: 2000 },
      { msg: '📦 Создание .deb пакета (Debian/Ubuntu)...', delay: 1500 },
      { msg: '📦 Создание .rpm пакета (Fedora/RHEL)...', delay: 1500 },
      { msg: '🔑 Генерация контрольных сумм SHA-256...', delay: 800 },
      { msg: '✅ Файлы MyApp-1.0.0.AppImage, .deb, .rpm готовы!', delay: 500 }
    ]
  }
};

export default function DesktopBuilder() {
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [buildStatus, setBuildStatus] = useState<BuildStatus>('idle');
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<BuildConfig>({
    appName: 'My App',
    appVersion: '1.0.0',
    appIcon: '🚀',
    windowWidth: 1280,
    windowHeight: 720,
    resizable: true,
    fullscreen: false,
    autoUpdate: true,
    singleInstance: true,
    framework: 'electron'
  });

  const [selectedFormats, setSelectedFormats] = useState({
    windows: { exe: true, msi: false, portable: false },
    macos: { dmg: true, pkg: false, zip: false },
    linux: { appimage: true, deb: true, rpm: false, snap: false }
  });

  useEffect(() => {
    if (buildStatus === 'building' && activePlatform) {
      const steps = PLATFORM_INFO[activePlatform].steps;
      let currentStep = 0;
      let totalDelay = 0;
      const totalDuration = steps.reduce((sum, s) => sum + s.delay, 0);

      const runStep = () => {
        if (currentStep < steps.length) {
          const step = steps[currentStep];
          const isLast = currentStep === steps.length - 1;

          setLogs(prev => [...prev, {
            message: step.msg,
            type: isLast ? 'success' : 'info',
            timestamp: new Date()
          }]);

          totalDelay += step.delay;
          setProgress(Math.round((totalDelay / totalDuration) * 100));

          currentStep++;
          setTimeout(runStep, step.delay);
        } else {
          setBuildStatus('success');
          setProgress(100);
        }
      };

      runStep();
    }
  }, [buildStatus, activePlatform]);

  const startBuild = (platform: Platform) => {
    setActivePlatform(platform);
    setBuildStatus('building');
    setLogs([]);
    setProgress(0);
  };

  const resetBuild = () => {
    setBuildStatus('idle');
    setActivePlatform(null);
    setLogs([]);
    setProgress(0);
  };

  const handleDownload = () => {
    if (!activePlatform) return;
    const info = PLATFORM_INFO[activePlatform];
    
    // Create a dummy file for download simulation
    const content = `
=== ${config.appName} ===
Платформа: ${info.name}
Версия: ${config.appVersion}
Формат: ${info.ext}
Фреймворк: ${config.framework === 'electron' ? 'Electron' : 'Tauri'}
Размер окна: ${config.windowWidth}x${config.windowHeight}
Дата сборки: ${new Date().toLocaleString('ru-RU')}

Это демо-файл. В реальном сценарии здесь был бы
скомпилированный бинарный файл вашего приложения.

Для реальной сборки используйте:
1. npm install electron electron-builder --save-dev
2. npx electron-builder --${activePlatform === 'windows' ? 'win' : activePlatform === 'macos' ? 'mac' : 'linux'}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.appName.replace(/\s+/g, '-')}-${config.appVersion}${info.ext === '.AppImage' ? '.AppImage' : info.ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-gray-900 text-white overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <Monitor className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Десктопная сборка</h1>
              <p className="text-gray-400 text-sm">
                Соберите EXE, DMG или AppImage в один клик
              </p>
            </div>
          </div>

          {/* Framework Toggle */}
          <div className="flex items-center gap-4 mt-4 p-3 bg-gray-800 rounded-xl border border-gray-700">
            <span className="text-sm text-gray-400">Фреймворк:</span>
            <button
              onClick={() => setConfig(c => ({ ...c, framework: 'electron' }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                config.framework === 'electron'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              Electron
            </button>
            <button
              onClick={() => setConfig(c => ({ ...c, framework: 'tauri' }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                config.framework === 'tauri'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              Tauri
            </button>
            <span className="text-xs text-gray-500 ml-2">
              {config.framework === 'electron'
                ? 'Совместимость 99% • Chromium • Node.js'
                : 'Малый размер • Rust • WebView системы'}
            </span>
          </div>
        </header>

        {/* Config Panel */}
        <motion.div className="mb-6">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-3"
          >
            <Settings className="w-4 h-4" />
            Настройки приложения
            {showConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showConfig && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* App Name */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Название приложения</label>
                      <input
                        type="text"
                        value={config.appName}
                        onChange={e => setConfig(c => ({ ...c, appName: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Version */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Версия</label>
                      <input
                        type="text"
                        value={config.appVersion}
                        onChange={e => setConfig(c => ({ ...c, appVersion: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Icon */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Иконка (эмодзи)</label>
                      <input
                        type="text"
                        value={config.appIcon}
                        onChange={e => setConfig(c => ({ ...c, appIcon: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Window Width */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Ширина окна (px)</label>
                      <input
                        type="number"
                        value={config.windowWidth}
                        onChange={e => setConfig(c => ({ ...c, windowWidth: parseInt(e.target.value) || 800 }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Window Height */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Высота окна (px)</label>
                      <input
                        type="number"
                        value={config.windowHeight}
                        onChange={e => setConfig(c => ({ ...c, windowHeight: parseInt(e.target.value) || 600 }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-2">
                      <label className="block text-xs text-gray-400 mb-1.5">Параметры</label>
                      {[
                        { key: 'resizable' as const, label: 'Изменяемый размер' },
                        { key: 'fullscreen' as const, label: 'Полный экран' },
                        { key: 'autoUpdate' as const, label: 'Авто-обновление' },
                        { key: 'singleInstance' as const, label: 'Один экземпляр' }
                      ].map(item => (
                        <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config[item.key]}
                            onChange={e => setConfig(c => ({ ...c, [item.key]: e.target.checked }))}
                            className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-300">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Output Formats */}
                  <div className="mt-5 pt-4 border-t border-gray-700">
                    <h4 className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Форматы сборки</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-blue-400 mb-2">🪟 Windows</p>
                        {Object.entries(selectedFormats.windows).map(([key, val]) => (
                          <label key={key} className="flex items-center gap-2 mb-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={val}
                              onChange={() => setSelectedFormats(f => ({
                                ...f,
                                windows: { ...f.windows, [key]: !f.windows[key as keyof typeof f.windows] }
                              }))}
                              className="w-3.5 h-3.5 rounded bg-gray-700 border-gray-600 text-blue-600"
                            />
                            <span className="text-xs text-gray-300 uppercase">.{key}</span>
                          </label>
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300 mb-2">🍎 macOS</p>
                        {Object.entries(selectedFormats.macos).map(([key, val]) => (
                          <label key={key} className="flex items-center gap-2 mb-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={val}
                              onChange={() => setSelectedFormats(f => ({
                                ...f,
                                macos: { ...f.macos, [key]: !f.macos[key as keyof typeof f.macos] }
                              }))}
                              className="w-3.5 h-3.5 rounded bg-gray-700 border-gray-600 text-blue-600"
                            />
                            <span className="text-xs text-gray-300 uppercase">.{key}</span>
                          </label>
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-orange-400 mb-2">🐧 Linux</p>
                        {Object.entries(selectedFormats.linux).map(([key, val]) => (
                          <label key={key} className="flex items-center gap-2 mb-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={val}
                              onChange={() => setSelectedFormats(f => ({
                                ...f,
                                linux: { ...f.linux, [key]: !f.linux[key as keyof typeof f.linux] }
                              }))}
                              className="w-3.5 h-3.5 rounded bg-gray-700 border-gray-600 text-blue-600"
                            />
                            <span className="text-xs text-gray-300 uppercase">.{key}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {(Object.entries(PLATFORM_INFO) as [Platform, typeof PLATFORM_INFO.windows][]).map(([key, info]) => {
            const Icon = info.icon;
            const isActive = activePlatform === key;
            const isBuilding = buildStatus === 'building' && isActive;
            const isSuccess = buildStatus === 'success' && isActive;

            return (
              <motion.div
                key={key}
                whileHover={{ scale: buildStatus === 'idle' ? 1.02 : 1 }}
                className={`bg-gray-800 rounded-xl border transition-all overflow-hidden ${
                  isActive ? info.border + ' shadow-lg' : 'border-gray-700 ' + info.hoverBorder
                }`}
              >
                {/* Card Header with Gradient */}
                <div className={`bg-gradient-to-r ${info.gradient} p-4`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{info.name}</h3>
                      <span className="text-xs text-white/70">{info.ext}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-2">{info.description}</p>

                  <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      {info.fileSize}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {config.framework === 'electron' ? 'Electron' : 'Tauri'}
                    </span>
                  </div>

                  {/* App Preview Mini */}
                  <div className="mb-4 bg-gray-900 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                      <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      </div>
                      <span className="text-[10px] text-gray-500 ml-1">{config.appName} — {config.appVersion}</span>
                    </div>
                    <div className="h-12 flex items-center justify-center text-2xl">
                      {config.appIcon}
                    </div>
                  </div>

                  {/* Build Button */}
                  <button
                    onClick={() => startBuild(key)}
                    disabled={buildStatus !== 'idle'}
                    className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all text-sm ${
                      buildStatus !== 'idle'
                        ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                        : info.btnBg + ' text-white shadow-lg'
                    }`}
                  >
                    {isBuilding ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Сборка...
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Готово!
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Создать {info.ext.toUpperCase().replace('.', '')}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Build Terminal */}
        <AnimatePresence>
          {logs.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8"
            >
              <div className="bg-black rounded-xl border border-gray-800 overflow-hidden">
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {activePlatform && `${config.framework} build --platform ${activePlatform}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {buildStatus === 'building' && (
                      <span className="text-xs text-yellow-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {progress}%
                      </span>
                    )}
                    {buildStatus === 'success' && (
                      <button
                        onClick={resetBuild}
                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Сбросить
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-gray-800">
                  <motion.div
                    className={`h-full ${
                      buildStatus === 'success'
                        ? 'bg-green-500'
                        : buildStatus === 'error'
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Terminal Body */}
                <div className="p-4 max-h-72 overflow-y-auto font-mono text-sm space-y-1.5">
                  {logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start gap-2 ${
                        log.type === 'success' ? 'text-green-400' :
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'warning' ? 'text-yellow-400' :
                        'text-gray-300'
                      }`}
                    >
                      <span className="text-gray-600 select-none">$</span>
                      <span>{log.message}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Download Section */}
                <AnimatePresence>
                  {buildStatus === 'success' && activePlatform && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-gray-800"
                    >
                      <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                              <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-green-400 text-sm">Сборка завершена успешно!</h4>
                              <p className="text-xs text-gray-400">
                                {config.appName}-{config.appVersion}{PLATFORM_INFO[activePlatform].ext}
                                <span className="ml-2 text-gray-500">
                                  ({PLATFORM_INFO[activePlatform].fileSize})
                                </span>
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-green-600/30 hover:shadow-green-600/50"
                          >
                            <FileDown className="w-5 h-5" />
                            Скачать {PLATFORM_INFO[activePlatform].ext.toUpperCase().replace('.', '')}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* How It Works */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Как это работает?
            </h3>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Сборка веба', desc: 'Vite компилирует ваш React + Tailwind код в оптимизированные файлы' },
                { step: '2', title: 'Обёртка в нативный контейнер', desc: `${config.framework === 'electron' ? 'Electron' : 'Tauri'} создает нативное окно с вашим приложением` },
                { step: '3', title: 'Компиляция', desc: 'Генерация установщика для выбранной ОС' },
                { step: '4', title: 'Подпись и упаковка', desc: 'Подписание сертификатом и финальная упаковка' }
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              Electron vs Tauri
            </h3>
            <div className="overflow-hidden rounded-lg border border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="py-2 px-3 text-left text-gray-400">Параметр</th>
                    <th className="py-2 px-3 text-center text-blue-400">Electron</th>
                    <th className="py-2 px-3 text-center text-orange-400">Tauri</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {[
                    ['Размер EXE', '~70 MB', '~3 MB'],
                    ['Движок', 'Chromium', 'WebView ОС'],
                    ['Бэкенд', 'Node.js', 'Rust'],
                    ['RAM', '~150 MB', '~30 MB'],
                    ['Совместимость', '⭐⭐⭐⭐⭐', '⭐⭐⭐⭐'],
                    ['Безопасность', '⭐⭐⭐', '⭐⭐⭐⭐⭐'],
                    ['Автообновление', '✅', '✅'],
                    ['Tray / Меню', '✅', '✅']
                  ].map(([param, electron, tauri], i) => (
                    <tr key={i} className="hover:bg-gray-700/50">
                      <td className="py-1.5 px-3 text-gray-300">{param}</td>
                      <td className="py-1.5 px-3 text-center text-gray-400">{electron}</td>
                      <td className="py-1.5 px-3 text-center text-gray-400">{tauri}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Generated Config Preview */}
        <div className="mt-5 bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <FileDown className="w-5 h-5 text-purple-400" />
            Сгенерированная конфигурация
          </h3>
          <pre className="bg-black rounded-lg p-4 text-xs text-green-400 overflow-x-auto font-mono">
{config.framework === 'electron' ? `// electron-builder.config.js
module.exports = {
  appId: "com.${config.appName.toLowerCase().replace(/\\s+/g, '')}.app",
  productName: "${config.appName}",
  directories: { output: "release" },
  files: ["dist/**/*", "electron/**/*"],
  win: {
    target: [${selectedFormats.windows.exe ? '"nsis"' : ''}${selectedFormats.windows.msi ? ', "msi"' : ''}${selectedFormats.windows.portable ? ', "portable"' : ''}],
    icon: "build/icon.ico"
  },
  mac: {
    target: [${selectedFormats.macos.dmg ? '"dmg"' : ''}${selectedFormats.macos.pkg ? ', "pkg"' : ''}${selectedFormats.macos.zip ? ', "zip"' : ''}],
    icon: "build/icon.icns",
    category: "public.app-category.utilities"
  },
  linux: {
    target: [${selectedFormats.linux.appimage ? '"AppImage"' : ''}${selectedFormats.linux.deb ? ', "deb"' : ''}${selectedFormats.linux.rpm ? ', "rpm"' : ''}${selectedFormats.linux.snap ? ', "snap"' : ''}],
    icon: "build/icon.png"
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  }
};` : `// tauri.conf.json
{
  "build": { "distDir": "../dist" },
  "package": {
    "productName": "${config.appName}",
    "version": "${config.appVersion}"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "targets": "all",
      "icon": ["icons/icon.ico", "icons/icon.icns", "icons/icon.png"]
    },
    "windows": [{
      "title": "${config.appName}",
      "width": ${config.windowWidth},
      "height": ${config.windowHeight},
      "resizable": ${config.resizable},
      "fullscreen": ${config.fullscreen}
    }],
    "security": {
      "csp": null
    }
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
