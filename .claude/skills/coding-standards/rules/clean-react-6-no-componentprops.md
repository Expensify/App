---
ruleId: CLEAN-REACT-6
title: Import the exported prop type instead of ComponentProps
---

## [CLEAN-REACT-6] Import the exported prop type instead of ComponentProps

### Reasoning

When you need another component's prop type, import the type the component already exports rather than deriving it with `ComponentProps<typeof X>`. Deriving the type couples callers to the component's implementation, breaks when props are renamed, and hides the intended public contract. Components export their props type explicitly for this purpose.

### Incorrect

```tsx
import type {ComponentProps} from 'react';
import Button from './Button';

type Props = {
    button: ComponentProps<typeof Button>;
};
```

### Correct

```tsx
import Button from './Button';
import type {ButtonProps} from './Button';

type Props = {
    button: ButtonProps;
};
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code uses `ComponentProps<typeof X>` (or `React.ComponentProps<typeof X>`) to obtain a component's props
- That component exports its own props type that could be imported instead

**DO NOT flag if:**

- The component is a third-party/library component that does not export a props type
- `ComponentProps` is used on an intrinsic element (e.g. `ComponentProps<'div'>`)
- The code is a test or story

**Search Patterns** (hints for reviewers):
- `ComponentProps<typeof`
- `React.ComponentProps<typeof`
