import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';

import { scrollTo } from '../utils/scrollTo';
import Editor from './editor';
import { HighlightInline } from './highlight';
import { Signature, SignatureDefinition, SignatureDefinitionFunction, SignatureDefinitionFunctionArg, SignatureDefinitionBaseType, Variation } from 'meta-utils';
import { getSiteDescription } from 'greyscript-meta';

export interface DefinitionsProps {
  signatures: Signature[];
  filter: string;
  onCodeRunClick: (content: string, name: string) => void;
  onCopyClick: (type: string, methodName: string) => void;
}

function renderArgumentLabel(arg: SignatureDefinitionFunctionArg) {
  return (
    <span className="label">
      {arg.getLabel()}
      {arg.isOptional() ? '?' : ''}
    </span>
  );
}

function renderArgumentDefault(arg: SignatureDefinitionFunctionArg) {
  const defaultDef = arg.getDefault();

  if (defaultDef === null) return;

  const argDefaultType = defaultDef.type;
  const argDefaultValue = defaultDef.type === SignatureDefinitionBaseType.String ? `"${defaultDef.value}"` : defaultDef.value;

  return (
    <span className="default">
      {' '}
      = <span className={argDefaultType}>{argDefaultValue}</span>
    </span>
  );
}

function renderArguments(args: SignatureDefinitionFunctionArg[] = []) {
  if (args.length === 0) return;

  return (
    <div className="args">
      {args.map((item: SignatureDefinitionFunctionArg, index: number) => {
        const argTypes = item.getTypes().map((item) => item.toString());

        return (
          <span key={index} className="arg">
            {renderArgumentLabel(item)}:{' '}
            {argTypes.map((typeItem: string, index: number) => {
              return (
                <span key={index}>
                  <span className="type">
                    {typeItem}
                  </span>
                  {index < argTypes.length - 1 ? (
                    <span className="or">
                      {getSiteDescription('DEFINITIONS_OR')}
                    </span>
                  ) : (
                    ''
                  )}
                </span>
              );
            })}
            {renderArgumentDefault(item)}
            {index < args.length - 1 ? ', ' : ''}
          </span>
        );
      })}
    </div>
  );
}

function renderReturn(returns: string[]) {
  return (
    <div className="returns">
      <p>
        {returns.map((item: string, index: number) => {
          return (
            <span key={index}>
              <span className="type">
                {item}
              </span>
              {index < returns.length - 1 ? (
                <span className="or">
                  {getSiteDescription('DEFINITIONS_OR')}
                </span>
              ) : (
                ''
              )}
            </span>
          );
        })}
      </p>
    </div>
  );
}

function renderDescription(description: string) {
  return (
    <p>
      <ReactMarkdown
        components={{
          code(props) {
            return <HighlightInline>{props.children}</HighlightInline>;
          },
          a(props) {
            const href = props.href;

            if (href && href.indexOf('#') !== -1) {
              const item = href.slice(href.indexOf('#') + 1);
              return (
                <a
                  href={props.href}
                  onClick={(ev) => {
                    ev.preventDefault();
                    scrollTo(item);
                    window.history.pushState(null, null, `#${item}`);
                  }}
                  rel="nofollow"
                >
                  {props.children}
                </a>
              );
            }

            return <a href={props.href}>{props.children}</a>;
          }
        }}
      >
        {description}
      </ReactMarkdown>
    </p>
  );
}

function renderReturnVariations(variations: Variation[]) {
  if (variations.length === 0) {
    return null;
  }

  return <span className="variations">
    <a className="info material-icons" title="Variation of static return values" rel="nofollow"></a>
    <span className="variations-wrapper">
      {variations.map((variation, index) => {
        if (typeof variation === 'string') {
          return <span className="variation string" key={index}>"{variation}"</span>;
        }
        return <span className="variation number" key={index}>{variation}</span>;
      })}
    </span>
  </span>;
}

interface DefinitionBodyProps {
  description: string;
  example: string[];
  key: string;
  onCodeRunClick: DefinitionsProps['onCodeRunClick'];
}

