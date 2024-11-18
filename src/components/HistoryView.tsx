import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, XCircle, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { UploadHistory } from '../types';

interface HistoryViewProps {
  history: UploadHistory[];
  onToggleActive: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onToggleActive }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4">Prompt Upload History</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prompts
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 ${!item.isActive ? 'opacity-75' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.fileName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(item.uploadDate), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className={`text-sm ${
                        item.status === 'success' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                      {item.errorMessage && (
                        <div className="ml-2 group relative">
                          <AlertCircle className="h-5 w-5 text-amber-500 cursor-help" />
                          <div className="hidden group-hover:block absolute z-10 w-48 p-2 text-sm bg-gray-900 text-white rounded shadow-lg -top-2 left-6">
                            {item.errorMessage}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.promptCount} prompts
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => onToggleActive(item.id)}
                      className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                      title={item.isActive ? 'Deactivate prompts' : 'Activate prompts'}
                    >
                      {item.isActive ? (
                        <ToggleRight className="h-6 w-6 text-green-500" />
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

export default HistoryView;