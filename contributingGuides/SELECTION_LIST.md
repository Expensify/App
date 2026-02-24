# SelectionList components

This doc explains when and how to use the `SelectionList` and `SelectionListWithSections` components in New Expensify.

## Overview


There are two main components:

- [**`SelectionList`**](../src/components/SelectionList/BaseSelectionList.tsx) - For displaying a single array of data (no sections)
- [**`SelectionListWithSections`**](../src/components/SelectionListWithSections/BaseSelectionListWithSections.tsx) - For displaying data organized into multiple sections

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
    ListItem={RadioListItem}
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
        { title: 'Recent', data: recentContacts },
        { title: 'All Contacts', data: allContacts },
    ]}
    ListItem={UserListItem}
    onSelectRow={handleSelectContact}
    shouldShowTextInput
    textInputLabel="Search contacts"
/>
```

## Related Components

- `SelectionScreen` - Wrapper component that includes screen layout (1 section)
- `SelectionListWithModal` - Selection list with modal interaction (1 section)

