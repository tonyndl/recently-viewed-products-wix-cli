import type { CSSProperties, FC, MouseEvent } from "react";
import type { RecentlyViewedItem } from "../../types";
import type { HoverEffect, RatioKind, TextPosition } from "../../constants";
import { styles } from "./styles/productCard";

interface ProductCardProps {
  item: RecentlyViewedItem;
  ratio: RatioKind;
  showTitle: boolean;
  showPrice: boolean;
  textPosition: TextPosition;
  cornerRadius: number;
  imageBorder: boolean;
  hoverEffect: HoverEffect;
  textSize: number;
  textColor: string; // '' = default colors
  onNavigate?: (item: RecentlyViewedItem) => void;
}

// Every ratio maps to a FIXED aspect ratio so image boxes are uniform height in
// every layout. "original" falls back to square rather than the image's natural
// (variable) height, which produced ragged rows in the Strip layout.
const RATIO: Record<RatioKind, string> = {
  square: "1 / 1",
  portrait: "3 / 4",
  landscape: "4 / 3",
  original: "1 / 1",
};

const HOVER_CLASS: Record<HoverEffect, string | undefined> = {
  none: undefined,
  zoom: "rv-hover-zoom",
  fade: "rv-hover-fade",
};

export const ProductCard: FC<ProductCardProps> = ({
  item,
  ratio,
  showTitle,
  showPrice,
  textPosition,
  cornerRadius,
  imageBorder,
  hoverEffect,
  textSize,
  textColor,
  onNavigate,
}) => {
  const onImage = textPosition === "onimage";
  const above = textPosition === "top";
  const hasPrice = showPrice && !!item.formattedPrice;

  // Apply the Text settings to the name/price (below/above). The on-image
  // overlay keeps its light text for contrast against the gradient.
  const nameStyle: CSSProperties = {
    ...styles.name,
    fontSize: `${textSize}px`,
    ...(textColor ? { color: textColor } : {}),
  };
  const priceStyle: CSSProperties = {
    ...styles.price,
    fontSize: `${Math.max(10, textSize - 1)}px`,
    ...(textColor ? { color: textColor } : {}),
  };

  const captions = (
    <>
      {showTitle && <p style={nameStyle}>{item.name}</p>}
      {hasPrice && <p style={priceStyle}>{item.formattedPrice}</p>}
    </>
  );

  const imageWrapStyle: CSSProperties = {
    ...styles.imageWrap,
    borderRadius: `${cornerRadius}px`,
    ...(imageBorder ? { border: "1px solid #e3e3e3" } : {}),
    aspectRatio: RATIO[ratio],
  };
  const imageStyle: CSSProperties = {
    ...styles.image,
    height: "100%",
    objectFit: "cover", // images always crop to fill
  };

  // Navigate through Wix's router (onNavigate → location.to) rather than a raw
  // href: in the editor preview a relative href resolves against the
  // static.parastorage.com origin and 403s ("AccessDenied"). We still set href
  // for accessibility / right-click, but intercept the click.
  const linkHref =
    item.productUrl && /^(https?:\/\/|\/)/.test(item.productUrl)
      ? item.productUrl
      : undefined;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate(item);
  };

  return (
    <a
      href={linkHref}
      onClick={handleClick}
      style={styles.card}
      className={HOVER_CLASS[hoverEffect]}
      aria-label={item.name}
    >
      {above && <div style={styles.aboveText}>{captions}</div>}

      <div style={imageWrapStyle} data-rv-image="">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            style={imageStyle}
            loading="lazy"
          />
        ) : null}

        {onImage && (showTitle || hasPrice) && (
          <div style={styles.overlay}>
            {showTitle && <p style={styles.overlayName}>{item.name}</p>}
            {hasPrice && (
              <p style={styles.overlayPrice}>{item.formattedPrice}</p>
            )}
          </div>
        )}
      </div>

      {!onImage && !above && captions}
    </a>
  );
};
