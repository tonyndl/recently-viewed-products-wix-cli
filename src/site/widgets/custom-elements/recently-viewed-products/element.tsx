import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import RecentlyViewedWidget from "./widget/index";
import type { WidgetProps } from "./types";
import {
  PROP,
  DEFAULTS,
  LAYOUT_KINDS,
  type LayoutKind,
  type RatioKind,
  type TextPosition,
  type HoverEffect,
  type TextAlign,
} from "./constants";

const oneOf = <T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T,
): T =>
  value != null && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;

// The Wix Astro runtime expects the custom-element `element` file to default
// export a CustomElementConstructor. We mount the React widget into the
// element's light DOM and re-render whenever a panel-controlled prop changes.
class RecentlyViewedElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return Object.values(PROP);
  }

  private root: Root | null = null;

  connectedCallback(): void {
    if (!this.root) this.root = createRoot(this);
    this.render();
  }

  disconnectedCallback(): void {
    this.root?.unmount();
    this.root = null;
  }

  attributeChangedCallback(): void {
    if (this.root) this.render();
  }

  private bool(name: string, fallback: boolean): boolean {
    const v = this.getAttribute(name);
    return v != null ? v === "true" : fallback;
  }

  private num(name: string, fallback: number): number {
    const v = this.getAttribute(name);
    const n = v != null ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  }

  private parseProps(): WidgetProps {
    return {
      layout: oneOf<LayoutKind>(
        this.getAttribute(PROP.layout),
        LAYOUT_KINDS,
        DEFAULTS.layout,
      ),
      columns: this.num(PROP.columns, DEFAULTS.columns),
      spacing: this.num(PROP.spacing, DEFAULTS.spacing),
      ratio: oneOf<RatioKind>(
        this.getAttribute(PROP.ratio),
        ["square", "portrait", "landscape", "original"],
        DEFAULTS.ratio,
      ),
      showTitle: this.bool(PROP.showTitle, DEFAULTS.showTitle),
      showPrice: this.bool(PROP.showPrice, DEFAULTS.showPrice),
      textPosition: oneOf<TextPosition>(
        this.getAttribute(PROP.textPosition),
        ["below", "top", "onimage"],
        DEFAULTS.textPosition,
      ),
      cornerRadius: this.num(PROP.cornerRadius, DEFAULTS.cornerRadius),
      imageBorder: this.bool(PROP.imageBorder, DEFAULTS.imageBorder),
      hoverEffect: oneOf<HoverEffect>(
        this.getAttribute(PROP.hoverEffect),
        ["none", "zoom", "fade"],
        DEFAULTS.hoverEffect,
      ),
      bgColor: this.getAttribute(PROP.bgColor) ?? DEFAULTS.bgColor,
      emptyText: this.getAttribute(PROP.emptyText) ?? DEFAULTS.emptyText,
      isPremium: this.getAttribute(PROP.isPremium) === "true",
      headingText: this.getAttribute(PROP.headingText) ?? DEFAULTS.headingText,
      headingShow: this.bool(PROP.headingShow, DEFAULTS.headingShow),
      headingSize: this.num(PROP.headingSize, DEFAULTS.headingSize),
      headingColor:
        this.getAttribute(PROP.headingColor) ?? DEFAULTS.headingColor,
      headingAlign: oneOf<TextAlign>(
        this.getAttribute(PROP.headingAlign),
        ["left", "center", "right"],
        DEFAULTS.headingAlign,
      ),
      textSize: this.num(PROP.textSize, DEFAULTS.textSize),
      textColor: this.getAttribute(PROP.textColor) ?? DEFAULTS.textColor,
    };
  }

  private render(): void {
    this.root?.render(createElement(RecentlyViewedWidget, this.parseProps()));
  }
}

export default RecentlyViewedElement;
