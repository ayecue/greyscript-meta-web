import React, { useState } from 'react';

export interface TagsInputPorps {
  availableTags: string[];
  activeTags: string[];
  onChange: (activeTags: string[]) => void;
}

export default function ({ activeTags: initalActiveTags, availableTags, onChange }: TagsInputPorps) {
  const [activeTags, setActiveTags] = useState<string[]>(initalActiveTags);

  const handleChange = (tags: string[]) => {
    const uniqueTags = [...new Set(tags)];
    onChange(uniqueTags);
    setActiveTags(uniqueTags);
  };

  return (
    <div className="tags-input">
      {
        availableTags.map((tag, index) => {
          const isActive = activeTags.includes(tag);
          return (
            <a
              key={index}
              className={`tag ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (isActive) {
                  handleChange(activeTags.filter((t) => t !== tag));
                } else {
                  handleChange([...activeTags, tag]);
                }
              }}
              rel="nofollow"
            >
              {tag}
            </a>
          );
        })
      }
    </div>
  );
}
