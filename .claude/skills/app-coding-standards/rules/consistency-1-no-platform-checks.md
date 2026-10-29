---
ruleId: CONSISTENCY-1
title: Avoid platform-specific checks within components
---

## [CONSISTENCY-1] Avoid platform-specific checks within components

### Reasoning

Mixing platform-specific logic within components increases maintenance overhead, complexity, and bug risk. Separating concerns through dedicated files or components improves maintainability and reduces platform-specific bugs.

### Incorrect

```tsx
function Button() {
  const isAndroid = Platform.OS === 'android';
  return isAndroid ? (
    <TouchableOpacity style={androidStyles} />
  ) : (
    <button style={iosStyles} />
  );
}
```

### Correct

```tsx
// Platform-specific file: Button.desktop.tsx
function Button() {
  return <button style={desktopStyles} />;
}

// Platform-specific file: Button.mobile.tsx
function Button() {
  return <TouchableOpacity style={mobileStyles} />;
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- Platform detection checks (e.g., `Platform.OS`, `isAndroid`, `isIOS`) are present within a component
- The checks lead to hardcoded values or styles specific to a platform
- The component is not structured to handle platform-specific logic through file extensions or separate components

**DO NOT flag if:**

- The logic is handled through platform-specific file extensions (e.g., `index.web.tsx`, `index.native.tsx`)

**Search Patterns** (hints for reviewers):
- `Platform.OS`
- `isAndroid`
- `isIOS`
- `Platform\.select`
