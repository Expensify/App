---
ruleId: CONSISTENCY-2
title: Avoid magic numbers and strings
---

## [CONSISTENCY-2] Avoid magic numbers and strings

### Reasoning

Magic numbers and strings reduce code readability and maintainability. Replacing them with named constants or documented values improves clarity and makes future changes easier.

### Incorrect

```tsx
function fetchData() {
  if (attempts < 3) {
    return apiCall({ timeout: 5000 });
  }
}
```

### Correct

```tsx
const MAX_RETRY_ATTEMPTS = 3;
const API_TIMEOUT_MS = 5000;

function fetchData() {
  if (attempts < MAX_RETRY_ATTEMPTS) {
    return apiCall({ timeout: API_TIMEOUT_MS });
  }
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- Hardcoded strings or numbers are used without documentation or comments
- The value is not defined as a constant elsewhere in the codebase
- The value is not self-explanatory (e.g., `0`, `1`, `Math.PI`)

**DO NOT flag if:**

- The value is self-explanatory (e.g., `Math.PI`, `0`, `1`, `true`, `false`)
- The value is part of configuration or environment variables
- The value is documented with clear comments explaining its purpose
- The value is defined as a named constant in the same file or imported module

**Search Patterns** (hints for reviewers):
- Hardcoded numbers/strings (not self-explanatory like Math.PI or "error")
