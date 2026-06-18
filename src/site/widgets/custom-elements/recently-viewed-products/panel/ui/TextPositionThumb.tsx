import type { FC, ReactNode } from 'react';
import type { TextPosition } from '../../constants';

// Tiny schematic of where the product text sits relative to the image — title +
// price bars drawn above / below / over an image rectangle. `color` fills the
// image + external text; `contrast` is used for text drawn ON the image so it
// stays legible against the filled image block.
interface Props {
  kind: TextPosition;
  color: string;
  contrast: string;
}

const R = (x: number, y: number, w: number, h: number, fill: string, key: number) => (
  <rect key={key} x={x} y={y} width={w} height={h} rx={1.5} fill={fill} />
);

const shapes = (kind: TextPosition, c: string, t: string): ReactNode => {
  switch (kind) {
    case 'top':
      return [R(11, 4, 26, 4, c, 1), R(11, 10.5, 15, 2.5, c, 2), R(11, 16, 26, 20, c, 3)];
    case 'below':
      return [R(11, 4, 26, 20, c, 1), R(11, 28, 26, 4, c, 2), R(11, 34.5, 15, 2.5, c, 3)];
    case 'onimage':
      return [R(11, 4, 26, 32, c, 1), R(14, 27, 20, 3.5, t, 2), R(14, 32.5, 12, 2.5, t, 3)];
    default:
      return null;
  }
};

export const TextPositionThumb: FC<Props> = ({ kind, color, contrast }) => (
  <svg viewBox="0 0 48 40" width="60%" height="auto" fill="none" aria-hidden="true">
    {shapes(kind, color, contrast)}
  </svg>
);

export default TextPositionThumb;
