import React from 'react';
import { Tag as TagIcon } from 'lucide-react';

interface TagProps {
  text: string;
  style?: React.CSSProperties;
  showIcon?: boolean;
}

const baseTagStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: '#D5FFFF',
  color: '#1D4ED8',
  padding: '0.25rem 0.5rem',
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  border: '1px solid rgba(29, 78, 216, 0.1)',
  margin: '0.125rem',
  gap: '0.25rem',
};

export const Tag: React.FC<TagProps> = ({ text, style = {}, showIcon = false }) => {
  const finalStyle = { ...baseTagStyle, ...style };
  
  return (
    <span style={finalStyle}>
      {showIcon && <TagIcon size={14} strokeWidth={2} />}
      {text.trim()}
    </span>
  );
};

interface TagListProps {
  tags: string[];
  style?: React.CSSProperties;
  tagStyle?: React.CSSProperties;
  showIcons?: boolean;
  inline?: boolean;
}

export const TagList: React.FC<TagListProps> = ({ 
  tags, 
  style = {}, 
  tagStyle = {},
  showIcons = false,
  inline = false
}) => {
  const containerStyle: React.CSSProperties = {
    display: inline ? 'inline-flex' : 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    ...style
  };

  return (
    <div style={containerStyle}>
      {tags.length > 0 ? (
        tags.map((tag) => (
          <Tag 
            key={tag} 
            text={tag} 
            style={tagStyle} 
            showIcon={showIcons} 
          />
        ))
      ) : (
        <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>No tags</span>
      )}
    </div>
  );
};
