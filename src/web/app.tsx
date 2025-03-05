import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import GitHubButton from 'react-github-btn';

import { greyscriptMeta, getSiteDescription } from 'greyscript-meta';
import ContentTable from './components/content-table';
import Definitions from './components/definitions';
import { AppExternalLink, ExternalLinks } from './components/external-links';
import { scrollTo } from './utils/scrollTo';
import TagsInput from './components/tags-input';

export interface AppProps {
  defaultTags: string[];
  externalLinks: AppExternalLink[];
  filterInit: string;
  scrollToInit: string;
  onSidebarClick?: Function;
  onTagsChange?: (tags: string[]) => void;
  onCodeRunClick?: (content: string, name: string) => void;
  onCopyClick?: (type: string, methodName: string) => void;
}

export default function ({
  defaultTags,
  filterInit,
  scrollToInit,
  externalLinks,
  onSidebarClick = () => { },
  onTagsChange = () => { },
  onCodeRunClick = () => { },
  onCopyClick = () => { }
}: AppProps) {
  const inputRef = useRef(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [filterInput, setFilterInput] = useState(filterInit);
  const debouncedFilter = useDebouncedCallback(
    (value) => {
      setFilterInput(value);
    },
    100
  );
  const getAvailableTags = useCallback(() => greyscriptMeta.getAvailableTags(), []);
  const getSignatures = useCallback(() => greyscriptMeta.getAllSignatures()
    .filter((it) => it.getType() !== 'any')
    .sort((a, b) => a.getType().localeCompare(b.getType())), []);
  const signatures = getSignatures();

  useEffect(() => {
    if (rootRef !== null) {
      scrollTo(scrollToInit, 'instant' as ScrollBehavior);
    }
  }, [rootRef]);

  return (
    <div ref={rootRef}>
      <div className="navigation">
        <div className="search">
          <input
            className="search-input"
            ref={inputRef}
            type="text"
            onChange={(ev) => debouncedFilter(ev.target.value)}
            aria-label="Search"
          />
          {filterInput.length > 0 ? (
            <span
              className="clear material-icons"
              onClick={(e) => {
                inputRef.current.value = '';
                debouncedFilter('')
              }}
            ></span>
          ) : null}
          <TagsInput
            availableTags={getAvailableTags()}
            activeTags={defaultTags}
            onChange={(excludedTags) => {
              setTags(excludedTags);
              onTagsChange(excludedTags);
            }}
          />
        </div>
        <ContentTable
          excludedTags={tags}
          signatures={signatures}
          filter={filterInput}
          onClick={onSidebarClick}
        />
      </div>
      <div className="content-wrapper">
        <div className="readme">
          <div className="intro">
            <h1>{getSiteDescription('WELCOME_TITLE')}</h1>
            <article
              dangerouslySetInnerHTML={{
                __html: getSiteDescription('WELCOME_TEXT')
              }}
            ></article>
          </div>
          <div className="github-button">
            <GitHubButton href="https://github.com/ayecue/greyscript-meta" data-color-scheme="no-preference: dark; light: light; dark: dark;" data-icon="octicon-star" data-size="large" aria-label="Star ayecue/greyscript-meta on GitHub">Star</GitHubButton>
          </div>
          <ExternalLinks className='external-links-wrapper' externalLinks={externalLinks} />
        </div>
        <Definitions
          excludedTags={tags}
          signatures={signatures}
          filter={filterInput}
          onCodeRunClick={onCodeRunClick}
          onCopyClick={onCopyClick}
        />
      </div>
    </div >
  );
}
