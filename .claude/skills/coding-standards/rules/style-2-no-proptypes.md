---
ruleId: STYLE-2
title: Use TypeScript types, not propTypes or defaultProps
---

## [STYLE-2] Use TypeScript types, not propTypes or defaultProps

### Reasoning

Per `STYLE.md`, components must type their props with TypeScript and provide defaults via destructuring. The `prop-types` library (`PropTypes.*`, `Component.propTypes`) and `defaultProps` are redundant with the type system, add runtime cost, and are not used in this codebase.

### Incorrect

```tsx
import PropTypes from 'prop-types';

function Badge({text}) {
    return <Text>{text}</Text>;
}

Badge.propTypes = {
    text: PropTypes.string,
};

Badge.defaultProps = {
    text: '',
};
```

### Correct

```tsx
type BadgeProps = {
    /** Text shown inside the badge */
    text?: string;
};

function Badge({text = ''}: BadgeProps) {
    return <Text>{text}</Text>;
}
```

---

### Review Metadata

Flag ONLY when ANY of these is true:

- The changed code imports `prop-types` or references `PropTypes.`
- It assigns `.propTypes` to a component
- It assigns `.defaultProps` to a function component (use destructuring defaults instead)

**DO NOT flag if:**

- The code is a test or story
- `defaultProps` appears on a third-party class component API that requires it

**Search Patterns** (hints for reviewers):
- `from 'prop-types'` / `PropTypes.`
- `.propTypes =` / `.defaultProps =`
