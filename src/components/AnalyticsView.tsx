import { useMemo, useState } from 'react';
import { Prompt } from '../types';
import { TagList } from './Tag';
import { Hash, AlignLeft, FileText, Star, BarChart2 } from 'lucide-react';
import Rating from './Rating';

interface TagAnalytics {
  tag: string;
  count: number;
  percentage: number;
}

interface ContentAnalytics {
  lengthDistribution: {
    short: number;
    medium: number;
    long: number;
  };
  wordCountRanges: { [key: string]: number };
  averageLength: number;
  titleLengths: {
    range: string;
    count: number;
  }[];
  commonPhrases: {
    phrase: string;
    count: number;
  }[];
}

interface DescriptionAnalytics {
  lengthDistribution: {
    short: number;
    medium: number;
    long: number;
  };
  commonWords: {
    word: string;
    count: number;
  }[];
  qualityMetrics: {
    hasKeywords: number;
    hasContext: number;
    hasObjective: number;
    total: number;
  };
  themes: {
    theme: string;
    count: number;
    percentage: number;
  }[];
}

interface QualityMetrics {
  activeCorrelations: {
    category: string;
    activeCount: number;
    inactiveCount: number;
    totalActive: number;
    totalInactive: number;
  }[];
  sourceCharacteristics: {
    sourceId: string;
    fileName: string;
    metrics: {
      avgLength: number;
      avgTags: number;
      activePercentage: number;
      promptCount: number;
    };
  }[];
  ratingAnalytics: {
    averageRating: number;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
    favoriteCount: number;
    mostRatedPrompts: Prompt[];
  };
}

interface AnalyticsViewProps {
  prompts: Prompt[];
  history?: { id: string; fileName: string }[];
}

