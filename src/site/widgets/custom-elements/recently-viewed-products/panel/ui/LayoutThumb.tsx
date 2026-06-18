import type { FC } from 'react';
import type { LayoutKind } from '../../constants';

// Tiny schematic preview of each Pro Gallery layout, drawn to mirror the native
// Wix layout picker. Shapes are filled with `color` (muted on a light card,
// white when the card is selected). Arrows hint at navigable layouts.
interface Props {
  kind: LayoutKind;
  color: string;
}

const R = (
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  key: number | string,
) => <rect key={key} x={x} y={y} width={w} height={h} rx={2} fill={color} />;

const chevron = (d: string, color: string, key: string) => (
  <path
    key={key}
    d={d}
    stroke={color}
    strokeWidth={2}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

const shapes = (kind: LayoutKind, c: string): React.ReactNode => {
  switch (kind) {
    case 'grid':
      return [R(4, 4, 18, 12, c, 1), R(26, 4, 18, 12, c, 2), R(4, 20, 18, 12, c, 3), R(26, 20, 18, 12, c, 4)];
    case 'collage':
      return [R(4, 4, 26, 14, c, 1), R(34, 4, 10, 14, c, 2), R(4, 22, 12, 10, c, 3), R(20, 22, 24, 10, c, 4)];
    case 'masonry':
      return [
        R(4, 4, 11, 13, c, 1), R(4, 20, 11, 12, c, 2),
        R(18, 4, 11, 20, c, 3), R(18, 27, 11, 5, c, 4),
        R(32, 4, 11, 9, c, 5), R(32, 16, 11, 16, c, 6),
      ];
    case 'thumbnails':
      return [
        R(4, 4, 40, 17, c, 1),
        R(6, 24, 8, 8, c, 2), R(16, 24, 8, 8, c, 3), R(26, 24, 8, 8, c, 4), R(36, 24, 8, 8, c, 5),
      ];
    case 'slider':
      return [
        chevron('M7 12 L3 18 L7 24', c, 'l'),
        R(11, 7, 12, 22, c, 1), R(25, 7, 12, 22, c, 2),
        chevron('M41 12 L45 18 L41 24', c, 'r'),
      ];
    case 'slideshow':
      return [
        chevron('M7 12 L3 18 L7 24', c, 'l'),
        R(11, 6, 26, 24, c, 1),
        chevron('M41 12 L45 18 L41 24', c, 'r'),
      ];
    case 'strip':
      return [R(4, 7, 40, 6, c, 1), R(4, 16, 40, 6, c, 2), R(4, 25, 40, 6, c, 3)];
    case 'column':
      return [R(7, 4, 8, 28, c, 1), R(20, 4, 8, 28, c, 2), R(33, 4, 8, 28, c, 3)];
    case 'bricks':
      return [R(4, 4, 24, 12, c, 1), R(32, 4, 12, 12, c, 2), R(4, 20, 12, 12, c, 3), R(20, 20, 24, 12, c, 4)];
    case 'mix':
      return [
        R(4, 4, 18, 12, c, 1), R(26, 4, 18, 12, c, 2),
        R(4, 20, 11, 12, c, 3), R(19, 20, 11, 12, c, 4), R(34, 20, 10, 12, c, 5),
      ];
    case 'alternate':
      return [R(4, 4, 26, 12, c, 1), R(34, 4, 10, 12, c, 2), R(4, 20, 10, 12, c, 3), R(18, 20, 26, 12, c, 4)];
    default:
      return null;
  }
};

export const LayoutThumb: FC<Props> = ({ kind, color }) => (
  <svg viewBox="0 0 48 36" width="72%" height="auto" fill="none" aria-hidden="true">
    {shapes(kind, color)}
  </svg>
);

export default LayoutThumb;
