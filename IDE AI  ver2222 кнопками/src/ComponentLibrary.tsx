import { useState } from 'react';
import { 
  Code, Layout, Database, 
  MessageSquare, FileCode,
  Eye, Globe,
  ArrowRight,
  Copy, Check, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Component {
  id: string;
  name: string;
  category: 'layout' | 'form' | 'navigation' | 'media' | 'feedback' | 'data';
  description: string;
  code: string;
  preview: string;
}

const COMPONENTS: Component[] = [
  {
    id: 'card',
    name: 'Карточка товара',
    category: 'media',
    description: 'Красивая карточка с изображением, описанием и кнопкой',
    code: `function ProductCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto hover:shadow-xl transition-shadow">
      <img 
        src="https://picsum.photos/400/300" 
        alt="Товар"
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Крутой продукт
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
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
  );
}`,
    preview: '🛒 Карточка с фото и ценой'
  },
  {
    id: 'form',
    name: 'Форма регистрации',
    category: 'form',
    description: 'Форма с валидацией email и пароля',
    code: `import { useState } from 'react';

function RegistrationForm() {
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
      alert('Форма отправлена!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Имя</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Пароль</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
      </div>
      <button 
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Зарегистрироваться
      </button>
    </form>
  );
}`,
    preview: '📝 Форма с валидацией'
  },
  {
    id: 'navbar',
    name: 'Навигационное меню',
    category: 'navigation',
    description: 'Адаптивное меню с мобильной версией',
    code: `import { useState } from 'react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="text-xl font-bold text-blue-600">Logo</div>
          
          <div className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-blue-600 transition font-medium">Главная</a>
            <a href="#" className="hover:text-blue-600 transition font-medium">О нас</a>
            <a href="#" className="hover:text-blue-600 transition font-medium">Услуги</a>
            <a href="#" className="hover:text-blue-600 transition font-medium">Контакты</a>
          </div>
          
          <button 
            className="md:hidden text-2xl"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
        
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a href="#" className="block py-2 hover:text-blue-600 transition">Главная</a>
            <a href="#" className="block py-2 hover:text-blue-600 transition">О нас</a>
            <a href="#" className="block py-2 hover:text-blue-600 transition">Услуги</a>
            <a href="#" className="block py-2 hover:text-blue-600 transition">Контакты</a>
          </div>
        )}
      </div>
    </nav>
  );
}`,
    preview: '📱 Адаптивное меню'
  },
  {
    id: 'button',
    name: 'Кнопки',
    category: 'layout',
    description: 'Набор стильных кнопок с разными состояниями',
    code: `function Buttons() {
  return (
    <div className="flex flex-wrap gap-4">
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
        Основная
      </button>
      <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
        Вторичная
      </button>
      <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors">
        Успех
      </button>
      <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors">
        Ошибка
      </button>
      <button className="border-2 border-blue-500 text-blue-500 hover:bg-blue-50 px-6 py-2 rounded-lg transition-colors">
        Контурная
      </button>
      <button disabled className="bg-gray-300 text-gray-500 px-6 py-2 rounded-lg cursor-not-allowed">
        Отключена
      </button>
    </div>
  );
}`,
    preview: '🔘 Разные стили кнопок'
  },
  {
    id: 'alert',
    name: 'Уведомления',
    category: 'feedback',
    description: 'Информационные сообщения разных типов',
    code: `function Alerts() {
  return (
    <div className="space-y-3 max-w-md">
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
        <p className="font-medium">Информация</p>
        <p className="text-sm">Это информационное сообщение</p>
      </div>
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
        <p className="font-medium">Успех</p>
        <p className="text-sm">Операция выполнена успешно!</p>
      </div>
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
        <p className="font-medium">Предупреждение</p>
        <p className="text-sm">Обратите внимание на это</p>
      </div>
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
        <p className="font-medium">Ошибка</p>
        <p className="text-sm">Произошла ошибка</p>
      </div>
    </div>
  );
}`,
    preview: '📢 Сообщения разных типов'
  },
  {
    id: 'modal',
    name: 'Модальное окно',
    category: 'feedback',
    description: 'Модальное окно с анимацией',
    code: `import { useState } from 'react';

function Modal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg"
      >
        Открыть модальное окно
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Заголовок</h2>
            <p className="text-gray-600 mb-6">
              Это содержимое модального окна. Здесь может быть любая информация.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Отмена
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                ОК
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}`,
    preview: '🪟 Модальное окно'
  },
  {
    id: 'table',
    name: 'Таблица данных',
    category: 'data',
    description: 'Стильная таблица с данными',
    code: `function DataTable() {
  const data = [
    { id: 1, name: 'Иван', email: 'ivan@example.com', status: 'Активен' },
    { id: 2, name: 'Мария', email: 'maria@example.com', status: 'Активен' },
    { id: 3, name: 'Алексей', email: 'alex@example.com', status: 'Неактивен' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm">{row.id}</td>
              <td className="px-6 py-4 text-sm font-medium">{row.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{row.email}</td>
              <td className="px-6 py-4 text-sm">
                <span className={\`px-2 py-1 rounded text-xs \${
                  row.status === 'Активен' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }\`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
    preview: '📊 Таблица с данными'
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    category: 'layout',
    description: 'Панель управления со статистикой',
    code: `function Dashboard() {
  const stats = [
    { label: 'Пользователи', value: '1,234', change: '+12%', positive: true },
    { label: 'Доход', value: '₽45,678', change: '+8%', positive: true },
    { label: 'Заказы', value: '567', change: '-3%', positive: false },
    { label: 'Конверсия', value: '3.2%', change: '+0.5%', positive: true },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
          <p className="text-2xl font-bold mb-2">{stat.value}</p>
          <span className={\`text-sm \${stat.positive ? 'text-green-600' : 'text-red-600'}\`}>
            {stat.change} с прошлого месяца
          </span>
        </div>
      ))}
    </div>
  );
}`,
    preview: '📈 Dashboard со статистикой'
  }
];

const CATEGORIES = [
  { id: 'all', name: 'Все', icon: Layout },
  { id: 'layout', name: 'Макеты', icon: Layout },
  { id: 'form', name: 'Формы', icon: Database },
  { id: 'navigation', name: 'Навигация', icon: Globe },
  { id: 'media', name: 'Медиа', icon: FileCode },
  { id: 'feedback', name: 'Обратная связь', icon: MessageSquare },
  { id: 'data', name: 'Данные', icon: Database },
];

export default function ComponentLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [showCode, setShowCode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredComponents = COMPONENTS.filter(component => {
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = () => {
    if (selectedComponent) {
      navigator.clipboard.writeText(selectedComponent.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            🎨 Библиотека компонентов
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Готовые компоненты для быстрого создания приложений
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Поиск компонентов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 rounded-full bg-white/20 backdrop-blur-lg text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {CATEGORIES.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                  selectedCategory === category.id
                    ? 'bg-white text-purple-600 shadow-lg scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{category.name}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Components Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {filteredComponents.map((component, index) => (
            <motion.div
              key={component.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedComponent(component)}
              className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{component.preview.split(' ')[0]}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{component.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{component.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full capitalize">
                  {component.category}
                </span>
                <ArrowRight className="w-5 h-5 text-purple-500" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Component Detail Modal */}
        <AnimatePresence>
          {selectedComponent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedComponent(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedComponent.name}</h2>
                      <p className="text-white/90">{selectedComponent.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedComponent(null)}
                      className="text-white hover:text-white/80 text-3xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  {/* Preview Toggle */}
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => setShowCode(true)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        showCode ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      <Code className="w-4 h-4 inline mr-2" />
                      Код
                    </button>
                    <button
                      onClick={() => setShowCode(false)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        !showCode ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      <Eye className="w-4 h-4 inline mr-2" />
                      Предпросмотр
                    </button>
                  </div>

                  {/* Code or Preview */}
                  {showCode ? (
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto text-sm">
                        <code>{selectedComponent.code}</code>
                      </pre>
                      <button
                        onClick={handleCopy}
                        className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="text-sm">{copied ? 'Скопировано!' : 'Копировать'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-xl p-8 min-h-[300px] flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-6xl mb-4">{selectedComponent.preview.split(' ')[0]}</div>
                        <p>Предпросмотр компонента: {selectedComponent.name}</p>
                        <p className="text-sm mt-2">Скопируйте код и вставьте в свой проект</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      {copied ? 'Скопировано!' : 'Копировать код'}
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">
                      <ExternalLink className="w-5 h-5" />
                      Открыть в редакторе
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-white/80"
        >
          <p className="text-lg">
            💡 Скопируйте код компонента и используйте в своём проекте
          </p>
          <p className="text-sm mt-2 opacity-75">
            Все компоненты созданы с React + Tailwind CSS
          </p>
        </motion.div>
      </div>
    </div>
  );
}