function DefinitionBody({
  description,
  example,
  key,
  onCodeRunClick
}: DefinitionBodyProps) {
  return (
    <>
      <div className="description">{renderDescription(description)}</div>
      {example ? (
        <div className="example">
          <Editor
            content={example.join('\n')}
            name={key}
            onClick={onCodeRunClick}
          />
        </div>
      ) : null}
    </>
  );
}

interface DefinitionProps {
  type: string;
  methodName: string;
  definition: SignatureDefinition;
  onCodeRunClick: DefinitionsProps['onCodeRunClick'];
  onCopyClick: DefinitionsProps['onCopyClick'];
}

function Definition({
  type,
  methodName,
  definition,
  onCodeRunClick,
  onCopyClick
}: DefinitionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const description = definition.getDescription();
  const example = definition.getExample();
  const key = `${type.toUpperCase()}_${methodName.toUpperCase()}`;
  let args: SignatureDefinitionFunctionArg[] = [];
  let returnTypes: string[] = [];
  let returnVariations: Variation[] = [];

  if (definition.getType().type === SignatureDefinitionBaseType.Function) {
    const fnDef = definition as SignatureDefinitionFunction;

    args = fnDef.getArguments();
    returnTypes = fnDef.getReturns().map((item) => item.toString());
    returnVariations = fnDef.getReturnVariations();
  }

  return (
    <article className="definition" ref={containerRef}>
      <h3 id={key}>
        <span className="name">{methodName}</span>
        <span className="signature">
          ({renderArguments(args)}):{' '}
          {renderReturn(returnTypes)}
        </span>
        {renderReturnVariations(returnVariations)}
      </h3>
      <a
        className="share"
        onClick={() => onCopyClick(type, methodName)}
        title="Copy link"
        rel="nofollow"
      >
        {getSiteDescription('DEFINITIONS_COPY')}
      </a>
      <DefinitionBody
        description={description}
        example={example}
        key={key}
        onCodeRunClick={onCodeRunClick}
      />
    </article>
  );
}

function renderDefinitions({
  signatures,
  filter,
  onCodeRunClick,
  onCopyClick
}: DefinitionsProps) {
  const pattern = filter ? new RegExp(filter, 'i') : null;
  const items = signatures.map((item, index) => {
    let visibleItems = 0;
    const containerRef = useRef<HTMLLIElement>(null);
    const definitions = item.getDefinitions();
    const intrinsicKeys = Object.keys(definitions).sort();
    const items = intrinsicKeys.map((methodName: string, subIndex: number) => {
      const definition = item.getDefinition(methodName);
      const isHidden = pattern && !pattern.test(`${item.getType()}.${methodName}`);

      if (!isHidden) {
        visibleItems++;
      }

      return (
        <li key={subIndex} className={isHidden ? 'hidden' : ''}>
          <Definition
            type={item.getType()}
            methodName={methodName}
            definition={definition}
            onCodeRunClick={onCodeRunClick}
            onCopyClick={onCopyClick}
          />
        </li>
      );
    });
    const $meta = item.getDescriptions()['$meta'];
    const metaDescription = $meta.description;
    const metaExample = $meta.example;
    const isHidden = pattern && !pattern.test(`${item.getType()}`);

    if (!isHidden) {
      visibleItems++;
    }

    return (
      <li
        className={visibleItems === 0 ? 'hidden' : ''}
        key={index}
        ref={containerRef}
      >
        <h2 id={item.getType().toUpperCase()}>{item.getType()}</h2>
        {metaDescription ? renderDescription(metaDescription) : null}
        {metaExample ? (
          <Editor
            content={metaExample.join('\n')}
            name={item.getType().toUpperCase()}
            onClick={onCodeRunClick}
          />
        ) : null}
        {items.length > 0 ? <ul className="second">{items}</ul> : null}
      </li>
    );
  });

  return <ul className="first">{items}</ul>;
}

export default function (props: DefinitionsProps) {
  return <div className="definitions">{renderDefinitions(props)}</div>;
}
