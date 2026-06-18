import type { FC, ReactNode } from 'react';
import type { RatioKind } from '../../constants';

// Tiny schematic of the image's shape for each ratio, drawn as the universal
// photo glyph (sun + mountains) in a frame of that proportion. `original` uses a
// dashed "free" frame to signal the image keeps its own natural ratio.
// `color` fills the photo; `contrast` draws the sun/mountains on top of it.
interface Props {
  kind: RatioKind;
  color: string;
  contrast: string;
}

// A mini photo glyph (rounded rect + sun + mountains) filling the given rect.
const photo = (x: number, y: number, w: number, h: number, c: string, t: string): ReactNode => (
  <>
    <rect x={x} y={y} width={w} height={h} rx={2.5} fill={c} />
    <circle cx={x + w * 0.27} cy={y + h * 0.3} r={Math.min(w, h) * 0.13} fill={t} />
    <path
      d={`M${x + w * 0.08} ${y + h * 0.93} L${x + w * 0.4} ${y + h * 0.52} L${x + w * 0.58} ${y + h * 0.7} L${x + w * 0.78} ${y + h * 0.45} L${x + w * 0.92} ${y + h * 0.93} Z`}
      fill={t}
    />
  </>
);

const shapes = (kind: RatioKind, c: string, t: string): ReactNode => {
  switch (kind) {
    case 'portrait':
      return photo(14, 6, 20, 28, c, t); // tall (≈3:4)
    case 'landscape':
      return photo(8, 9, 32, 22, c, t); // wide (≈4:3)
    case 'original':
      return (
        <>
          <rect
            x={9}
            y={5}
            width={30}
            height={30}
            rx={3}
            fill="none"
            stroke={c}
            strokeWidth={1.5}
            strokeDasharray="3.5 2.5"
          />
          {photo(14, 10, 20, 20, c, t)}
        </>
      );
    case 'square':
    default:
      return photo(11, 7, 26, 26, c, t); // 1:1
  }
};

export const ImageRatioThumb: FC<Props> = ({ kind, color, contrast }) => (
  <svg viewBox="0 0 48 40" width="66%" height="auto" fill="none" aria-hidden="true">
    {shapes(kind, color, contrast)}
  </svg>
);

export default ImageRatioThumb;
