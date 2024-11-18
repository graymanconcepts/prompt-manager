import { useMemo } from 'react';
import { Prompt } from '../types';

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
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Tag Usage Analytics</h2>
        <div className="bg-white rounded-lg shadow">
          <div className="p-4">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Tag</th>
                  <th className="text-left py-2">Count</th>
                  <th className="text-left py-2">Usage %</th>
                  <th className="text-left py-2">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {tagAnalytics.map(({ tag, count, percentage }) => (
                  <tr key={tag} className="border-b hover:bg-gray-50">
                    <td className="py-2">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {tag}
                      </span>
                    </td>
                    <td className="py-2">{count}</td>
                    <td className="py-2">{percentage.toFixed(1)}%</td>
                    <td className="py-2 w-1/3">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
