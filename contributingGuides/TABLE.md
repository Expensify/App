# Table Component

A composable, generic table component with built-in filtering, search, and sorting capabilities.

## Quick Start

```tsx
import Table from '@components/Table';
import type { TableColumn, CompareItemsCallback } from '@components/Table';

type Item = { id: string; name: string; status: string };
type ColumnKey = 'name' | 'status';

const columns: Array<TableColumn<ColumnKey>> = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
];

function MyTable() {
  return (
    <Table<Item, ColumnKey>
      data={items}
      columns={columns}
      renderItem={({ item }) => <ItemRow item={item} />}
      keyExtractor={(item) => item.id}
    >
      <Table.Header />
      <Table.Body />
    </Table>
  );
}
```

## Compositional Pattern

The Table uses a **compound component pattern** where the parent `<Table>` manages all state and child components render specific UI parts:

| Component | Purpose |
|-----------|---------|
| `<Table>` | Parent container that manages state and provides context |
| `<Table.Header>` | Renders sortable column headers |
| `<Table.Body>` | Renders data rows using FlashList |
| `<Table.SearchBar>` | Search input that filters data |
| `<Table.FilterButtons>` | Dropdown filter buttons |

### Flexible Composition

You only include the components you need:

```tsx
// Minimal: just data rows
<Table data={items} columns={columns} renderItem={renderItem}>
  <Table.Body />
</Table>

// With search
<Table data={items} columns={columns} renderItem={renderItem} isItemInSearch={searchFn}>
  <Table.SearchBar />
  <Table.Body />
</Table>

// Full featured
<Table
  data={items}
  columns={columns}
  renderItem={renderItem}
  isItemInSearch={searchFn}
  isItemInFilter={filterFn}
  compareItems={compareFn}
  filters={filterConfig}
>
  <Table.SearchBar />
  <Table.FilterButtons />
  <Table.Header />
  <Table.Body />
</Table>
```

## Features

### Sorting

Enable by providing `compareItems`:

```tsx
const compareItems: CompareItemsCallback<Item, ColumnKey> = (a, b, { columnKey, order }) => {
  const multiplier = order === 'asc' ? 1 : -1;
  return a[columnKey].localeCompare(b[columnKey]) * multiplier;
};

<Table
  data={items}
  columns={columns}
  renderItem={renderItem}
  compareItems={compareItems}
>
  <Table.Header /> {/* Clicking headers toggles sort */}
  <Table.Body />
</Table>
```

Header click behavior: `ascending → descending → reset`

### Searching

Enable by providing `isItemInSearch`:

```tsx
const isItemInSearch = (item: Item, searchString: string) =>
  item.name.toLowerCase().includes(searchString.toLowerCase());

<Table
  data={items}
  columns={columns}
  renderItem={renderItem}
  isItemInSearch={isItemInSearch}
>
  <Table.SearchBar />
  <Table.Body />
</Table>
```

### Filtering

Enable by providing `filters` config and `isItemInFilter`:

```tsx
import type { FilterConfig, IsItemInFilterCallback } from '@components/Table';

const filterConfig: FilterConfig = {
  status: {
    filterType: 'single-select', // or 'multi-select'
    options: [
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
    default: 'all',
  },
};

const isItemInFilter: IsItemInFilterCallback<Item> = (item, filterValues) => {
  if (filterValues.includes('all')) return true;
  return filterValues.includes(item.status);
};

<Table
  data={items}
  columns={columns}
  renderItem={renderItem}
  filters={filterConfig}
  isItemInFilter={isItemInFilter}
>
  <Table.FilterButtons />
  <Table.Body />
</Table>
```

## Programmatic Control

Access table methods via ref:

```tsx
import type { TableHandle } from '@components/Table';

const tableRef = useRef<TableHandle<Item, ColumnKey>>(null);

// Update sorting programmatically
tableRef.current?.updateSorting({ columnKey: 'name', order: 'desc' });

// Update search
tableRef.current?.updateSearchString('query');

// Get current state
const sorting = tableRef.current?.getActiveSorting();
const searchString = tableRef.current?.getActiveSearchString();

// FlashList methods also available
tableRef.current?.scrollToIndex({ index: 0 });

<Table ref={tableRef} {...props}>
  <Table.Body />
</Table>
```

## Type Parameters

| Parameter | Description |
|-----------|-------------|
| `T` | Type of items in the data array |
| `ColumnKey` | String literal union of column keys (e.g., `'name' \| 'status'`) |
| `FilterKey` | String literal union of filter keys |

## Architecture

### Middleware Pipeline

Data processing flows through three middlewares:

```
data → [Filtering] → [Searching] → [Sorting] → processedData
```

Each middleware transforms the data array. The order is fixed: filters first, then search, then sort.

### Context

All sub-components access shared state via `TableContext`. You can create custom sub-components using `useTableContext`:

```tsx
import { useTableContext } from '@components/Table/TableContext';

function CustomComponent<T>() {
  const { processedData, activeSorting, updateSorting } = useTableContext<T>();
  // Build custom UI using context data...
}
```

## Column Configuration

```tsx
type TableColumn<ColumnKey> = {
  key: ColumnKey;        // Unique identifier
  label: string;         // Display text
  styling?: {
    flex?: number;              // Column width ratio
    containerStyles?: StyleProp<ViewStyle>;
    labelStyles?: StyleProp<TextStyle>;
  };
};
```

## Props Reference

### Table Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `T[]` | Yes | Array of items to display |
| `columns` | `TableColumn<ColumnKey>[]` | Yes | Column configuration |
| `renderItem` | FlashList's `renderItem` | Yes | Row renderer |
| `keyExtractor` | FlashList's `keyExtractor` | Yes | Unique key generator |
| `compareItems` | `CompareItemsCallback<T, ColumnKey>` | No | Sorting comparator |
| `isItemInSearch` | `IsItemInSearchCallback<T>` | No | Search predicate |
| `isItemInFilter` | `IsItemInFilterCallback<T>` | No | Filter predicate |
| `filters` | `FilterConfig<FilterKey>` | No | Filter dropdown config |
| `ref` | `Ref<TableHandle<T, ColumnKey, FilterKey>>` | No | Ref for programmatic control |

Plus all FlashList props except `data`.
