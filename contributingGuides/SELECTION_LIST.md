# SelectionList components

This doc explains when and how to use the `SelectionList` and `SelectionListWithSections` components in New Expensify.

## Overview


There are two main components:

- [**`SelectionList`**](../src/components/SelectionList/BaseSelectionList.tsx) - For displaying a single array of data (no sections)
- [**`SelectionListWithSections`**](../src/components/SelectionList/SelectionListWithSections/BaseSelectionListWithSections.tsx) - For displaying data organized into multiple sections

## When to Use Each Component

### Use `SelectionList` when:

- Your data is a **single flat array** of items
- You don't need to group items into sections with headers
- You want a simpler, more performant solution for flat lists
- Your data structure looks like: `[{item1}, {item2}, {item3}]`


### Use `SelectionListWithSections` when:

- Your data is organized into **multiple sections** with headers
- You need to group related items together (e.g., "Recent", "All Contacts", "Groups")
- Your data structure looks like:
  ```typescript
  [
    { title: 'Section 1', data: [{item1}, {item2}] },
    { title: 'Section 2', data: [{item3}, {item4}] }
  ]
  ```

## Basic Usage Examples

### Example 1: Simple SelectionList

```tsx
<SelectionList
    data={options}
    ListItem={SingleSelectListItem}
    onSelectRow={(item) => {
        setSelectedOption(item.keyForList);
        Navigation.goBack();
    }}
    shouldShowTextInput
    textInputOptions={{
        label: "Search items",
        value: searchText,
        onChangeText: setSearchText,
        headerMessage
    }}
/>
```

### Example 2: SelectionListWithSections

```tsx
<SelectionListWithSections
    sections={[
        { title: 'Recent', data: recentContacts, sectionIndex: 0 },
        { title: 'All Contacts', data: allContacts, sectionIndex: 1 },
    ]}
    ListItem={UserListItem}
    onSelectRow={handleSelectContact}
    shouldShowTextInput
    textInputOptions={{
        label: "Search items",
        value: searchText,
        onChangeText: setSearchText,
        headerMessage
    }}
/>
```

## Pinning the pre-selected item

A searchable list focuses its search input on open, so on mobile the keyboard covers most of the list. When the list can have a pre-selected item, pin that item to the top so it stays visible instead of hiding in its natural position below the fold.

- Snapshot the selected value when the list opens (for example with `useInitialValue`) so a later tap does not reorder the list mid-interaction.
- Pin it to the top of the full list **before** filtering with `moveInitialSelectionToTop` (from `@libs/SelectionListOrderUtils`). It no-ops for lists below `CONST.STANDARD_LIST_ITEM_LIMIT`, so short lists keep their natural order.
- Any clear/"None" row belongs directly **below** the pinned selection.
- Pages built on `SelectionScreen` get this automatically from `useSelectionListSearch`, which pins the frozen selection and returns `pinnedValues` for callers that need to know what was pinned.

This is enforced in review by [UI-6](../.claude/skills/app-coding-standards/rules/ui-6-pin-initial-selection.md).

## Related Components

- `SelectionScreen` - Wrapper component that includes screen layout (1 section)
- `SelectionListWithModal` - Selection list with modal interaction (1 section)

