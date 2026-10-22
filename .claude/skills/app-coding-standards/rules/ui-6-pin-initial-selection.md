---
ruleId: UI-6
title: Searchable selection lists show the pre-selected item at the top
---

## [UI-6] Searchable selection lists show the pre-selected item at the top

### Reasoning

A searchable picker focuses its search input on open, so on mobile the keyboard covers most of the list. If the saved choice stays in its natural (alphabetical) position, it is often hidden below the fold, and people search for something that is already selected. Snapshot the selection when the list opens and move it to the top of the full list before filtering, so it stays visible and a later tap on it does not reorder the list for a frame.

### Incorrect

```tsx
// The selected row stays wherever it falls alphabetically; on a long list it is hidden under the keyboard.
<SelectionList
    data={filteredOptions}
    textInputOptions={textInputOptions}
    initiallyFocusedItemKey={selectedValue}
/>
```

### Correct

```tsx
// Freeze the selection on open so later taps don't reorder the list, then pin it to the top before filtering.
const initialSelectedValue = useInitialValue(() => selectedValue);
const orderedOptions = moveInitialSelectionToTop(options, initialSelectedValue ? [initialSelectedValue] : []);
const data = filterBySearch(orderedOptions, searchValue);
```

`moveInitialSelectionToTop` no-ops for lists below `CONST.STANDARD_LIST_ITEM_LIMIT`, so short lists keep their natural order. Pages built on `SelectionScreen` get this for free from `useSelectionListSearch`, which pins the frozen selection and exposes `pinnedValues`.

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code adds or changes a `SelectionList` / `SelectionScreen` that shows a search input (`textInputOptions` or `shouldShowTextInput`)
- An item can be pre-selected when the list opens (`isSelected`, `initiallyFocusedItemKey`, or `initiallyFocusedOptionKey` comes from a saved value)
- The list is not ordered with `moveInitialSelectionToTop`, `useSelectionListSearch`, a leading selected section, or an equivalent selected-first sort

**DO NOT flag if:**

- The list always has fewer than `CONST.STANDARD_LIST_ITEM_LIMIT` (12) items
- Nothing is pre-selected on open (for example, the focus key only sets keyboard focus in a create flow)
- The saved value seeds the search text instead of marking a row (for example, a search-as-you-type picker)
- The list has a fixed natural order that design asked to keep (for example, months)
- The code is a test, story, or debug-only page

**Search Patterns** (hints for reviewers):
- `initiallyFocusedItemKey=` / `initiallyFocusedOptionKey=` next to `textInputOptions=`
- `isSelected:` in a list built for a searchable `SelectionList`
- `tokenizedSearch(` run on a list before any selected-first ordering
