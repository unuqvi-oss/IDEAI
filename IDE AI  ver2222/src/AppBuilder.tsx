import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, Brain, Eye, Database, 
  ChevronRight, ChevronDown, Code, 
  Folder, FileCode, PlayCircle, Share2,
  MessageSquare, Sparkles, Layout, Globe,
  FolderOpen, Download,
  ArrowRight, Loader2, CheckCircle, AlertCircle, Smartphone, Monitor, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import MobileBuilder from './MobileBuilder';
import DesktopBuilder from './DesktopBuilder';
import { ThemeSettings } from './components/ThemeSettings';
import { UserAuth } from './components/UserAuth';
import { DropZone } from './components/DropZone';
import { exportProjectToZip } from './utils/zipExport';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
  language?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'code' | 'suggestion' | 'error' | 'success';
}

interface ProjectState {
  name: string;
  files: FileNode[];
  activeFile: string | null;
  isRunning: boolean;
  buildStatus: 'idle' | 'building' | 'success' | 'error';
  buildOutput: string[];
}

const DEFAULT_FILES: FileNode[] = [
  {
    id: 'root',
    name: 'my-app',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: 'src',
        name: 'src',
        type: 'folder',
        isOpen: true,
        children: [
          {
            id: 'app-tsx',
            name: 'App.tsx',
            type: 'file',
            language: 'typescript',
            content: `function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🚀 AI App Builder
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Добро пожаловать в конструктор приложений! Редактируйте код и смотрите результат в реальном времени.
        </p>
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl font-bold text-blue-600 mb-4">
            {count}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setCount(c => c + 1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
            >
              + Увеличить
            </button>
            <button
              onClick={() => setCount(c => c - 1)}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-semibold"
            >
              - Уменьшить
            </button>
            <button
              onClick={() => setCount(0)}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
            >
              Сбросить
            </button>
          </div>
        </div>
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            <strong>Совет:</strong> Измените этот код в редакторе слева и нажмите "Запустить", чтобы увидеть изменения.
          </p>
        </div>
      </div>
    </div>
  );
}`
          },
          {
            id: 'main-tsx',
            name: 'main.tsx',
            type: 'file',
            language: 'typescript',
            content: `// Main entry point for the app
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}`
          },
          {
            id: 'index-css',
            name: 'index.css',
            type: 'file',
            language: 'css',
            content: `@tailwind base;
@tailwind components;
@tailwind utilities;`
          }
        ]
      },
      {
        id: 'public',
        name: 'public',
        type: 'folder',
        isOpen: false,
        children: [
          {
            id: 'index-html',
            name: 'index.html',
            type: 'file',
            language: 'html',
            content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI App Builder</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
          }
        ]
      },
      {
        id: 'package-json',
        name: 'package.json',
        type: 'file',
        language: 'json',
        content: `{
  "name": "my-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}`
      },
      {
        id: 'capacitor-guide-md',
        name: 'CAPACITOR.md',
        type: 'file',
        language: 'markdown',
        content: `# Развертывание на iOS и Android

Этот веб-проект можно упаковать в нативное мобильное приложение с помощью **Capacitor.js** от Ionic.

## Шаг 1: Сборка веб-проекта
\`\`\`bash
npm run build
\`\`\`

## Шаг 2: Инициализация Capacitor
\`\`\`bash
npm install @capacitor/core @capacitor/cli
npx cap init
\`\`\`

## Шаг 3: Добавление мобильных платформ

### 📱 Android
\`\`\`bash
npm install @capacitor/android
npx cap add android
npx cap sync android
npx cap open android
\`\`\`

### 🍏 iOS (iPhone)
\`\`\`bash
npm install @capacitor/ios
npx cap add ios
npx cap sync ios
npx cap open ios
\`\`\`

## Шаг 4: Сборка приложения
Проект откроется в **Android Studio** (для Android) или **Xcode** (для iOS), откуда вы сможете запустить его на эмуляторе или реальном устройстве.
`
      }
    ]
  }
];

