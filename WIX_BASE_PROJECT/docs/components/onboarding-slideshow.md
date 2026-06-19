# OnboardingSlideshow

An animated slideshow shown on the first visit when the user has no items yet. Auto-advances every 3 seconds. Has dot navigation and two call-to-action buttons: "Add My First [Item]" and "Got it" (dismiss).

Persists dismissal to `localStorage` so it only shows once.

---

## File structure

```
OnboardingSlideshow/
  index.tsx
  styles/
    index.ts
```

---

## `styles/index.ts`

```ts
import type { CSSProperties } from "react";

export const styles = {
  container: {
    height: "340px",
    gap: "24px",
  } as CSSProperties,
  textWrapper: {
    maxWidth: "420px",
  } as CSSProperties,
};

export const getIconCircleStyle = (gradient: string): CSSProperties => ({
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  background: gradient,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "background 0.4s ease",
});

export const getDotStyle = (active: boolean): CSSProperties => ({
  width: active ? "20px" : "8px",
  height: "8px",
  borderRadius: "4px",
  background: active ? "#116DFF" : "#D9D9D9",
  cursor: "pointer",
  transition: "all 0.3s ease",
});
```

---

## `index.tsx`

Replace the slide content, icons, gradients, and button labels to match your app. Keep the structure identical.

```tsx
import { type FC, useState, useEffect } from "react";
import { Box, Text, Heading, Button, Card } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { Add } from "@wix/wix-ui-icons-common/classic-editor";
import { styles, getIconCircleStyle, getDotStyle } from "./styles";

// Persist dismissal across sessions
export const ONBOARDING_STORAGE_KEY = "<your-app>_onboarding_done";

// ─── Customise slides for your app ───────────────────────────────────────────
const SLIDES = [
  {
    gradient: "linear-gradient(135deg, #116DFF 0%, #4A90E2 100%)",
    icon: <Icons.Star style={{ color: "#fff", fontSize: "32px" }} />,
    title: "Welcome to [App Name]",
    description: "Short intro about what the app does for the user.",
  },
  {
    gradient: "linear-gradient(135deg, #1EB464 0%, #10B981 100%)",
    icon: <Icons.Add style={{ color: "#fff", fontSize: "32px" }} />,
    title: "Get started in seconds",
    description: "Explain the first action the user should take.",
  },
  {
    gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
    icon: <Icons.Globe style={{ color: "#fff", fontSize: "32px" }} />,
    title: "Always live on your site",
    description: "Explain how changes sync automatically.",
  },
  {
    gradient: "linear-gradient(135deg, #F5A524 0%, #FF6B35 100%)",
    icon: <Icons.PremiumFilled style={{ color: "#fff", fontSize: "32px" }} />,
    title: "Unlock more with Premium",
    description: "Explain the free limit and what upgrading unlocks.",
  },
] as const;
// ─────────────────────────────────────────────────────────────────────────────

interface OnboardingSlideshowProps {
  onDismiss: () => void;
  onGetStarted: () => void;
}

export const OnboardingSlideshow: FC<OnboardingSlideshowProps> = ({
  onDismiss,
  onGetStarted,
}) => {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((i) => (i + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[slideIndex];

  return (
    <Box marginTop="SP5" width="100%">
      <Card stretchVertically>
        <Card.Content>
          <Box
            direction="vertical"
            align="center"
            verticalAlign="middle"
            style={styles.container}
          >
            <div style={getIconCircleStyle(slide.gradient)}>{slide.icon}</div>

            <Box
              direction="vertical"
              align="center"
              gap="SP2"
              style={styles.textWrapper}
            >
              <Heading size="small">{slide.title}</Heading>
              <Text secondary align="center">
                {slide.description}
              </Text>
            </Box>

            {/* Dot navigation */}
            <Box gap="SP2" align="center">
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setSlideIndex(i)}
                  onKeyDown={(e) => e.key === "Enter" && setSlideIndex(i)}
                  style={getDotStyle(i === slideIndex)}
                />
              ))}
            </Box>

            <Box gap="SP3" align="center">
              <Button prefixIcon={<Add />} onClick={onGetStarted}>
                Add My First [Item]
              </Button>
              <Button priority="secondary" onClick={onDismiss}>
                Got it
              </Button>
            </Box>
          </Box>
        </Card.Content>
      </Card>
    </Box>
  );
};
```

---

## Wiring in the dashboard page

```tsx
// In <page-name>.tsx
import { OnboardingSlideshow, ONBOARDING_STORAGE_KEY } from './OnboardingSlideshow';

const [onboardingDismissed, setOnboardingDismissed] = useState(
  () =>
    typeof window !== 'undefined' &&
    localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true',
);

const dismissOnboarding = () => {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  setOnboardingDismissed(true);
};

// In JSX (Tab 0):
{!loading && items.length === 0 && !onboardingDismissed ? (
  <OnboardingSlideshow
    onDismiss={dismissOnboarding}
    onGetStarted={() => {
      dismissOnboarding();
      openAddModal();
    }}
  />
) : (
  <ManageItemsTab ... />
)}
```
