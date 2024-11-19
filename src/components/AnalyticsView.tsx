import { useMemo } from 'react';
import { Prompt } from '../types';
import { TagList } from './Tag';

interface TagAnalytics {
  tag: string;
  count: number;
  percentage: number;
}

interface AnalyticsViewProps {
  prompts: Prompt[];
}

export default function AnalyticsView({ prompts }: AnalyticsViewProps) {
  const tagAnalytics = useMemo(() => {
    // Count occurrences of each tag
    const tagCounts = prompts.reduce((acc: { [key: string]: number }, prompt) => {
      prompt.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {});

    // Calculate total number of tag usages
    const totalTags = Object.values(tagCounts).reduce((sum, count) => sum + count, 0);

    // Convert to array and sort by count
    return Object.entries(tagCounts)
      .map(([tag, count]): TagAnalytics => ({
        tag,
        count,
        percentage: (count / totalTags) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }, [prompts]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-400">Analytics</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Tag Usage Statistics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tagAnalytics.map((tagStat, index) => (
              <div key={index} className="bg-gray-700 rounded-md p-4 transition-all duration-200 hover:bg-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-white">{tagStat.tag}</span>
                  <span className="text-gray-300 text-sm">{tagStat.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${tagStat.percentage}%` }}
                  />
                </div>
                <div className="text-gray-300 text-sm mt-1">
                  Used in {tagStat.count} prompt{tagStat.count !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
