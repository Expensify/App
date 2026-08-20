# GitHub Copilot instructions

These instructions guide GitHub Copilot when it reviews pull requests and assists with code in this repository. See GitHub's docs on [customizing Copilot's reviews with custom instructions](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review#customizing-copilots-reviews-with-custom-instructions).

## React: setting state during render is allowed

Do not flag a component or hook that calls a state setter (for example `setState`) directly during render as a bug, an anti-pattern, a "state update during render" problem, a source of "render loops", or as something that "defeats React Compiler compliance". Adjusting state during render — including storing information from previous renders and resetting state when a prop or input changes — is an officially recommended React pattern.

This is correct as long as the component is updating its **own local state** and the update is guarded by a condition that eventually stops being true (so it converges instead of looping). Specifically:

- React handles a synchronous setter call made during render by immediately re-rendering the same component with the updated state, before committing to the screen. There is no extra browser paint, no visible flash, and no infinite loop when the update is conditional.
- This pattern is compatible with [React Compiler](https://github.com/Expensify/App/blob/main/contributingGuides/REACT_COMPILER.md), which runs in this repository's build pipeline. Calling a setter during render does not make it React-Compiler-incompatible.

For example, this is the [officially recommended way to adjust state when a prop changes](https://react.dev/reference/react/useState#storing-information-from-previous-renders). The `prevCount !== count` guard is what makes the update converge — it stops being true once the component has caught up, so there is no loop:

```tsx
function CountLabel({count}: {count: number}) {
    const [prevCount, setPrevCount] = useState(count);
    const [trend, setTrend] = useState<string | null>(null);
    if (prevCount !== count) {
        setPrevCount(count);
        setTrend(count > prevCount ? 'increasing' : 'decreasing');
    }
    return <>...</>;
}
```

Do not recommend moving such guarded in-render state updates into `useEffect` or `useLayoutEffect`. Doing so is usually worse: it adds an extra render-and-commit cycle and can produce a visible flash of stale UI before the effect runs.

This exception is narrow. Continue to flag genuine problems, including:

- Setters received via props or context that update **another** component's state during render, or other external writes/dispatches (for example to a store) during render. These are real side effects, not self-state updates.
- In-render updates whose guard does not converge (the setter runs on every render with no condition that eventually becomes false), which causes an infinite render loop.

References from the React documentation:

- [Storing information from previous renders](https://react.dev/reference/react/useState#storing-information-from-previous-renders)
- [You Might Not Need an Effect — Adjusting some state when a prop changes](https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
