---
ruleId: CLEAN-REACT-PATTERNS-4
title: Avoid side-effect spaghetti
---

## [CLEAN-REACT-PATTERNS-4] Avoid side-effect spaghetti

### Reasoning

When multiple unrelated responsibilities are grouped into a single component, hook, or utility, if any one concern changes, then unrelated logic must be touched as well, increasing coupling, regression risk, and cognitive load. This is the single responsibility principle for React: extract small units that do very little, very well. A component with several unrelated effects is a code smell - even a single effect can benefit from extraction to something with a good name, proper description, and isolated tests.

**Bucketing questions for refactoring:**
1. Does this logic need the React render loop? YES -> Extract to a focused custom hook. NO -> Extract out of React entirely (e.g., Onyx migration, global initialization).
2. Does this logic need to be in this component? YES -> Keep it, but use a focused hook. NO -> Extract to a separate component that owns this concern.

**Hook granularity guidance:**
- Group effects that serve the same purpose into one hook (e.g., all telemetry setup in `useTelemetry`)
- Group effects that can be reused together across components
- Don't create 15 separate single-effect hooks if 5 well-named grouped hooks make more sense

### Incorrect

#### Incorrect (side-effect spaghetti)

- Component mixes session management, deep linking, telemetry, navigation, splash screen, audio, and other startup logic
- Several unrelated `useOnyx` calls and `useEffect` hooks in a single component
- Changing one concern risks breaking others

```tsx
function Expensify() {
    // Session & auth
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    // Navigation & routing
    const [lastRoute] = useOnyx(ONYXKEYS.LAST_ROUTE);
    const [lastVisitedPath] = useOnyx(ONYXKEYS.LAST_VISITED_PATH);
    const [isNavigationReady, setIsNavigationReady] = useState(false);

    // App state
    const [updateAvailable] = useOnyx(ONYXKEYS.UPDATE_AVAILABLE);
    const [updateRequired] = useOnyx(ONYXKEYS.UPDATE_REQUIRED);
    const [isSidebarLoaded] = useOnyx(ONYXKEYS.IS_SIDEBAR_LOADED);

    // Splash screen
    const {splashScreenState, setSplashScreenState} = useContext(SplashScreenStateContext);

    // ... 10+ more useOnyx calls for unrelated concerns ...

    // Telemetry effect
    useEffect(() => {
        bootsplashSpan.current = startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ROOT, {...});
        // ...
    }, []);

    // Public room checking effect
    useEffect(() => {
        if (isCheckingPublicRoom) return;
        endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX);
        // ...
    }, [isCheckingPublicRoom]);

    // Splash screen effect
    useEffect(() => {
        if (!shouldHideSplash) return;
        startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.SPLASH_HIDER, {...});
    }, [shouldHideSplash]);

    // Deep linking effect
    useEffect(() => {
        Linking.getInitialURL().then((url) => {
            if (url) {
                openReportFromDeepLink(url, ...);
            }
        });
        // ...
    }, []);

    // Audio mode effect
    useEffect(() => {
        Audio.setAudioModeAsync({playsInSilentModeIOS: true});
    }, []);

    // ... 10+ more useEffects mixing concerns ...
}
```

In this example:
- The component handles telemetry, deep linking, audio, session, navigation, splash screen, and more
- Each concern is interleaved with others, making it hard to modify one without risking regression in another
- Effects could be extracted to focused hooks: `useTelemetrySpans`, `useDeepLinking`, `useAudioMode`, etc.
- Entry points don't get special treatment — extracting effects into named hooks improves clarity and makes it possible to understand what each effect does and how to safely modify it

#### Incorrect (internal render helper functions)

- Internal `render*` functions signal the component owns multiple rendering responsibilities that should be separate components
- They close over the entire component scope — the React Compiler cannot independently memoize them
- They hide the component's render tree — the return statement doesn't show what actually renders
- The fix is to extract each helper into its own component with explicit props

