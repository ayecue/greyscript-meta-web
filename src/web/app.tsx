import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import GitHubButton from 'react-github-btn';

import { greyscriptMeta, getSiteDescription } from 'greyscript-meta';
import ContentTable from './components/content-table';
import Definitions from './components/definitions';
import { AppExternalLink, ExternalLinks } from './components/external-links';
import { scrollTo } from './utils/scrollTo';

export interface AppProps {
  externalLinks: AppExternalLink[];
  filterInit: string;
  scrollToInit: string;
  onSidebarClick?: Function;
  onCodeRunClick?: (content: string, name: string) => void;
  onCopyClick?: (type: string, methodName: string) => void;
}

export default function ({
  filterInit,
  scrollToInit,
  externalLinks,
  onSidebarClick = () => { },
  onCodeRunClick = () => { },
  onCopyClick = () => { }
}: AppProps) {
  const inputRef = useRef(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [filterInput, setFilterInput] = useState(filterInit);
  const debouncedFilter = useDebouncedCallback(
    (value) => {
      setFilterInput(value);
    },
    100
  );
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
        </div>
        <ContentTable
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
          signatures={signatures}
          filter={filterInput}
          onCodeRunClick={onCodeRunClick}
          onCopyClick={onCopyClick}
        />
      </div>
    </div >
  );
}
