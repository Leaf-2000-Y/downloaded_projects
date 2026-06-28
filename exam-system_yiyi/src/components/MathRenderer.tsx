import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ math, block = false, className = '' }) => {
  // If the whole string is meant to be a single block math equation (not mixed text)
  if (block) {
    try {
      const html = katex.renderToString(math, {
        displayMode: true,
        throwOnError: false,
      });
      return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      return <div className={className}>{math}</div>;
    }
  }

  // Parse mixed inline text and math (delimited by $)
  // e.g. "若分式 $\frac{x^2 - 1}{x+1}$ 的值为 0，则 $x$ 的值是"
  const parts = math.split(/(\$[^\$]+\$)/g);

  return (
    <span className={`inline-wrap ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const rawMath = part.slice(1, -1);
          try {
            const html = katex.renderToString(rawMath, {
              displayMode: false,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className="inline-block mx-0.5"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch (e) {
            console.error('KaTeX inline error:', e);
            return <span key={index} className="text-red-500 font-mono">{rawMath}</span>;
          }
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