export default function AnalyticsView({ prompts, history = [] }: AnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState<'tags' | 'content' | 'description' | 'quality'>('tags');

  const tagAnalytics = useMemo(() => {
    const tagCounts = prompts.reduce((acc: { [key: string]: number }, prompt) => {
      prompt.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {});

    const totalTags = Object.values(tagCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(tagCounts)
      .map(([tag, count]): TagAnalytics => ({
        tag,
        count,
        percentage: (count / totalTags) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }, [prompts]);

  const contentAnalytics = useMemo(() => {
    const analytics: ContentAnalytics = {
      lengthDistribution: { short: 0, medium: 0, long: 0 },
      wordCountRanges: {},
      averageLength: 0,
      titleLengths: [],
      commonPhrases: []
    };

    let totalLength = 0;
    prompts.forEach(prompt => {
      const length = prompt.content.length;
      totalLength += length;

      if (length < 100) analytics.lengthDistribution.short++;
      else if (length < 500) analytics.lengthDistribution.medium++;
      else analytics.lengthDistribution.long++;

      const wordCount = prompt.content.split(/\s+/).length;
      const wordRange = Math.floor(wordCount / 50) * 50;
      const rangeKey = `${wordRange}-${wordRange + 49}`;
      analytics.wordCountRanges[rangeKey] = (analytics.wordCountRanges[rangeKey] || 0) + 1;

      const titleLength = prompt.title.length;
      const titleRange = titleLength < 20 ? 'Short (<20)' :
                        titleLength < 40 ? 'Medium (20-39)' : 'Long (40+)';
      const existingTitleRange = analytics.titleLengths.find(t => t.range === titleRange);
      if (existingTitleRange) {
        existingTitleRange.count++;
      } else {
        analytics.titleLengths.push({ range: titleRange, count: 1 });
      }
    });

    analytics.averageLength = totalLength / prompts.length;

    const phraseMap = new Map<string, number>();
    prompts.forEach(prompt => {
      const words = prompt.content.toLowerCase().split(/\s+/);
      for (let i = 0; i < words.length - 2; i++) {
        const phrase = words.slice(i, i + 3).join(' ');
        phraseMap.set(phrase, (phraseMap.get(phrase) || 0) + 1);
      }
    });

    analytics.commonPhrases = Array.from(phraseMap.entries())
      .filter(([_, count]) => count > 1)
      .map(([phrase, count]) => ({ phrase, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return analytics;
  }, [prompts]);

  const descriptionAnalytics = useMemo(() => {
    const analytics: DescriptionAnalytics = {
      lengthDistribution: { short: 0, medium: 0, long: 0 },
      commonWords: [],
      qualityMetrics: {
        hasKeywords: 0,
        hasContext: 0,
        hasObjective: 0,
        total: prompts.length
      },
      themes: []
    };

    // Word frequency map for common words
    const wordMap = new Map<string, number>();
    const themeMap = new Map<string, number>();

    // Common theme indicators
    const themeIndicators = {
      'Task-based': ['create', 'generate', 'write', 'develop', 'build'],
      'Role-based': ['you are', 'act as', 'behave as', 'expert', 'professional'],
      'Educational': ['explain', 'teach', 'guide', 'help understand', 'learn'],
      'Creative': ['story', 'imagine', 'creative', 'design', 'artistic'],
      'Technical': ['code', 'program', 'technical', 'analyze', 'system'],
      'Business': ['business', 'market', 'strategy', 'plan', 'professional']
    };

    prompts.forEach(prompt => {
      const description = prompt.description?.toLowerCase() || '';
      
      // Length distribution
      const length = description.length;
      if (length < 50) analytics.lengthDistribution.short++;
      else if (length < 150) analytics.lengthDistribution.medium++;
      else analytics.lengthDistribution.long++;

      // Word frequency
      const words = description.split(/\s+/).filter(word => 
        word.length > 3 && !['the', 'and', 'for', 'that', 'with'].includes(word)
      );
      
      words.forEach(word => {
        wordMap.set(word, (wordMap.get(word) || 0) + 1);
      });

      // Quality metrics
      if (words.length >= 5) analytics.qualityMetrics.hasKeywords++;
      if (description.includes('for') || description.includes('to')) analytics.qualityMetrics.hasObjective++;
      if (description.length > 50) analytics.qualityMetrics.hasContext++;

      // Theme detection
      Object.entries(themeIndicators).forEach(([theme, indicators]) => {
        if (indicators.some(indicator => description.includes(indicator))) {
          themeMap.set(theme, (themeMap.get(theme) || 0) + 1);
        }
      });
    });

    // Process common words
    analytics.commonWords = Array.from(wordMap.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Process themes
    const totalThemes = Array.from(themeMap.values()).reduce((sum, count) => sum + count, 0);
    analytics.themes = Array.from(themeMap.entries())
      .map(([theme, count]) => ({
        theme,
        count,
        percentage: (count / totalThemes) * 100
      }))
      .sort((a, b) => b.count - a.count);

    return analytics;
  }, [prompts]);

  const qualityMetrics = useMemo(() => {
    const metrics: QualityMetrics = {
      activeCorrelations: [],
      sourceCharacteristics: [],
      ratingAnalytics: {
        averageRating: prompts.reduce((sum, p) => sum + (p.rating || 0), 0) / prompts.filter(p => p.rating).length || 0,
        ratingDistribution: {
          5: prompts.filter(p => p.rating === 5).length,
          4: prompts.filter(p => p.rating === 4).length,
          3: prompts.filter(p => p.rating === 3).length,
          2: prompts.filter(p => p.rating === 2).length,
          1: prompts.filter(p => p.rating === 1).length,
        },
        favoriteCount: prompts.filter(p => p.isFavorite).length,
        mostRatedPrompts: prompts
          .filter(p => p.ratingCount > 0)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 5)
      }
    };

    // Create a map of history IDs to filenames
    const historyMap = new Map(history.map(h => [h.id, h.fileName]));

    // Calculate total active/inactive counts
    const totalActive = prompts.filter(p => p.isActive).length;
    const totalInactive = prompts.length - totalActive;

    // Analyze correlations with active status
    const lengthCorrelation = {
      category: 'Length',
      activeCount: 0,
      inactiveCount: 0,
      totalActive,
      totalInactive
    };

    const tagsCorrelation = {
      category: 'Tags',
      activeCount: 0,
      inactiveCount: 0,
      totalActive,
      totalInactive
    };

    const descriptionCorrelation = {
      category: 'Description',
      activeCount: 0,
      inactiveCount: 0,
      totalActive,
      totalInactive
    };

    // Group prompts by source
    const sourceMap = new Map<string, {
      fileName: string;
      prompts: Prompt[];
    }>();

    prompts.forEach(prompt => {
      // Length correlation (prompts > 200 chars)
      if (prompt.content.length > 200) {
        if (prompt.isActive) lengthCorrelation.activeCount++;
        else lengthCorrelation.inactiveCount++;
      }

      // Tags correlation (prompts with 3+ tags)
      if (prompt.tags.length >= 3) {
        if (prompt.isActive) tagsCorrelation.activeCount++;
        else tagsCorrelation.inactiveCount++;
      }

      // Description correlation (prompts with substantial descriptions)
      if (prompt.description && prompt.description.length > 100) {
        if (prompt.isActive) descriptionCorrelation.activeCount++;
        else descriptionCorrelation.inactiveCount++;
      }

      // Group by source
      if (prompt.historyId) {
        const fileName = historyMap.get(prompt.historyId) || 'Untitled Upload';
        const existing = sourceMap.get(prompt.historyId) || {
          fileName,
          prompts: []
        };
        existing.prompts.push(prompt);
        sourceMap.set(prompt.historyId, existing);
      }
    });

    metrics.activeCorrelations = [
      lengthCorrelation,
      tagsCorrelation,
      descriptionCorrelation
    ];

    // Calculate source characteristics
    metrics.sourceCharacteristics = Array.from(sourceMap.entries())
      .map(([sourceId, data]) => {
        const sourcePrompts = data.prompts;
        const activeCount = sourcePrompts.filter(p => p.isActive).length;
        
        return {
          sourceId,
          fileName: data.fileName,
          metrics: {
            avgLength: sourcePrompts.reduce((sum, p) => sum + p.content.length, 0) / sourcePrompts.length,
            avgTags: sourcePrompts.reduce((sum, p) => sum + p.tags.length, 0) / sourcePrompts.length,
            activePercentage: (activeCount / sourcePrompts.length) * 100,
            promptCount: sourcePrompts.length
          }
        };
      })
      .sort((a, b) => b.metrics.promptCount - a.metrics.promptCount);

    return metrics;
  }, [prompts, history]);

  const renderTabs = () => (
    <div className="flex gap-2 mb-6">
      <button
        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-150 ${
          activeTab === 'tags'
            ? 'bg-blue-500 text-white shadow-lg'
            : 'bg-gray-700 text-white hover:bg-gray-600'
        }`}
        onClick={() => setActiveTab('tags')}
      >
        <Hash className="w-4 h-4 mr-2" />
        Tag Usage
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-150 ${
          activeTab === 'content'
            ? 'bg-blue-500 text-white shadow-lg'
            : 'bg-gray-700 text-white hover:bg-gray-600'
        }`}
        onClick={() => setActiveTab('content')}
      >
        <AlignLeft className="w-4 h-4 mr-2" />
        Content Analytics
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-150 ${
          activeTab === 'description'
            ? 'bg-blue-500 text-white shadow-lg'
            : 'bg-gray-700 text-white hover:bg-gray-600'
        }`}
        onClick={() => setActiveTab('description')}
      >
        <FileText className="w-4 h-4 mr-2" />
        Description Analysis
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-150 ${
          activeTab === 'quality'
            ? 'bg-blue-500 text-white shadow-lg'
            : 'bg-gray-700 text-white hover:bg-gray-600'
        }`}
        onClick={() => setActiveTab('quality')}
      >
        <BarChart2 className="w-4 h-4 mr-2" />
        Quality Metrics
      </button>
    </div>
  );

  const renderTagAnalytics = () => (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">Tag Usage Statistics</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tagAnalytics.map((tagStat, index) => (
          <div key={index} className="bg-gray-700 rounded-md p-4">
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
  );

  const renderContentAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Prompt Length Distribution</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(contentAnalytics.lengthDistribution).map(([category, count]) => (
            <div key={category} className="bg-gray-700 rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-white capitalize">
                  {category} ({category === 'short' ? '<100' : category === 'medium' ? '100-500' : '500+'} chars)
                </span>
                <span className="text-gray-300 text-sm">
                  {((count / prompts.length) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(count / prompts.length) * 100}%` }}
                />
              </div>
              <div className="text-gray-300 text-sm mt-1">
                {count} prompt{count !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Word Count Distribution</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(contentAnalytics.wordCountRanges)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([range, count]) => (
              <div key={range} className="bg-gray-700 rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-white">{range} words</span>
                  <span className="text-gray-300 text-sm">
                    {((count / prompts.length) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(count / prompts.length) * 100}%` }}
                  />
                </div>
                <div className="text-gray-300 text-sm mt-1">
                  {count} prompt{count !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Title Length Distribution</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {contentAnalytics.titleLengths.map(({ range, count }) => (
            <div key={range} className="bg-gray-700 rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-white">{range}</span>
                <span className="text-gray-300 text-sm">
                  {((count / prompts.length) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(count / prompts.length) * 100}%` }}
                />
              </div>
              <div className="text-gray-300 text-sm mt-1">
                {count} prompt{count !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Common Phrases</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {contentAnalytics.commonPhrases.map(({ phrase, count }, index) => (
            <div key={index} className="bg-gray-700 rounded-md p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">"{phrase}"</span>
                <span className="text-gray-300 text-sm">
                  {count} occurrence{count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDescriptionAnalytics = () => (
    <div className="space-y-6">
      {/* Description Length Distribution */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Description Length Distribution</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(descriptionAnalytics.lengthDistribution).map(([category, count]) => (
            <div key={category} className="bg-gray-700 rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-white capitalize">
                  {category} ({category === 'short' ? '<50' : category === 'medium' ? '50-150' : '150+'} chars)
                </span>
                <span className="text-gray-300 text-sm">
                  {((count / prompts.length) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(count / prompts.length) * 100}%` }}
                />
              </div>
              <div className="text-gray-300 text-sm mt-1">
                {count} description{count !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Description Themes */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Common Themes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {descriptionAnalytics.themes.map((theme, index) => (
            <div key={index} className="bg-gray-700 rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-white">{theme.theme}</span>
                <span className="text-gray-300 text-sm">{theme.percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${theme.percentage}%` }}
                />
              </div>
              <div className="text-gray-300 text-sm mt-1">
                Found in {theme.count} description{theme.count !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Description Quality Metrics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-gray-700 rounded-md p-4">
            <div className="flex items-center mb-2">
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="font-medium text-white">Has Keywords</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(descriptionAnalytics.qualityMetrics.hasKeywords / descriptionAnalytics.qualityMetrics.total) * 100}%` }}
              />
            </div>
            <div className="text-gray-300 text-sm mt-1">
              {descriptionAnalytics.qualityMetrics.hasKeywords} of {descriptionAnalytics.qualityMetrics.total} descriptions
            </div>
          </div>
          <div className="bg-gray-700 rounded-md p-4">
            <div className="flex items-center mb-2">
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="font-medium text-white">Has Context</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(descriptionAnalytics.qualityMetrics.hasContext / descriptionAnalytics.qualityMetrics.total) * 100}%` }}
              />
            </div>
            <div className="text-gray-300 text-sm mt-1">
              {descriptionAnalytics.qualityMetrics.hasContext} of {descriptionAnalytics.qualityMetrics.total} descriptions
            </div>
          </div>
          <div className="bg-gray-700 rounded-md p-4">
            <div className="flex items-center mb-2">
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="font-medium text-white">Has Clear Objective</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(descriptionAnalytics.qualityMetrics.hasObjective / descriptionAnalytics.qualityMetrics.total) * 100}%` }}
              />
            </div>
            <div className="text-gray-300 text-sm mt-1">
              {descriptionAnalytics.qualityMetrics.hasObjective} of {descriptionAnalytics.qualityMetrics.total} descriptions
            </div>
          </div>
        </div>
      </div>

      {/* Common Words */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Common Words</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {descriptionAnalytics.commonWords.map(({ word, count }, index) => (
            <div key={index} className="bg-gray-700 rounded-md p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">"{word}"</span>
                <span className="text-gray-300 text-sm">
                  {count} occurrence{count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQualityMetrics = () => (
    <div className="space-y-6">
      {/* Rating Analytics */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-6 text-gray-200">Rating Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg mb-2 text-gray-200">Average Rating</h4>
            <div className="flex items-center gap-2">
              <Rating 
                value={Math.round(qualityMetrics.ratingAnalytics.averageRating)} 
                size="lg"
                readonly
              />
              <span className="text-2xl font-bold text-gray-200">
                {qualityMetrics.ratingAnalytics.averageRating.toFixed(1)}
              </span>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg mb-2 text-gray-200">Rating Distribution</h4>
            {Object.entries(qualityMetrics.ratingAnalytics.ratingDistribution)
              .reverse()
              .map(([rating, count]) => (
                <div key={rating} className="flex items-center gap-2 mb-1">
                  <Rating value={parseInt(rating)} size="sm" readonly />
                  <div className="flex-1">
                    <div className="h-2 bg-gray-700 rounded-full">
                      <div
                        className="h-2 bg-yellow-400 rounded-full"
                        style={{
                          width: `${(count / prompts.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-300">{count}</span>
                </div>
              ))}
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-lg mb-2 text-gray-200">Top 5 Rated Prompts</h4>
          <div className="space-y-2">
            {qualityMetrics.ratingAnalytics.mostRatedPrompts.length > 0 ? (
              qualityMetrics.ratingAnalytics.mostRatedPrompts.map(prompt => (
                <div key={prompt.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                  <div className="flex flex-col">
                    <span className="text-gray-200 font-medium">{prompt.title}</span>
                    <span className="text-sm text-gray-400 mt-0.5 line-clamp-1">{prompt.description}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Rating value={prompt.rating || 0} size="sm" readonly />
                      <span className="text-sm text-gray-400">
                        ({prompt.ratingCount} rating{prompt.ratingCount !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4 bg-gray-700 rounded">
                No rated prompts yet
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-lg mb-2 text-gray-200">Favorite Prompts</h4>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-200">
              {qualityMetrics.ratingAnalytics.favoriteCount}
            </span>
            <span className="text-gray-400">prompts marked as favorite</span>
          </div>
        </div>
      </div>

      {/* Active Status Correlations */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-6 text-gray-200">Active Status Correlations</h3>
        <div className="space-y-6">
          {qualityMetrics.activeCorrelations.map((correlation, index) => (
            <div key={index} className="bg-gray-700 rounded-md p-4">
              <h3 className="text-lg font-medium text-white mb-3">{correlation.category} Impact</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Active Prompts</span>
                    <span className="text-gray-300">
                      {((correlation.activeCount / correlation.totalActive) * 100).toFixed(1)}% match criteria
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(correlation.activeCount / correlation.totalActive) * 100}%` }}
                    />
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    {correlation.activeCount} of {correlation.totalActive} active prompts
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Inactive Prompts</span>
                    <span className="text-gray-300">
                      {((correlation.inactiveCount / correlation.totalInactive) * 100).toFixed(1)}% match criteria
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-red-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(correlation.inactiveCount / correlation.totalInactive) * 100}%` }}
                    />
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    {correlation.inactiveCount} of {correlation.totalInactive} inactive prompts
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Source Characteristics */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-6 text-gray-200">Source Characteristics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-gray-300">Source</th>
                <th className="py-3 px-4 text-gray-300">Prompt Count</th>
                <th className="py-3 px-4 text-gray-300">Avg. Length</th>
                <th className="py-3 px-4 text-gray-300">Avg. Tags</th>
                <th className="py-3 px-4 text-gray-300">Active %</th>
              </tr>
            </thead>
            <tbody>
              {qualityMetrics.sourceCharacteristics.map((source, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="py-3 px-4 text-white">{source.fileName}</td>
                  <td className="py-3 px-4 text-gray-300">{source.metrics.promptCount}</td>
                  <td className="py-3 px-4 text-gray-300">{Math.round(source.metrics.avgLength)} chars</td>
                  <td className="py-3 px-4 text-gray-300">{source.metrics.avgTags.toFixed(1)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-600 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${source.metrics.activePercentage}%` }}
                        />
                      </div>
                      <span className="text-gray-300">{Math.round(source.metrics.activePercentage)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-400">Prompt Analytics</h1>
      {renderTabs()}
      <div className="space-y-6">
        {activeTab === 'tags' && renderTagAnalytics()}
        {activeTab === 'content' && renderContentAnalytics()}
        {activeTab === 'description' && renderDescriptionAnalytics()}
        {activeTab === 'quality' && renderQualityMetrics()}
      </div>
    </div>
  );
}
