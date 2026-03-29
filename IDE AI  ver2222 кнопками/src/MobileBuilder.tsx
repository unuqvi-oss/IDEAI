import { useState } from 'react';
import { Smartphone, Apple, CheckCircle, Loader2, Download, AlertCircle } from 'lucide-react';

export default function MobileBuilder() {
  const [buildType, setBuildType] = useState<'apk' | 'ipa' | null>(null);

  const [logs, setLogs] = useState<string[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildSuccess, setBuildSuccess] = useState(false);

  const startBuild = (type: 'apk' | 'ipa') => {
    setBuildType(type);
    setIsBuilding(true);
    setBuildSuccess(false);
    setLogs([]);

    const steps = [
      { msg: '📦 Упаковка веб-файлов проекта (Vite build)...', delay: 1500 },
      { msg: '🚚 Инициализация Capacitor Native Bridge...', delay: 2000 },
      { msg: type === 'apk' ? '🤖 Компиляция Java/Kotlin (Gradle)...' : '🍏 Компиляция Objective-C/Swift (Xcode)...', delay: 3000 },
      { msg: '🔑 Подпись приложения сертификатом безопасности...', delay: 2000 },
      { msg: '✅ Сборка завершена успешно!', delay: 1000 }
    ];

    let currentStep = 0;
    
    const runStep = () => {
      if (currentStep < steps.length) {
        setLogs(prev => [...prev, steps[currentStep].msg]);
        
        setTimeout(() => {
          currentStep++;
          runStep();
        }, steps[currentStep].delay);
      } else {
        setIsBuilding(false);
        setBuildSuccess(true);
      }
    };

    runStep();
  };

  return (
    <div className="p-6 bg-gray-900 text-white h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-blue-500" />
            Облачный Конструктор Нативных Приложений
          </h1>
          <p className="text-gray-400">Соберите APK для Android или IPA для iOS в один клик без терминала и сложных настроек окружения.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* APK Card */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-green-500/50 transition-all shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg text-green-500">
                <Smartphone className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Собрать APK (Android)</h3>
                <p className="text-xs text-gray-400">Для телефонов Samsung, Xiaomi и др.</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6 h-12">Скомпилирует ваш веб-сайт в стандартный установочный файл Android.</p>
            <button
              onClick={() => startBuild('apk')}
              disabled={isBuilding}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all ${isBuilding ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              {isBuilding && buildType === 'apk' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Собираем APK...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Создать APK
                </>
              )}
            </button>
          </div>

          {/* IPA Card */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500">
                <Apple className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Собрать IPA (iOS)</h3>
                <p className="text-xs text-gray-400">Для iPhone и iPad</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6 h-12">Создает файл для публикации в Apple App Store или локальной установки.</p>
            <button
              onClick={() => startBuild('ipa')}
              disabled={isBuilding}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all ${isBuilding ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {isBuilding && buildType === 'ipa' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Собираем IPA...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Создать IPA
                </>
              )}
            </button>
          </div>
        </div>

        {/* Build Terminal Simulator */}
        {(isBuilding || logs.length > 0) && (
          <div className="bg-black/80 p-6 rounded-xl border border-gray-800 font-mono text-sm h-72 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
                <span className="text-gray-400">Статус Cloud Build:</span>
                <span className={`flex items-center gap-1 ${buildSuccess ? 'text-green-500' : 'text-yellow-500'}`}>
                  {buildSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> Готово
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> В процессе...
                    </>
                  )}
                </span>
              </div>
              {logs.map((log, i) => (
                <div key={i} className="flex items-center gap-2 text-green-400">
                  <span className="text-gray-500">$</span> {log}
                </div>
              ))}
            </div>

            {buildSuccess && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-green-400">Файл готов к скачиванию!</h4>
                  <p className="text-xs text-gray-400">Нажмите кнопку справа, чтобы загрузить {buildType?.toUpperCase()}.</p>
                </div>
                <button
                  onClick={() => alert(`Скачивание файла ${buildType?.toUpperCase()} началось!`)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 font-bold"
                >
                  <Download className="w-4 h-4" />
                  Скачать
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Как это работает?
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Веб-приложение (HTML/JS/CSS), созданное в этом конструкторе, автоматически упаковывается с использованием фреймворка <strong>Capacitor (Ionic)</strong>. Облачный сервис компилирует нативный WebView-контейнер, добавляет иконки, настраивает сплеш-скрины и отдает вам готовый бинарный файл для телефона.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="font-bold mb-2">1. Сборка Веба</div>
              Создает оптимизированные файлы сайта.
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="font-bold mb-2">2. Синхронизация</div>
              Копирует сайт в нативный проект Android/iOS.
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="font-bold mb-2">3. Компиляция</div>
              Компилирует в бинарный файл (APK/IPA).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
