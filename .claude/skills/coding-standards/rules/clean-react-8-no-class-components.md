---
ruleId: CLEAN-REACT-8
title: Use function components, not class components
---

## [CLEAN-REACT-8] Use function components, not class components

### Reasoning

Per `STYLE.md`, class components are deprecated in this codebase. New components must be written as function components using hooks. Class components opt out of the React Compiler, complicate state/lifecycle reasoning, and diverge from the rest of the codebase.

### Incorrect

```tsx
class ReportActionItem extends React.Component<ReportActionItemProps> {
    render() {
        return <View>{this.props.action.message}</View>;
    }
}
```

### Correct

```tsx
function ReportActionItem({action}: ReportActionItemProps) {
    return <View>{action.message}</View>;
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code adds a class that extends `React.Component`/`Component`/`React.PureComponent`/`PureComponent`

**DO NOT flag if:**

- The class is an Error subclass, a non-React class, or a data model
- The change only modifies an existing class component (migrating it is out of scope) rather than adding a new one
- The class is an Error Boundary, which still requires a class component in React

**Search Patterns** (hints for reviewers):
- `extends React.Component`
- `extends Component`
- `extends React.PureComponent` / `extends PureComponent`
