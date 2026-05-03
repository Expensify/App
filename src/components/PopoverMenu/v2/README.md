# PopoverMenu (v2)

Compound, uncontrolled popover-menu primitives. Inspired by [Radix DropdownMenu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) — same anatomy, same composition rules — adapted for React Native.

## Goals

- **Uncontrolled by default, controlled when needed.** Visibility state lives inside `<Root>` by default — most callers don't manage `isVisible`. Callers that need to drive open/close from outside (product tours, Onyx-derived state, screen-blur effects) pass `open` / `onOpenChange` per Radix's pattern. `<Trigger>` works in both modes.
- **Composition over configuration.** Behaviour is selected by which components you compose, not by boolean props on a monolithic component (`Content` vs `ScrollableContent`, `<Header>` instead of `headerText`, etc.).
- **Structural insulation from re-renders.** Triggers don't re-render when content state (sub navigation, focus) changes. Achieved by splitting state into separate contexts (`RootState/Actions`, `ContentNavigation/Focus/Actions`, `Sub`).
- **Always-on hierarchy assertions.** Misuse fails loud at render time with a descriptive error (`<PopoverMenu.Item> must be rendered inside <PopoverMenu.Content>`), in dev *and* staging. The throws are emitted by the existing context-consumer hooks (`useRootState`, `useContentActions`, `useSubContext`, …), which take a `componentName` and attribute the failure to the offending component — no separate assertion layer.
- **No manual memoization.** All files in this folder compile under React Compiler — no `useCallback` / `useMemo` / `React.memo`.

## Public API

```tsx
import * as PopoverMenu from '@components/PopoverMenu/v2';

<PopoverMenu.Root>
    <PopoverMenu.Trigger accessibilityLabel="Open menu">
        <Icon />
    </PopoverMenu.Trigger>

    <PopoverMenu.Content>
        <PopoverMenu.Header>Menu title</PopoverMenu.Header>
        <PopoverMenu.Item text="Edit" onSelect={...} />
        <PopoverMenu.Separator />

        <PopoverMenu.Sub>
            <PopoverMenu.SubTrigger text="More" />
            <PopoverMenu.SubContent>
                <PopoverMenu.Item text="Archive" onSelect={...} />
            </PopoverMenu.SubContent>
        </PopoverMenu.Sub>
    </PopoverMenu.Content>
</PopoverMenu.Root>
```

Use `<PopoverMenu.ScrollableContent>` instead of `<PopoverMenu.Content>` when the row count is unbounded.

### Controlled mode

When the popover needs to be opened or closed by something other than a `<Trigger>` press (Onyx events, `useImperativeHandle`, screen-blur effects, product tours), drive `<Root>` directly:

```tsx
const [open, setOpen] = useState(false);

<PopoverMenu.Root
    open={open}
    onOpenChange={setOpen}
    anchorRef={anchorRef}
>
    <PopoverMenu.Content anchorPosition={{horizontal: x, vertical: y}}>
        ...
    </PopoverMenu.Content>
</PopoverMenu.Root>
```

`anchorRef` (on `<Root>`) and `anchorPosition` (on `<Content>` / `<ScrollableContent>`) are escape hatches for callers without a child `<Trigger>` element — e.g. event-coordinate anchors from long-press or right-click. `<Trigger>`'s captured rect always wins when present.

## Folder layout

Grouped by feature, not by file type. Each subfolder owns its components, contexts, and hooks, and re-exports its public surface through a barrel (`index.ts`); the top-level [`index.tsx`](./index.tsx) re-exports each barrel.

- **`root/`** — `<Root>` provider and `<Trigger>` button.
- **`content/`** — public surface variants (`<Content>`, `<ScrollableContent>`) plus the internal scaffolding they share.
- **`rows/`** — leaf rows rendered inside content (`<Item>`, `<CheckmarkItem>`, `<Label>`, `<Header>`, `<Separator>`, `<Group>`).
- **`sub/`** — `<Sub>`, `<SubTrigger>`, and `<SubContent>` (drill-down submenu primitives).

Each file carries a high-level header comment describing its role; treat that as the source of truth, not this README.

### Conventions

- **Public vs private boundary is a barrel.** Anything not re-exported from a folder's `index.ts` is implementation detail. External consumers should only deep-import in tests, and only after a deliberate review.
- **Hooks live next to the data they touch.** `useFocusableRow` lives in `rows/` because it's the registration API rows use; `useOrderedIDs` lives in `content/` because the registry it sorts is owned by `Content`.
- **Dependency direction is one-way.** `rows/` and `sub/` may import from `content/` and `root/`. `content/` may import from `root/`. `root/` imports nothing else in v2. There are no cycles.

## Architectural rules

These are enforced at runtime — not just by convention.

| Component | Must be rendered inside |
|---|---|
| `Trigger` | `Root` |
| `Content`, `ScrollableContent` | `Root` |
| `Item`, `CheckmarkItem`, `Label`, `Header`, `Separator`, `Group`, `Sub` | `Content` or `ScrollableContent` (transitively, including inside `Sub.Content`) |
| `SubTrigger`, `SubContent` | `Sub` |

Violating any of these throws synchronously during render. The exception isn't `__DEV__`-gated, so a slip past local dev fails loudly on staging instead of silently corrupting layout.