```tsx
function ForYouSection() {
    const theme = useTheme();
    const {translate} = useLocalize();
    const {submitCount, approveCount} = useTodos();

    // ❌ Internal render helper — closes over everything, hides structure
    const renderTodoItems = () => (
        <View style={styles.todoContainer}>
            {todoItems.map(({key, icon, ...rest}) => (
                <BaseWidgetItem key={key} icon={icon} {...rest} />
            ))}
        </View>
    );

    // ❌ Another render helper — branching logic buried in a function
    const renderContent = () => {
        if (isLoadingApp) {
            return <ActivityIndicator size="large" />;
        }
        return hasAnyTodos ? renderTodoItems() : <EmptyState />;
    };

    // The return statement hides the actual render tree
    return <WidgetContainer>{renderContent()}</WidgetContainer>;
}
```

### Correct

#### Correct (separated concerns)

- Each piece of logic is extracted to a focused hook or component
- Parent component only orchestrates what to render
- State subscriptions in smaller components don't cause re-renders in parent
- Component-scoped hooks can be co-located in the same directory for maintainability

```tsx
function DebugMenu() {
    useDebugShortcut();

    return (
        // Debug menu UI
    );
}

function ParentComponent({ reportID }: { reportID: string }) {
    return (
        <View>
            {/* Each child owns its own concerns */}
            <ReportView reportID={reportID} />
            <DebugMenu />
        </View>
    );
}
```

```tsx
// Focused hook that does one thing well
function useDebugShortcut() {
    useEffect(() => {
        const debugShortcutConfig = CONST.KEYBOARD_SHORTCUTS.DEBUG;
        const unsubscribeDebugShortcut = KeyboardShortcut.subscribe(
            debugShortcutConfig.shortcutKey,
            () => toggleTestToolsModal(),
            debugShortcutConfig.descriptionKey,
            debugShortcutConfig.modifiers,
            true,
        );

        return () => {
            unsubscribeDebugShortcut();
        };
    }, []);
}
```

---

### Review Metadata

#### Condition

Flag when a component, hook, or utility aggregates multiple unrelated responsibilities in a single unit, making it difficult to modify one concern without touching others.

**Signs of violation:**
- Component has several `useEffect` hooks handling unrelated concerns (e.g., telemetry, deep linking, audio, session management all in one component)
- A single `useEffect` or hook handles multiple distinct responsibilities
- Unrelated state variables are interdependent or updated together
- Logic mixes data fetching, navigation, UI state, and lifecycle behavior in one place
- Removing one piece of functionality requires careful untangling from others
- Component defines internal `render*` functions or arrow functions that return JSX and calls them in its return statement (e.g., `const renderContent = () => ...`, `{renderContent()}`)
- These functions close over the component's entire scope, preventing the React Compiler from independently memoizing them
- The component's return statement calls these helpers instead of showing the render tree directly

**What counts as "unrelated":**
- Group by responsibility (what the code does), NOT by timing (when it runs)
- Data fetching and analytics are NOT related — they serve different purposes even if both run on mount
- Session management and audio configuration are NOT related — different domains entirely

**DO NOT flag if:**
- Component is a thin orchestration layer that ONLY composes child components (no business logic, no effects beyond rendering)
- Effects are extracted into focused custom hooks with single responsibilities (e.g., `useDebugShortcut`, `usePriorityMode`) — inline `useEffect` calls are a code smell and should be named hooks
- The internal function is a **callback or event handler** (e.g., `handlePress`, `onSubmit`), not a render helper — only functions that return JSX qualify
- The internal function is a **single early return** for a guard clause (e.g., `if (!data) return <EmptyState />;` at the top of the component) — simple guards in the component body are not render helpers

**Search Patterns** (hints for reviewers):
- `useEffect`
- `useOnyx`
- `const render\w+\s*=` or `function render\w+` inside a component body (internal render helpers)
- `{render\w+\(\)}` in JSX return statements (helper invocations)
