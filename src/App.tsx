import { useState, useEffect, useMemo } from 'react';
import { Plus, Image, Pencil } from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import PromptsView from './components/PromptsView';
import SourceManagerView from './components/SourceManagerView';
import HistoryView from './components/HistoryView';
import AnalyticsView from './components/AnalyticsView';
import PromptGlossaryView from './components/PromptGlossaryView';
import NewPromptModal from './components/NewPromptModal';
import IntelligentPromptEditor from './components/IntelligentPromptEditor';
import Tooltip from './components/Tooltip';
import { api } from './api/client';
import { Prompt, UploadHistory } from './types';
import { format } from 'date-fns';

function App() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [history, setHistory] = useState<UploadHistory[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'prompts' | 'sources' | 'analytics' | 'glossary'>('dashboard');
  const [isNewPromptModalOpen, setIsNewPromptModalOpen] = useState(false);
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [promptsData, historyData] = await Promise.all([
          api.getAllPrompts(),
          api.getAllHistory()
        ]);
        setPrompts(promptsData);
        setHistory(historyData);
      } catch (error) {
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // For dashboard - only consider individual prompt status
  const activePrompts = useMemo(() => {
    return prompts.filter(prompt => prompt.isActive);
  }, [prompts]);

  // For PromptsView - consider both prompt and history status
  const effectivelyActivePrompts = useMemo(() => {
    return prompts.filter(prompt => {
      // A prompt is effectively active if:
      // 1. It's individually active AND
      // 2. Either it has no history (manually created) OR its history is active
      return prompt.isActive && (prompt.historyId ? prompt.historyIsActive : true);
    });
  }, [prompts]);

  const handleAddPromptsInternal = async (newPrompts: Prompt[], historyEntry: UploadHistory) => {
    try {
      for (const prompt of newPrompts) {
        try {
          await api.createPrompt(prompt);
        } catch (error) {
          // Continue with other prompts even if one fails
        }
      }

      await api.createHistory(historyEntry);

      const [updatedPrompts, updatedHistory] = await Promise.all([
        api.getAllPrompts(),
        api.getAllHistory()
      ]);
      setPrompts(updatedPrompts);
      setHistory(updatedHistory);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleAddPrompts = (newPrompts: Prompt[], historyEntry: UploadHistory) => {
    handleAddPromptsInternal(newPrompts, historyEntry);
  };

  const handleAddPrompt = async (newPrompt: Prompt) => {
    try {
      const promptWithActive = {
        ...newPrompt,
        isActive: true
      };
      const updatedPrompts = await api.createPrompt(promptWithActive);
      const historyEntry: UploadHistory = {
        id: crypto.randomUUID(),
        fileName: `Manual Prompt: ${newPrompt.title}`,
        uploadDate: new Date().toISOString(),
        status: 'success',
        isActive: true,
        promptCount: 1,
        errorMessage: null
      };
      await api.createHistory(historyEntry);
      const updatedHistory = await api.getAllHistory();
      setPrompts(updatedPrompts);
      setHistory(updatedHistory);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleEditPrompt = async (updatedPrompt: Prompt) => {
    try {
      const updatedPrompts = await api.updatePrompt(updatedPrompt);
      setPrompts(updatedPrompts);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      const updatedPrompts = await api.deletePrompt(id);
      setPrompts(updatedPrompts);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleTogglePromptActive = async (id: string) => {
    try {
      const prompt = prompts.find(p => p.id === id);
      if (!prompt) return;

      const updatedPrompt = {
        ...prompt,
        isActive: !prompt.isActive,
        lastModified: new Date().toISOString()
      };

      await api.updatePrompt(updatedPrompt);
      const updatedPrompts = await api.getAllPrompts();
      setPrompts(updatedPrompts);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleToggleHistoryActive = async (id: string) => {
    try {
      const updatedHistory = await api.toggleHistoryActive(id);
      setHistory(updatedHistory);
      // Also refresh prompts since their effective status depends on history
      const updatedPrompts = await api.getAllPrompts();
      setPrompts(updatedPrompts);
    } catch (error) {
      console.error('Error toggling history active state:', error);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            prompts={activePrompts}
            onEditPrompt={handleEditPrompt}
          />
        );
      case 'prompts':
        return (
          <PromptsView 
            prompts={prompts}
            activePrompts={effectivelyActivePrompts}
            onEditPrompt={handleEditPrompt}
            onDeletePrompt={handleDeletePrompt}
            onToggleActive={handleTogglePromptActive}
            history={history}
          />
        );
      case 'sources':
        return (
          <SourceManagerView
            history={history}
            onToggleActive={handleToggleHistoryActive}
            onAddPrompts={handleAddPrompts}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView 
            prompts={prompts}
            history={history}
          />
        );
      case 'glossary':
        return (
          <PromptGlossaryView />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar onNavigate={setCurrentView} currentView={currentView} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-800 shadow-sm z-10">
          <div className="max-w-full mx-auto px-8 sm:px-12 lg:px-16">
            <div className="flex justify-between items-center py-4">
              <div className="flex-1 flex justify-end space-x-4">
                <Tooltip text="Create image generation prompt" position="bottom">
                  <button
                    onClick={() => setIsPromptEditorOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors duration-200"
                  >
                    <Image className="h-5 w-5 mr-2" />
                    Image Prompt
                  </button>
                </Tooltip>
                <Tooltip text="Create text-based prompt" position="bottom">
                  <button
                    onClick={() => setIsNewPromptModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors duration-200"
                  >
                    <Pencil className="h-5 w-5 mr-2" />
                    Text Prompt
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-100/90">
          {renderCurrentView()}
        </main>

        <NewPromptModal
          isOpen={isNewPromptModalOpen}
          onClose={() => setIsNewPromptModalOpen(false)}
          onSave={handleAddPrompt}
        />

        {isPromptEditorOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-h-[90vh] overflow-auto">
              <IntelligentPromptEditor
                onComplete={(prompt, title, tags) => {
                  handleAddPrompt({
                    id: crypto.randomUUID(),
                    title: title,
                    description: 'Created with Intelligent Prompt Editor',
                    content: prompt,
                    tags: ['image-generation', ...tags],
                    created: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    isActive: true
                  });
                  setIsPromptEditorOpen(false);
                }}
                onCancel={() => setIsPromptEditorOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;