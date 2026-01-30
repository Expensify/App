# victory-native patches

## 001+fix-rotated-label-bounds-check

**Problem:** Victory Native's XAxis component calculates label bounds using the unrotated text width, even when `labelRotate` is specified. This causes labels near the chart edges to be incorrectly hidden when rotated.

For example, at 90° rotation:
- Actual horizontal extent = font height (~14px)
- Victory's bounds check uses = text width (could be 50-100px+)

This results in labels being hidden even though they would visually fit.

**Fix:** Calculate the actual horizontal extent of rotated labels using the formula:
```
rotatedWidth = textWidth * |cos(angle)| + fontSize * |sin(angle)|
```

Use this `rotatedLabelWidth` for the bounds check (`canFitLabelContent`) while preserving the original `labelWidth` for positioning and rotation origin calculations.

## 002+add-label-overflow-prop

**Problem:** Victory Native's XAxis component applies a `canFitLabelContent` bounds check that hides labels near chart edges. When consumers already control label visibility via `formatXLabel` (returning `''` for skipped labels), this creates double-filtering — labels are hidden both by the consumer's skip logic and by Victory's bounds check. This causes non-uniform gaps and missing end labels.

**Fix:** Add a `labelOverflow` prop to `XAxisInputProps`:
- `"hidden"` (default) — current behavior, bounds check active
- `"visible"` — skip the `canFitLabelContent` check, render all labels with non-empty text

When `labelOverflow` is `"visible"`, the rendering condition changes from:
```typescript
font && labelWidth && canFitLabelContent
```
to:
```typescript
font && labelWidth && (labelOverflow === "visible" || canFitLabelContent)
```

Labels with empty text (`formatXLabel` returning `''`) still get hidden naturally because `labelWidth` evaluates to `0` (falsy). This means the consumer's skip logic remains the sole visibility filter, eliminating double-filtering.