const AI_SUGGESTIONS = [
  'Создай карточку товара с изображением и ценой',
  'Добавь форму регистрации с валидацией',
  'Сделай тёмную тему для приложения',
  'Создай навигационное меню с анимацией',
  'Добавь модальное окно с подтверждением',
  'Создай список задач (todo list)',
  'Добавь слайдер изображений',
  'Создай таблицу с данными и сортировкой'
];

const FILE_ICONS: Record<string, any> = {
  'App.tsx': Code,
  'main.tsx': Code,
  'index.html': Layout,
  'package.json': Database,
  'src': Folder,
  'public': Folder,
  '.tsx': Code,
  '.ts': Code,
  '.js': Code,
  '.jsx': Code,
  '.css': Layout,
  '.json': Database,
  '.md': FileCode
};

type ThemeName = 'midnight' | 'ocean' | 'violet' | 'forest';

const THEME_PRESETS: Record<ThemeName, {
  label: string;
  shell: string;
  header: string;
  panel: string;
  footer: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  border: string;
}> = {
  midnight: {
    label: 'Midnight',
    shell: 'bg-slate-950',
    header: 'bg-slate-900',
    panel: 'bg-slate-900',
    footer: 'bg-slate-900',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    accentSoft: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    border: 'border-slate-800'
  },
  ocean: {
    label: 'Ocean',
    shell: 'bg-slate-950',
    header: 'bg-slate-900',
    panel: 'bg-slate-900',
    footer: 'bg-slate-900',
    accent: 'bg-cyan-600',
    accentHover: 'hover:bg-cyan-700',
    accentSoft: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    border: 'border-slate-800'
  },
  violet: {
    label: 'Violet',
    shell: 'bg-zinc-950',
    header: 'bg-zinc-900',
    panel: 'bg-zinc-900',
    footer: 'bg-zinc-900',
    accent: 'bg-violet-600',
    accentHover: 'hover:bg-violet-700',
    accentSoft: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
    border: 'border-zinc-800'
  },
  forest: {
    label: 'Forest',
    shell: 'bg-emerald-950',
    header: 'bg-emerald-900',
    panel: 'bg-emerald-900',
    footer: 'bg-emerald-900',
    accent: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    accentSoft: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    border: 'border-emerald-900'
  }
};

type ServiceName = 'github' | 'supabase' | 'firebase' | 'cloudinary';

interface ServiceConfig {
  enabled: boolean;
  endpoint: string;
  token: string;
}

const SERVICE_DEFAULTS: Record<ServiceName, ServiceConfig> = {
  github: {
    enabled: false,
    endpoint: 'https://api.github.com',
    token: ''
  },
  supabase: {
    enabled: false,
    endpoint: 'https://your-project.supabase.co',
    token: ''
  },
  firebase: {
    enabled: false,
    endpoint: 'https://firebase.googleapis.com',
    token: ''
  },
  cloudinary: {
    enabled: false,
    endpoint: 'https://api.cloudinary.com/v1_1/demo',
    token: ''
  }
};

