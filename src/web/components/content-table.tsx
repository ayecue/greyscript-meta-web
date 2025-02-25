import React, { useCallback, useState } from 'react';
import { scrollTo } from '../utils/scrollTo';
import { Signature } from 'meta-utils';

export interface ContentTableProps {
  signatures: Signature[];
  filter: string;
  onClick: Function;
  hidden?: boolean;
}

function renderSignatures({ signatures, filter, onClick }: ContentTableProps) {
  const getSortedSignatures = useCallback(() => signatures.sort(), []);

  return (
    <ul className="first">
      {getSortedSignatures().map((item, index) => {
        const pattern = new RegExp(filter, 'i');
        let intrinsics = Object.keys(item.getDefinitions()).sort();

        if (filter !== '') {
          intrinsics = intrinsics.filter((methodName) => {
            return pattern.test(`${item.getType()}.${methodName}`);
          });
        }

        if (!pattern.test(`${item.getType()}`) && intrinsics.length === 0) {
          return;
        }

        return (
          <li key={index}>
            <a
              onClick={(ev) => {
                ev.preventDefault();
                scrollTo(item.getType().toUpperCase());
                window.history.pushState(
                  null,
                  null,
                  `#${item.getType().toUpperCase()}`
                );
                onClick(item.getType());
              }}
              rel="nofollow"
            >
              {item.getType()}
            </a>
            <ul className="second">
              {intrinsics.map((methodName: string, subIndex: number) => {
                const key = `${item.getType().toUpperCase()}_${methodName.toUpperCase()}`;
                return (
                  <li key={subIndex}>
                    <a
                      onClick={(ev) => {
                        ev.preventDefault();
                        scrollTo(key);
                        window.history.pushState(null, null, `#${key}`);
                        onClick(`${item.getType()}.${methodName}`);
                      }}
                      rel="nofollow"
                    >
                      {methodName}
                    </a>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

export default function (props: ContentTableProps) {
  const initHidden = props.hidden || true;
  const [hidden, setHidden] = useState<boolean>(initHidden);

  return (
    <div className="content-table">
      <a
        className={`collapse material-icons ${!hidden ? 'active' : ''}`}
        onClick={() => setHidden(!hidden)}
        rel="nofollow"
      ></a>
      <div className={hidden ? 'hidden' : ''}>{renderSignatures(props)}</div>
    </div>
  );
}
