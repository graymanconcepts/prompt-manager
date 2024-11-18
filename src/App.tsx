import { useState, useEffect, useMemo } from 'react';
import { Plus} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PromptsView from './components/PromptsView';
import HistoryView from './components/HistoryView';
import AnalyticsView from './components/AnalyticsView';
import NewPromptModal from './components/NewPromptModal';
import { api } from './api/client';
import { Prompt, UploadHistory } from './types';

function App() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [history, setHistory] = useState<UploadHistory[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'prompts' | 'history' | 'analytics'>('dashboard');
  const [isNewPromptModalOpen, setIsNewPromptModalOpen] = useState(false);
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
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const activePrompts = useMemo(() => {
    const activeFiles = new Set(
      history.filter(h => h.isActive).map(h => h.fileName)
    );
    return prompts.filter(prompt => 
      activeFiles.has(`${prompt.title}.txt`) || 
      !history.some(h => h.fileName === `${prompt.title}.txt`)
    );
  }, [prompts, history]);

  const handleAddPromptsInternal = async (newPrompts: Prompt[], historyEntry: UploadHistory) => {
    try {
      console.log('Adding prompts:', newPrompts);
      
      // Create all prompts
      for (const prompt of newPrompts) {
        try {
          console.log('Creating prompt:', prompt);
          await api.createPrompt(prompt);
          console.log('Prompt created successfully');
        } catch (error) {
          console.error('Error creating prompt:', error);
          // Continue with other prompts even if one fails
        }
      }

      // Create history entry with original filename
      await api.createHistory(historyEntry);

      // Get updated data
      const [updatedPrompts, updatedHistory] = await Promise.all([
        api.getAllPrompts(),
        api.getAllHistory()
      ]);
      setPrompts(updatedPrompts);
      setHistory(updatedHistory);
      
      console.log('Successfully added all prompts');
    } catch (error) {
      console.error('Error in handleAddPrompts:', error);
    }
  };

  const handleAddPrompts = (newPrompts: Prompt[]) => {
    // Create a default history entry
    const historyEntry: UploadHistory = {
      id: crypto.randomUUID(),
      fileName: `batch_upload_${new Date().toISOString()}`,
      uploadDate: new Date().toISOString(),
      status: 'success',
      isActive: true,
      promptCount: newPrompts.length,
      errorMessage: null
    };
    
    handleAddPromptsInternal(newPrompts, historyEntry);
  };

  const handleAddSinglePrompt = async (newPrompt: Prompt) => {
    try {
      const promptWithActive = {
        ...newPrompt,
        isActive: true
      };
      const updatedPrompts = await api.createPrompt(promptWithActive);
      const historyEntry: UploadHistory = {
        id: crypto.randomUUID(),
        fileName: `${newPrompt.title}.txt`,
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
      console.error('Error adding prompt:', error);
    }
  };

  const handleEditPrompt = async (updatedPrompt: Prompt) => {
    try {
      const updatedPrompts = await api.updatePrompt(updatedPrompt);
      setPrompts(updatedPrompts);
    } catch (error) {
      console.error('Error updating prompt:', error);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      const updatedPrompts = await api.deletePrompt(id);
      setPrompts(updatedPrompts);
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await api.toggleHistoryActive(id);
      const updatedHistory = await api.getAllHistory();
      setHistory(updatedHistory);
    } catch (error) {
      console.error('Error toggling active state:', error);
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex-1 flex justify-end">
                <button
                  onClick={() => setIsNewPromptModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Prompt
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-100/90">
          {currentView === 'dashboard' && (
            <Dashboard 
              prompts={activePrompts}
              onEditPrompt={handleEditPrompt}
            />
          )}
          {currentView === 'prompts' && (
            <PromptsView 
              prompts={prompts} 
              onEditPrompt={handleEditPrompt}
              onDeletePrompt={handleDeletePrompt}
              onUpdatePrompts={setPrompts}
              onAddPrompts={handleAddPrompts}
            />
          )}
          {currentView === 'history' && (
            <HistoryView history={history} onToggleActive={handleToggleActive} />
          )}
          {currentView === 'analytics' && (
            <AnalyticsView prompts={prompts} />
          )}
        </main>

        <NewPromptModal
          isOpen={isNewPromptModalOpen}
          onClose={() => setIsNewPromptModalOpen(false)}
          onSave={handleAddSinglePrompt}
        />
      </div>
    </div>
  );
}

export default App;