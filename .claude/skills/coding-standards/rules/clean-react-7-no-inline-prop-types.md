---
ruleId: CLEAN-REACT-7
title: Do not inline prop types on exported components
---

## [CLEAN-REACT-7] Do not inline prop types on exported components

### Reasoning

Per `STYLE.md`, an exported component's props must be declared as a named `type` (conventionally `{Component}Props`), not an inline object type literal in the function signature. A named type is importable by other components, documentable, and keeps the component signature readable.

### Incorrect

```tsx
function Avatar({source, size}: {source: string; size: number}) {
    return <Image source={source} width={size} />;
}

export default Avatar;
```

### Correct

```tsx
type AvatarProps = {
    /** URL of the avatar image */
    source: string;

    /** Rendered width/height in px */
    size: number;
};

function Avatar({source, size}: AvatarProps) {
    return <Image source={source} width={size} />;
}

export default Avatar;
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- A component that is exported from the file declares its props as an inline object type literal in the parameter position (e.g. `(props: {a: string})` / `({a}: {a: string})`)
- The component is a React component (returns JSX / is rendered)

**DO NOT flag if:**

- The props are already a named `type`/imported type
- The function is a small local helper component used only within the same file and not exported
- The code is a test or story

**Search Patterns** (hints for reviewers):
- `function [A-Z][A-Za-z]*\([^)]*:\s*\{` (component with inline object param type)
- `}: \{` immediately inside a component signature