export default function AppBuilder() {
  const savedTheme = typeof window !== 'undefined' ? (window.localStorage.getItem('ai-builder-theme') as ThemeName | null) : null;
  const savedServices = typeof window !== 'undefined' ? window.localStorage.getItem('ai-builder-services') : null;

  const [project, setProject] = useState<ProjectState>({
    name: 'my-app',
    files: JSON.parse(JSON.stringify(DEFAULT_FILES)),
    activeFile: 'app-tsx',
    isRunning: false,
    buildStatus: 'idle',
    buildOutput: []
  });

  const [themeName, setThemeName] = useState<ThemeName>(savedTheme && THEME_PRESETS[savedTheme] ? savedTheme : 'midnight');
  const [services, setServices] = useState<Record<ServiceName, ServiceConfig>>(() => {
    try {
      return savedServices ? { ...SERVICE_DEFAULTS, ...JSON.parse(savedServices) } : SERVICE_DEFAULTS;
    } catch {
      return SERVICE_DEFAULTS;
    }
  });
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Привет! Я ваш ИИ-помощник. Я могу помочь вам создать любое веб-приложение. Просто опишите, что вы хотите создать, и я напишу код за вас!',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'mobile' | 'desktop' | 'settings'>('code');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'ios' | 'android'>('desktop');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = THEME_PRESETS[themeName];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    document.documentElement.dataset.theme = themeName;
    window.localStorage.setItem('ai-builder-theme', themeName);
  }, [themeName]);

  useEffect(() => {
    window.localStorage.setItem('ai-builder-services', JSON.stringify(services));
  }, [services]);

  const updateServiceConfig = (service: ServiceName, patch: Partial<ServiceConfig>) => {
    setServices(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        ...patch
      }
    }));
  };

  const toggleService = (service: ServiceName) => {
    setServices(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        enabled: !prev[service].enabled
      }
    }));
  };

  const serviceCards: Array<{ key: ServiceName; title: string; description: string; color: string }> = [
    { key: 'github', title: 'GitHub', description: 'Синхронизация проектов и сборка через Actions', color: 'blue' },
    { key: 'supabase', title: 'Supabase', description: 'База данных, auth и storage', color: 'emerald' },
    { key: 'firebase', title: 'Firebase', description: 'Auth, Firestore и hosting', color: 'orange' },
    { key: 'cloudinary', title: 'Cloudinary', description: 'Изображения, ассеты и CDN', color: 'violet' }
  ];

  const themeEntries = Object.entries(THEME_PRESETS) as Array<[ThemeName, (typeof THEME_PRESETS)[ThemeName]]>;

  const findFileById = (files: FileNode[], id: string): FileNode | null => {
    for (const file of files) {
      if (file.id === id) return file;
      if (file.children) {
        const found = findFileById(file.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateFileContent = (files: FileNode[], id: string, content: string): FileNode[] => {
    return files.map(file => {
      if (file.id === id) {
        return { ...file, content };
      }
      if (file.children) {
        return { ...file, children: updateFileContent(file.children, id, content) };
      }
      return file;
    });
  };

  const toggleFolder = (files: FileNode[], id: string): FileNode[] => {
    return files.map(file => {
      if (file.id === id && file.type === 'folder') {
        return { ...file, isOpen: !file.isOpen };
      }
      if (file.children) {
        return { ...file, children: toggleFolder(file.children, id) };
      }
      return file;
    });
  };

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'folder') {
      setProject(prev => ({
        ...prev,
        files: toggleFolder(prev.files, file.id)
      }));
    } else {
      setProject(prev => ({
        ...prev,
        activeFile: file.id
      }));
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (project.activeFile && value !== undefined) {
      setProject(prev => ({
        ...prev,
        files: updateFileContent(prev.files, prev.activeFile!, value)
      }));
    }
  };

  const activeFile = useMemo(() => {
    return project.activeFile ? findFileById(project.files, project.activeFile) : null;
  }, [project.files, project.activeFile]);

  const generateResponse = async (userMessage: string): Promise<string> => {
     const lowerMessage = userMessage.toLowerCase();
     
     // Simulated AI responses based on common requests
     if (lowerMessage.includes('карточк') || lowerMessage.includes('товар')) {
       return `Отличная идея! Вот код для карточки товара:

\`\`\`tsx
function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm">
        <img 
          src="https://picsum.photos/400/300" 
          alt="Товар"
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Крутой продукт
          </h3>
          <p className="text-gray-600 mb-4">
            Описание вашего замечательного товара с ключевыми особенностями.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">
              999 ₽
            </span>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              Купить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
\`\`\`

Нажмите "Запустить", чтобы увидеть результат!`;
     }
    
     if (lowerMessage.includes('форм') || lowerMessage.includes('регистрац')) {
       return `Конечно! Вот форма регистрации с валидацией:

\`\`\`tsx
import { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.email.includes('@')) {
      newErrors.email = 'Некорректный email';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      alert('Форма отправлена! ' + JSON.stringify(formData));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Регистрация
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Имя"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          <button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors font-semibold"
          >
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  );
}
\`\`\`

Нажмите "Запустить" чтобы увидеть форму в действии!`;
     }

    if (lowerMessage.includes('тёмн') || lowerMessage.includes('тёмная тем') || lowerMessage.includes('dark')) {
      return `Отлично! Вот как добавить тёмную тему:

\`\`\`tsx
import { useState } from 'react';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
        >
          {isDark ? '☀️ Светлая' : '🌙 Тёмная'}
        </button>
        
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Привет!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Переключайте тему и смотрите магию!
          </p>
        </div>
      </div>
    </div>
  );
}
\`\`\`

Не забудьте добавить \`darkMode: 'class'\` в конфигурацию Tailwind!`;
    }

    if (lowerMessage.includes('навиг') || lowerMessage.includes('меню')) {
      return `Создам красивое навигационное меню с анимацией:

\`\`\`tsx
import { useState } from 'react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="text-xl font-bold text-blue-600">Logo</div>
          
          <div className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-blue-600 transition">Главная</a>
            <a href="#" className="hover:text-blue-600 transition">О нас</a>
            <a href="#" className="hover:text-blue-600 transition">Услуги</a>
            <a href="#" className="hover:text-blue-600 transition">Контакты</a>
          </div>
          
          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            ☰
          </button>
        </div>
        
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            <a href="#" className="block hover:text-blue-600">Главная</a>
            <a href="#" className="block hover:text-blue-600">О нас</a>
            <a href="#" className="block hover:text-blue-600">Услуги</a>
            <a href="#" className="block hover:text-blue-600">Контакты</a>
          </div>
        )}
      </div>
    </nav>
  );
}
\`\`\`

Хотите добавить анимацию или другие функции?`;
    }

    // Default response
    return `Я понял вашу задачу! Вот что я могу сделать:

1. Создать компоненты React с использованием Tailwind CSS
2. Добавить интерактивность с помощью useState и useEffect
3. Создать формы с валидацией
4. Добавить анимации и переходы
5. Создать адаптивный дизайн

Опишите подробнее, что именно вы хотите создать, и я напишу соответствующий код!

Попробуйте сказать:
- "Создай карточку товара"
- "Добавь форму регистрации"
- "Сделай тёмную тему"
- "Создай навигационное меню"`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Show typing indicator
    const typingId = 'typing-' + Date.now();
    setMessages(prev => [...prev, {
      id: typingId,
      role: 'assistant',
      content: 'Пишет...',
      timestamp: new Date(),
      type: 'text'
    }]);

    // Simulate AI response delay
    setTimeout(async () => {
      const response = await generateResponse(inputMessage);
      
      setMessages(prev => prev.filter(m => m.id !== typingId).concat({
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        type: 'code'
      }));
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleRun = () => {
    setProject(prev => ({ ...prev, isRunning: true, buildStatus: 'building', buildOutput: ['Сборка проекта...', 'Компиляция TypeScript...', 'Оптимизация ресурсов...'] }));
    
    setTimeout(() => {
      setProject(prev => ({ 
        ...prev, 
        isRunning: true, 
        buildStatus: 'success',
        buildOutput: [...prev.buildOutput, '✓ Сборка завершена успешно!', '✓ Проект готов к запуску']
      }));
    }, 2000);
  };

  const handleStop = () => {
    setProject(prev => ({ ...prev, isRunning: false, buildStatus: 'idle', buildOutput: [] }));
  };

  const renderFileTree = (files: FileNode[], level: number = 0) => {
    return files.map(file => {
      const Icon = FILE_ICONS[file.name] || FILE_ICONS['.' + file.name.split('.').pop()] || (file.type === 'folder' ? Folder : FileCode);
      
      return (
        <div key={file.id}>
          <motion.div
            className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${project.activeFile === file.id ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
            onClick={() => handleFileClick(file)}
            whileHover={{ x: 4 }}
          >
            <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
            {file.type === 'folder' && (
              file.isOpen ? <ChevronDown className="w-3 h-3 ml-auto" /> : <ChevronRight className="w-3 h-3 ml-auto" />
            )}
          </motion.div>
          {file.type === 'folder' && file.isOpen && file.children && (
            renderFileTree(file.children, level + 1)
          )}
        </div>
      );
    });
  };

  return (
    <DropZone onFilesDropped={(files) => {
      setProject(prev => {
        const updatedFiles = [...prev.files];
        const rootFolder = updatedFiles[0];
        if (rootFolder && rootFolder.children) {
          const children = rootFolder.children;
          files.forEach(file => {
            children.push({
              id: Date.now().toString() + '-' + file.name,
              name: file.name,
              type: 'file',
              content: `// Файл импортирован перетаскиванием: ${file.name}\n// Размер: ${file.size} байт`,
              language: file.name.endsWith('.ts') || file.name.endsWith('.tsx') ? 'typescript' : file.name.endsWith('.json') ? 'json' : 'javascript'
            });
          });
        }
        return { ...prev, files: updatedFiles };
      });
    }}>
      <div className={`h-screen ${theme.shell} flex flex-col overflow-hidden`}>
        {/* Header */}
        <header className={`${theme.header} border-b ${theme.border} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">AI App Builder</h1>
          </div>
          
          <div className="flex items-center gap-2 ml-8">
            <button
              onClick={handleRun}
              disabled={project.isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {project.isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{project.isRunning ? 'Запущено' : 'Запустить'}</span>
            </button>
            
            {project.isRunning && (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Pause className="w-4 h-4" />
                <span>Остановить</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          >
            <FolderOpen className="w-5 h-5" />
          </button>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => setPreviewOpen(!previewOpen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          >
            <Globe className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'settings' ? theme.accent + ' text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Настройки
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            <Share2 className="w-4 h-4" />
            <span>Поделиться</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Explorer */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={`${theme.panel} border-r ${theme.border} overflow-hidden`}
            >
              <div className="p-4">
                <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4">Файлы</h2>
                <div className="space-y-1">{renderFileTree(project.files)}</div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Editor/Preview Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className={`${theme.panel} border-b ${theme.border} px-4 py-2 flex items-center gap-2`}>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'code' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Code className="w-4 h-4" />
              <span>Код</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Eye className="w-4 h-4" />
              <span>Предпросмотр</span>
            </button>
            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Smartphone className="w-4 h-4" />
              <span>📱 Мобильная</span>
            </button>
            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'desktop' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Monitor className="w-4 h-4" />
              <span>🖥️ Десктоп</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'settings' ? theme.accent + ' text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Settings className="w-4 h-4" />
              <span>Настройки</span>
            </button>
            
            {project.buildStatus === 'success' && (
              <div className="ml-auto flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Сборка успешна</span>
              </div>
            )}
            {project.buildStatus === 'error' && (
              <div className="ml-auto flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Ошибка сборки</span>
              </div>
            )}
          </div>

          {/* Editor or Preview */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'code' ? (
              <div className="h-full">
                {activeFile ? (
                  <Editor
                    height="100%"
                    language={activeFile.language || 'typescript'}
                    value={activeFile.content || ''}
                    onChange={handleCodeChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      automaticLayout: true,
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Выберите файл для редактирования
                  </div>
                )}
              </div>
            ) : activeTab === 'preview' ? (
                   <div className="h-full bg-white flex flex-col">
                 <div className="bg-gray-100 p-2 border-b flex justify-center gap-4">
                   <button onClick={() => setViewportMode('desktop')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewportMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}>🖥️ Десктоп</button>
                   <button onClick={() => setViewportMode('ios')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewportMode === 'ios' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}>📱 iPhone (iOS)</button>
                   <button onClick={() => setViewportMode('android')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewportMode === 'android' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}>🤖 Android</button>
                 </div>
                 {project.isRunning ? (
                   <div className="flex-1 flex justify-center items-center bg-gray-200 overflow-auto p-4">
                     <div className={`transition-all duration-300 ${viewportMode === 'ios' ? 'w-[375px] h-[667px] border-[12px] border-gray-900 rounded-[40px] shadow-2xl overflow-hidden bg-white relative' : viewportMode === 'android' ? 'w-[360px] h-[740px] border-[8px] border-gray-800 rounded-[24px] shadow-2xl overflow-hidden bg-white relative' : 'w-full h-full bg-white'}`}>
                    <iframe
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                            <script src="https://cdn.tailwindcss.com"></script>
                            <style>
                              body { margin: 0; padding: 0; }
                            </style>
                          </head>
                          <body>
                            <div id="root"></div>
                            <script type="text/babel">
                              const { useState, useEffect, useRef } = React;
                              
                              try {
                                // Get the code from active file
                                const code = \`${activeFile?.content || ''}\`;
                                
                                // Simple code processing - remove export statements
                                let processedCode = code;
                                
                                // Remove export default App;
                                processedCode = processedCode.replace('export default App;', '');
                                processedCode = processedCode.replace('export default App', '');
                                
                                // Replace export default function App() with function App()
                                processedCode = processedCode.replace('export default function App()', 'function App()');
                                processedCode = processedCode.replace('export default function App ()', 'function App()');
                                
                                // Also handle arrow functions
                                processedCode = processedCode.replace('export default () =>', 'const App = () =>');
                                
                                // Evaluate the code
                                eval(processedCode);
                                
                                // Check if App function exists (could be function or const)
                                if (typeof App === 'function' || (typeof App !== 'undefined' && App !== null)) {
                                  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
                                } else {
                                  // Try to find App in global scope
                                  if (typeof window.App === 'function') {
                                    ReactDOM.createRoot(document.getElementById('root')).render(<window.App />);
                                  } else {
                                    document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;"><h3>Ошибка:</h3><p>Компонент App не найден. Убедитесь, что в коде есть функция App() или компонент App.</p><p>Код:</p><pre>' + processedCode.substring(0, 500) + '</pre></div>';
                                  }
                                }
                              } catch (error) {
                                document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;"><h3>Ошибка выполнения:</h3><pre>' + error.message + '</pre><p>Попробуйте упростить код или проверьте синтаксис.</p></div>';
                              }
                            </script>
                          </body>
                        </html>
                      `}
                     className="w-full h-full border-0"
                     title="Preview"
                   />
                   </div>
                   </div>
                 ) : (
                   <div className="h-full flex items-center justify-center text-gray-500">
                     <div className="text-center">
                       <PlayCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                       <p>Нажмите "Запустить" для предпросмотра</p>
                     </div>
                   </div>
                 )}
               </div>
            ) : activeTab === 'mobile' ? (
               <MobileBuilder />
             ) : activeTab === 'desktop' ? (
               <DesktopBuilder />
             ) : (
                 <div className="h-full overflow-y-auto p-6 text-white bg-slate-950">
                   <div className="max-w-5xl mx-auto space-y-8">
                     {/* ZIP Export & Cloud Save Hub */}
                     <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                       <div className="flex items-center justify-between">
                         <div>
                           <h2 className="text-xl font-semibold mb-1">Экспорт проекта в ZIP</h2>
                           <p className="text-sm text-gray-400">Скачать весь код и файлы проекта на компьютер в один клик.</p>
                         </div>
                         <button 
                           onClick={() => exportProjectToZip(project.files as any, project.name)}
                           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg text-white font-medium hover:from-emerald-600 hover:to-teal-700"
                         >
                           <Download className="w-5 h-5" />
                           Скачать ZIP
                         </button>
                       </div>
                     </section>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <UserAuth />
                       <ThemeSettings />
                     </div>

                     <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                       <h2 className="text-xl font-semibold mb-2">Стандартные Темы оформления</h2>
                       <p className="text-sm text-gray-400 mb-4">Выберите базовый внешний вид конструктора и сохраните его локально.</p>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                         {themeEntries.map(([key, preset]) => (
                           <button
                             key={key}
                             onClick={() => setThemeName(key)}
                             className={`rounded-xl border p-4 text-left transition-all ${themeName === key ? preset.accentSoft + ' shadow-lg' : 'border-slate-800 bg-slate-950 hover:border-slate-600'}`}
                           >
                             <div className="flex items-center justify-between mb-2">
                               <span className="font-semibold">{preset.label}</span>
                               <span className={`w-3 h-3 rounded-full ${preset.accent.split(' ')[0]}`} />
                             </div>
                             <div className="text-xs text-gray-400">{key}</div>
                           </button>
                         ))}
                       </div>
                     </section>

                    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      <h2 className="text-xl font-semibold mb-2">Интеграции сервисов</h2>
                      <p className="text-sm text-gray-400 mb-4">Подключите внешние API для файлов, данных и авторизации.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {serviceCards.map(service => {
                          const cfg = services[service.key];
                          return (
                            <div key={service.key} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <h3 className="font-semibold">{service.title}</h3>
                                  <p className="text-xs text-gray-400">{service.description}</p>
                                </div>
                                <button
                                  onClick={() => toggleService(service.key)}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${cfg.enabled ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                                >
                                  {cfg.enabled ? 'Включено' : 'Выключено'}
                                </button>
                              </div>
                              <input
                                type="text"
                                value={cfg.endpoint}
                                onChange={(e) => updateServiceConfig(service.key, { endpoint: e.target.value })}
                                placeholder="Endpoint URL"
                                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm"
                              />
                              <input
                                type="password"
                                value={cfg.token}
                                onChange={(e) => updateServiceConfig(service.key, { token: e.target.value })}
                                placeholder="API Token"
                                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      <h2 className="text-xl font-semibold mb-2">Оптимизация и багфиксы</h2>
                      <ul className="space-y-2 text-sm text-gray-300 list-disc pl-5">
                        <li>Preview теперь обрабатывает export default и показывает понятную ошибку.</li>
                        <li>Активный файл вычисляется через useMemo, чтобы уменьшить лишние проходы по дереву файлов.</li>
                        <li>Тема и интеграции сохраняются в localStorage.</li>
                      </ul>
                    </section>
                  </div>
                </div>
            )}
          </div>

          {/* Build Output */}
          {project.buildOutput.length > 0 && (
            <div className="bg-gray-800 border-t border-gray-700 p-4 max-h-40 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Вывод сборки</h3>
              <div className="space-y-1">
                {project.buildOutput.map((line, i) => (
                  <div key={i} className="text-sm text-gray-300 font-mono">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Chat Panel */}
        <AnimatePresence>
          {chatOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  ИИ Помощник
                </h2>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      {message.type === 'code' ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                          {message.content.split('```').map((part, i) => {
                            if (i % 2 === 1) {
                              const [_lang, ...code] = part.split('\n');
                              return (
                                <pre key={i} className="bg-gray-900 p-3 rounded-lg overflow-x-auto my-2">
                                  <code className="text-xs">{code.join('\n')}</code>
                                </pre>
                              );
                            }
                            return <p key={i} className="my-1">{part}</p>;
                          })}
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              <div className="px-4 py-2 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-2">Попробуйте:</p>
                <div className="flex flex-wrap gap-2">
                  {AI_SUGGESTIONS.slice(0, 4).map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                    >
                      {suggestion.substring(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Опишите, что хотите создать..."
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <footer className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <span>React + TypeScript + Tailwind</span>
          <span>|</span>
          <span>{activeFile?.name || 'Нет файла'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>UTF-8</span>
          <span>TypeScript React</span>
        </div>
      </footer>
    </div>
    </DropZone>
  );
}
