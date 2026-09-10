---
ruleId: UI-4
title: Type and responsive insets come from tokens
---

## [UI-4] Type and responsive insets come from tokens

### Reasoning

Per `STYLING.md`, font sizes come from `<Text variant="...">` and paddings or margins that differ between narrow and wide layouts come from `useLayoutSpacing()`. Writing `shouldUseNarrowLayout ? styles.ph5 : styles.ph8` decides the card inset at the call site, so every card row has to agree by hand and a design change means editing dozens of files. `rulesdir/no-raw-typography` and `rulesdir/no-layout-spacing-conditional` enforce both.

### Incorrect

```tsx
function CardRow() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return (
        <View style={[styles.flexRow, shouldUseNarrowLayout ? styles.ph5 : styles.ph8]}>
            <Text style={{fontSize: 15}}>Title</Text>
        </View>
    );
}
```

### Correct

```tsx
function CardRow() {
    const {cardPaddingHorizontal} = useLayoutSpacing();
    return (
        <View style={[styles.flexRow, cardPaddingHorizontal]}>
            <Text variant="textStrong">Title</Text>
        </View>
    );
}
```

Available from `useLayoutSpacing()`: `cardPadding`, `cardPaddingHorizontal`, `cardPaddingBottom`, `cardPaddingLeft`, `cardMarginHorizontal`, `cardEdgeToEdge`, `pageGutter`, `pageGutterMargin`. Tokens live in `src/styles/layoutSpacing.ts`; add a new one there rather than writing a ternary.

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code picks a `styles.p*`, `styles.ph*`, `styles.pl*`, `styles.pr*`, `styles.m*`, `styles.mh*` or `styles.mhn*` helper with `shouldUseNarrowLayout`, `isSmallScreenWidth` or another layout flag, or sets a raw `fontSize` / `lineHeight`
- A matching token exists (`cardPadding*`, `pageGutter*`, or a `Text` variant)

**DO NOT flag if:**

- The conditional picks vertical rhythm only (`pt`, `pb`, `pv`, `mt`, `mb`, `mv`, `gap`)
- The values are not a card inset or page gutter and no token exists yet (suggest adding one instead)
- The code is inside `src/styles/`

**Search Patterns** (hints for reviewers):
- `shouldUseNarrowLayout ? styles.p`
- `shouldUseNarrowLayout ? styles.m`
- `isSmallScreenWidth ? styles.p`
- `fontSize:`
