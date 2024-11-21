import React from 'react';
import { Home, Database, FolderOpen, BarChart2, Book, Library } from 'lucide-react';

interface SidebarProps {
  onNavigate: (view: 'dashboard' | 'prompts' | 'sources' | 'analytics' | 'glossary') => void;
  currentView: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentView }) => {
  const items = [
    { name: 'Dashboard', icon: Home, view: 'dashboard' as const },
    { name: 'Prompt Glossary', icon: Book, view: 'glossary' as const },
    { name: 'Prompt Management', icon: Database, view: 'prompts' as const },
    { name: 'Source Manager', icon: FolderOpen, view: 'sources' as const },
    { name: 'Analytics', icon: BarChart2, view: 'analytics' as const },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Library className="h-6 w-6 text-blue-400 mr-2" />
              <h1 className="text-xl font-bold text-white">Prompt Library</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => item.view && onNavigate(item.view)}
                  className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    currentView === item.view
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;