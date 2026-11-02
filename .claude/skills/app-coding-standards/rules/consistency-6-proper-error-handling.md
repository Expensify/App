---
ruleId: CONSISTENCY-6
title: Ensure proper error handling
---

## [CONSISTENCY-6] Ensure proper error handling

### Reasoning

Proper error handling prevents silent failures, enhances debuggability, and improves user experience. Failing to handle errors can lead to crashes, data loss, and confusion for both developers and users.

### Incorrect

```tsx
async function submitForm(data: FormData) {
  await API.submit(data);
  // No error handling - failures are silent
  showSuccessMessage('Form submitted successfully');
}
```

### Correct

```tsx
async function submitForm(data: FormData) {
  try {
    await API.submit(data);
    showSuccessMessage('Form submitted successfully');
  } catch (error) {
    Log.error('Form submission failed', error);
    showErrorMessage('Failed to submit form. Please try again.');
  }
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- Error handling logic exists but errors are not logged or handled appropriately
- OR error states are not communicated to the user or developer clearly
- OR a critical function (e.g., API call, authentication, data mutation) lacks error handling

**DO NOT flag if:**

- Errors are logged and handled properly with user feedback
- Errors are intentionally suppressed with clear justification
- Error handling is managed by a higher-level function or middleware
- The operation is non-critical and errors are acceptable to ignore

**Search Patterns** (hints for reviewers):
- `try`
- `catch`
- `async`
- `await`
- `Promise`
- `\.then\(`
- `\.catch\(`
