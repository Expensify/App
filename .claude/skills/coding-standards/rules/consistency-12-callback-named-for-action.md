---
ruleId: CONSISTENCY-12
title: Name callbacks for what they do, not the event they handle
---

## [CONSISTENCY-12] Name callbacks for what they do, not the event they handle

### Reasoning

Per `contributingGuides/STYLE.md`, a callback method should be named for the action it performs, not for the event slot it happens to be wired to. `toggleReport` tells the reader what happens; `onIconClick` only tells you where it was attached and has to be re-read to learn what it does. Naming by behavior keeps handlers reusable across triggers and searchable by intent. The `on*` / `handle*` naming belongs on the JSX prop, not on the function definition.

### Incorrect

```tsx
function ReportHeader() {
    const onIconClick = () => Report.toggleReport(reportID);
    const handleButtonPress = () => Navigation.dismissModal();

    return <Icon onPress={onIconClick} />;
}
```

### Correct

```tsx
function ReportHeader() {
    const toggleReport = () => Report.toggleReport(reportID);
    const dismissModal = () => Navigation.dismissModal();

    return <Icon onPress={toggleReport} />;
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code **declares** a function (function declaration or arrow/function assigned to a `const`/`let`) whose name matches `^(on|handle)[A-Z]` and describes the triggering event (e.g. `onIconClick`, `handleButtonPress`, `onRowClick`)
- The name refers to the event slot rather than the action performed, and a behavior-based name (`toggleReport`, `dismissModal`) would be clearer

**DO NOT flag if:**

- The `on*` / `handle*` name appears only as a JSX prop assignment or call site (e.g. `onPress={toggleReport}`) rather than as the function's own declaration
- The function genuinely represents a named event in an event system or implements an external API/interface that dictates the name (e.g. a required `onSuccess` callback prop, `onLayout`, DOM event handler contracts)
- The handler is a prop being passed through/forwarded rather than defined here
- The file is a test or story

**Search Patterns** (hints for reviewers):
- `const on[A-Z]` / `const handle[A-Z]` / `function on[A-Z]` / `function handle[A-Z]`
