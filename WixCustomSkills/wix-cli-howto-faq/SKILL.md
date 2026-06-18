---
name: wix-cli-howto-faq
description: "Add an Interactive Guide iframe and collapsible FAQ accordion to the How to Use tab of a Wix CLI dashboard page. Use when the user wants to add a GuideJar embed, FAQ section, interactive guide, or collapsible questions to an existing dashboard How to Use tab."
---

# Add Interactive Guide & FAQ to How to Use Tab

Adds two new Card sections to the **existing** "How to Use" tab in a Wix CLI dashboard page: an embedded interactive guide (iframe) and a collapsible FAQ accordion.

## Prerequisites

The user MUST provide:
1. **GuideJar embed URL** — the `src` for the iframe
2. **FAQ content** — questions and answers specific to the app (or ask the agent to generate them based on the app's features)

## Implementation Steps

### Step 1: Add `Accordion` to WDS imports

In the dashboard page file (usually `src/dashboard/pages/page.tsx`), add `Accordion` to the `@wix/design-system` import if not already present.

### Step 2: Insert cards BEFORE the existing "How to Use" content

Find the How to Use tab section (look for `howToUse` in the tab/dashboardTab condition). Insert two new `<Cell span={12}>` blocks **before** the existing steps card.

#### Card 1: Interactive Guide (iframe)

```jsx
<Cell span={12}>
  <Card>
    <Card.Header title={t("guide.title")} subtitle={t("guide.subtitle")} />
    <Card.Divider />
    <Card.Content>
      <div style={{ position: 'relative', height: 0, width: '100%', overflow: 'hidden', zIndex: 0, borderRadius: '6px', boxSizing: 'border-box', paddingBottom: 'calc(54.06666667% + 32px)' }}>
        <iframe
          src="GUIDEJAR_EMBED_URL_HERE"
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0 }}
          allowFullScreen
          frameBorder="0"
        />
      </div>
    </Card.Content>
  </Card>
</Cell>
```

**CRITICAL**: Use `zIndex: 0`, never `99999` — high z-index covers the dashboard sticky header.

#### Card 2: FAQ Accordion

```jsx
<Cell span={12}>
  <Card>
    <Card.Header title={t("faq.title")} />
    <Card.Divider />
    <Card.Content>
      <Accordion
        multiple
        size="small"
        items={Array.from({ length: N }, (_, i) => ({
          title: t(`faq.q${i + 1}`),
          children: <Text size="small" secondary>{t(`faq.a${i + 1}`)}</Text>,
        }))}
      />
    </Card.Content>
  </Card>
</Cell>
```

Replace `N` with the number of FAQ items.

### Step 3: Add translation keys to ALL locale files

Add these keys to every JSON file in `src/intl/messages/`:

```
guide.title    — "Interactive Guide" (translated)
guide.subtitle — "Follow along step by step" (translated)
faq.title      — "Frequently Asked Questions" (translated)
faq.q1 – faq.qN — Question text (translated)
faq.a1 – faq.aN — Answer text (translated)
```

#### Translation reference table

| Key | en | da | de | es | fr | he |
|-----|----|----|----|----|----|----|
| guide.title | Interactive Guide | Interaktiv guide | Interaktive Anleitung | Guía interactiva | Guide interactif | מדריך אינטראקטיבי |
| guide.subtitle | Follow along step by step | Følg med trin for trin | Schritt für Schritt folgen | Sigue el proceso paso a paso | Suivez les étapes une par une | עקוב צעד אחר צעד |
| faq.title | Frequently Asked Questions | Ofte stillede spørgsmål | Häufig gestellte Fragen | Preguntas frecuentes | Questions fréquemment posées | שאלות נפוצות |

| Key | it | ja | ko | nl | pl | pt |
|-----|----|----|----|----|----|----|
| guide.title | Guida interattiva | インタラクティブガイド | 인터랙티브 가이드 | Interactieve gids | Interaktywny przewodnik | Guia interativo |
| guide.subtitle | Segui passo dopo passo | ステップごとに進めましょう | 단계별로 따라하세요 | Volg stap voor stap | Śledź krok po kroku | Acompanhe passo a passo |
| faq.title | Domande frequenti | よくある質問 | 자주 묻는 질문 | Veelgestelde vragen | Często zadawane pytania | Perguntas frequentes |

| Key | ru | th | tr | uk | zh |
|-----|----|----|----|----|-----|
| guide.title | Интерактивное руководство | คู่มือแบบอินเทอร์แอคทีฟ | Etkileşimli Kılavuz | Інтерактивний посібник | 互动指南 |
| guide.subtitle | Следуйте шаг за шагом | ทำตามทีละขั้นตอน | Adım adım takip edin | Слідкуйте крок за кроком | 一步步跟着操作 |
| faq.title | Часто задаваемые вопросы | คำถามที่พบบ่อย | Sıkça Sorulan Sorular | Часті запитання | 常见问题 |

FAQ questions and answers (`faq.q1`–`faq.qN`, `faq.a1`–`faq.aN`) must be translated to all 17 locales. Write them specific to the app's actual features.

### Step 4: Validate JSON

After editing all locale files, verify they parse correctly:

```bash
for f in src/intl/messages/*.json; do python3 -c "import json; json.load(open('$f'))" 2>&1 && echo "$f: OK" || echo "$f: FAILED"; done
```

## Critical Rules

1. **zh.json quoting**: Never use Chinese curly quotes `\u201c...\u201d` inside JSON string values — they break the JSON parser. Use corner brackets `「...」` instead.
2. **z-index**: Always `0` on the iframe wrapper, never `99999`.
3. **FAQ accuracy**: Questions and answers must reflect the app's real features. Read the dashboard page code to understand what the app does before writing FAQ content. Don't use generic filler.
4. **All locales**: The app supports 17 locales (da, de, en, es, fr, he, it, ja, ko, nl, pl, pt, ru, th, tr, uk, zh). Every key must exist in every file.
5. **Use `t()` for all strings**: Never hardcode text in JSX. Always use translation keys via `t()`.
