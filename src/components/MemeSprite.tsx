import React from 'react';
import { memeTemplates } from '@/utils/memeTemplates';

interface MemeSpriteProps {
  templateName: string;
  pixelSize?: number;
  pixelColor?: string;
}

export const MemeSprite: React.FC<MemeSpriteProps> = ({
  templateName,
  pixelSize = 2,
  pixelColor = "#a855f7",
}) => {
  const template = memeTemplates[templateName];
  if (!template) return null;

  const width = template[0].length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: `repeat(7, ${pixelSize}px)`,
        gridTemplateColumns: `repeat(${width}, ${pixelSize}px)`,
        gap: "0px",
      }}
    >
      {template.map((row, rIdx) =>
        row.split("").map((char, cIdx) => {
          const hasColor = char !== " ";
          return (
            <div
              key={`${rIdx}-${cIdx}`}
              style={{
                width: `${pixelSize}px`,
                height: `${pixelSize}px`,
                backgroundColor: hasColor ? pixelColor : "transparent",
              }}
            />
          );
        })
      )}
    </div>
  );
};
