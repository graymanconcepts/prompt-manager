import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, XCircle, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { UploadHistory, Prompt } from '../types';
import FileUpload from './FileUpload';

interface SourceManagerViewProps {
  history: UploadHistory[];
  onToggleActive: (id: string) => void;
  onAddPrompts: (prompts: Prompt[], historyEntry: UploadHistory) => void;
}

const SourceManagerView: React.FC<SourceManagerViewProps> = ({ history, onToggleActive, onAddPrompts }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-400">Prompt Source Manager</h1>
      
      <div className="mb-6">
        <FileUpload onFileProcess={(newPrompts, historyEntry) => onAddPrompts(newPrompts, historyEntry)} />
      </div>

      <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Source Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Added Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Prompts
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Active
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {history.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-700 transition-colors duration-150 ${!item.isActive ? 'opacity-75' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {item.fileName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {format(new Date(item.uploadDate), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 mr-2" />
                      )}
                      <span className={`text-sm ${
                        item.status === 'success' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                      {item.errorMessage && (
                        <div className="ml-2 group relative">
                          <AlertCircle className="h-5 w-5 text-amber-400 cursor-help" />
                          <div className="hidden group-hover:block absolute z-10 w-48 p-2 text-sm bg-gray-900 text-white rounded shadow-lg -top-2 left-6">
                            {item.errorMessage}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {item.promptCount} prompts
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button
                      onClick={() => onToggleActive(item.id)}
                      className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                      title={item.isActive ? 'Deactivate source' : 'Activate source'}
                    >
                      {item.isActive ? (
                        <ToggleRight className="h-6 w-6 text-blue-400" />
                      ) : (
                        <ToggleLeft className="h-6 w-6" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SourceManagerView;
