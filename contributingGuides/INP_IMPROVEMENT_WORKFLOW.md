# INP Improvement workflow

## Table of contents

- [Introduction to the INP metric](#introduction-to-the-inp-metric)
- [Workflow for improving the INP metric](#workflow-for-improving-the-inp-metric)
    1. [Find the interactions in the app](#1-find-the-interactions-in-the-app)
    2. [Evaluate whether the `data-sentry-label` grouping is correct](#2-evaluate-whether-the-data-sentry-label-grouping-is-correct)
    3. [Choose the interaction to improve](#3-choose-the-interaction-to-improve)
    4. [Capture a baseline React Profiler trace of the chosen interaction](#4-capture-a-baseline-react-profiler-trace-of-the-chosen-interaction)
    5. [Improve the time of the interaction by limiting the number of component re-renders](#5-improve-the-time-of-the-interaction-by-limiting-the-number-of-component-re-renders)
    6. [Improve the time of the interaction by boosting the performance of the rendered components](#6-improve-the-time-of-the-interaction-by-boosting-the-performance-of-the-rendered-components)
    7. [Re-run the trace and verify the improvement against the baseline](#7-re-run-the-trace-and-verify-the-improvement-against-the-baseline)
    8. [Check for First Paint regressions](#8-check-for-first-paint-regressions)
    9. [Quantify the improvement with the trace analyzer and create a proposal](#9-quantify-the-improvement-with-the-trace-analyzer-and-create-a-proposal)
    10. [Fall back to a loading state when no further improvement is possible](#10-fall-back-to-a-loading-state-when-no-further-improvement-is-possible)

## Introduction to the INP metric

[Interaction to Next Paint (INP) [web.dev] article](https://web.dev/articles/inp#measure-inp-in-javascript)

TL;DR of the linked article:
- INP (Interaction to Next Paint) measures a page's overall responsiveness to user interactions.
- It tracks the time from a click, tap, or key press until the browser paints the next visual update.
- Measurement covers every interaction during a visit and reports a representative high-percentile value.
- A value of 200 ms or less is considered good.
- INP is collected only from the web.

Project-specific notes:
- In the Expensify app, INP is not split per page. Instead, it reflects overall app responsiveness.
- An INP entry groups all interactions triggered by components sharing the same `data-sentry-label`, not a single call site.
- The same labeled component can appear in many places throughout the app, with each instance producing different downstream renders after interaction.
- INP entries should always be analyzed case-by-case, based on where the interaction occurred.

*Example of the importance of context for the INP interaction: an interaction that edits transaction details will produce very different work depending on where it's invoked: from the Search Page, it additionally triggers re-renders of the Search List; from a report view, it may re-render the report header and transaction list instead. Even though both interactions share the same `data-sentry-label`, their performance characteristics and the components contributing to the INP differ significantly.*

## Workflow for improving the INP metric

> [!NOTE]
> This workflow is iterative, not sequential. Steps 4-7 in particular form a tight loop. You will profile, hypothesize, change and re-profile multiple times before a single improvement is ready. The numbered order reflects how to think about the problem, not the path your investigation will literally take. **Your actions should be guided by the pursuit of INP gain rather than by following these suggestions.**

### 1. Find the interactions in the app

1. Find the constant with the value of `data-sentry-label` and then the component that assigns this constant to the `sentryLabel` component's prop. That is the component whose interaction you are trying to improve.
2. Investigate the app for usages of the found component's handler (`onPress`, `onChangeText`, etc.). To quickly visualize where instances of the label appear in the running app, paste the snippet below into the browser DevTools console after replacing `X` with the relevant label. It dynamically injects a stylesheet that surrounds every matching component with a red outline, making all occurrences easy to spot on the page. To remove the outlines, call `__stopSentryBorder()` in the console.

    ```js
    (() => {
        const LABEL = 'X';

        const style = document.createElement('style');
        style.id = '__sentryBorder';
        style.textContent = `
            [data-sentry-label="${LABEL}"] {
                outline: 2px solid red !important;
                outline-offset: -2px !important;
            }
        `;
        document.head.appendChild(style);

        window.__stopSentryBorder = () => style.remove();

        console.log(`%c[${LABEL}] border enabled. Disable with: __stopSentryBorder()`, 'color: red');
    })();
    ```

### 2. Evaluate whether the `data-sentry-label` grouping is correct

A label should characterize a concrete type of interaction. If it is attached to a generic component (e.g. base button or pressable wrapper) whose call sites trigger fundamentally different render trees, the aggregated INP becomes noisy and difficult to track.

If the label is too coarse, propose splitting it into more specific labels tied to concrete interaction types.

### 3. Choose the interaction to improve

> [!NOTE]
> Many interactions only feel slow under specific conditions, so you might need to identify what makes the interaction problematic from the user's perspective and recreate those conditions locally. A common pitfall is insufficient data.

The more popular and problematic the place in the app, the greater the improvement to the overall INP score that the change will have (because the interaction accounts for a larger share of the metric).

Choose the interaction in the app that you would like to improve. The best way to find the most impactful interaction would be to:

1. If you have access to the Expensify Sentry organization (Expensify engineers and Contributor+): use the Explore view in Sentry to narrow down where to investigate by finding the worst real-world call sites for a given label. Filter by `measurements.inp > 0ms` and `span.description is [data-sentry-label="X"]` (adjust the label to the component you are investigating), group by `transaction` and display `count(spans)` together with `p75(measurements.inp)`. This produces a ranking of the pages where the optimized interaction is both frequent and slow.
2. To find the most problematic interactions, use the Performance tab in DevTools and inspect the Interactions track, where each click is annotated with its measured interaction time. If you arrived here via step 1, focus on the pages it ranked highest.

### 4. Capture a baseline React Profiler trace of the chosen interaction

> [!NOTE]
> INP timings collected in a dev build are skewed by debug tooling (dev-only warnings, unminified code, etc.), so all traces and before/after comparisons in this workflow must be captured against a production build. See [Performance Guide](https://github.com/Expensify/App/blob/main/contributingGuides/PERFORMANCE.md) for more details.

Using the React Profiler from DevTools, capture a trace of the chosen interaction in a way that closely approximates the INP. This trace serves both as the input for detailed analysis in the following steps and as the baseline you will compare against after applying improvements. To capture only the commits relevant to the interaction without additional noise, to bracket a window that approximates the INP and to avoid clicking the record button manually in DevTools, use the following setup:

> [!WARNING]
> Both snippets in this step are strictly local debugging tools used to drive the React Profiler during your analysis. They must never be committed.

1. In `src/App.tsx`, introduce a new component that stops profiling on the next animation frame after a click (embed it just below the `StrictModeWrapper`):

    ```tsx
    function UniversalPaintTracker() {
        useEffect(() => {
            const handleCaptureClick = (event: MouseEvent) => {
                requestAnimationFrame(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.reactDevtoolsAgent?.stopProfiling({});
                });
            };

            window.addEventListener('click', handleCaptureClick, true);
            return () => {
                window.removeEventListener('click', handleCaptureClick, true);
            };
        }, []);

        return null;
    }
    ```

2. Additionally, in order to start the React Profiler recording automatically at the beginning of the interaction, add the following logic to the handler that triggers the interaction:

    ```tsx
    <Button
        onPress={() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.reactDevtoolsAgent?.startProfiling({});
            onSubmit?.();
        }}
    />
    ```

### 5. Improve the time of the interaction by limiting the number of component re-renders

Using the Flamegraph view, analyze whether any components re-render unnecessarily. If impactful components do appear to re-render unnecessarily, investigate the cause. Analyze top-down, starting with the handlers that trigger the interaction and then moving down to the lower-level functions.

1. Make sure that the cause of a component re-rendering (like Onyx subscription) is not itself redundant (that is, that the same calls are not repeated across different functions invoked during the action). Remove redundant calls (such as duplicate Onyx subscriptions) where possible. *Examples: [#90338](https://github.com/Expensify/App/pull/90338), [#89908](https://github.com/Expensify/App/pull/89908)*
2. Try to improve the memoization of the consumer components:
    1. If the component does not yet compile successfully with React Compiler (i.e. it has a Rules of React violation and opts out of compilation), try to make it compliant first. See [React Compiler Guide](https://github.com/Expensify/App/blob/main/contributingGuides/REACT_COMPILER.md) for details on diagnosing and fixing compilation failures. Once the component compiles, trace the interaction with the React Profiler and check whether there has been a measurable improvement. *Examples: [#84502](https://github.com/Expensify/App/pull/84502), [#82846](https://github.com/Expensify/App/pull/82846)*
    2. If the improvement is not visible after the component compiles successfully with React Compiler, stabilize references, props and dependencies so that the React Compiler can correctly memoize the rendered component and avoid unnecessary re-renders. In some cases, this step may be difficult to implement given the number of dependencies of the component, since it may require stabilizing the higher-level dependencies as well. *Examples: [#82785](https://github.com/Expensify/App/pull/82785), [#83934](https://github.com/Expensify/App/pull/83934)*

### 6. Improve the time of the interaction by boosting the performance of the rendered components

Using the Ranked view, diagnose the components that are most problematic in terms of rendering time. Your objective is to improve the performance of those components.

> [!IMPORTANT]
> What matters here is the outcome: anything that measurably speeds up the interaction is a valid improvement. The techniques listed below are common starting points and suggestions, not a fixed checklist.

The most common ways to improve a component's performance are:

1. Split the re-rendered component into smaller parts so that each part only loads the code, renderers and dependencies it actually needs.

    A common anti-pattern is a single large component that owns many unrelated concerns (data fetching, derived state, presentation, side effects). When any of its inputs change, the entire component re-renders, including subtrees that depend on completely unrelated data.

    1. Identify logical boundaries inside the component (e.g. "header", "list row", "footer actions"). Each boundary should depend on a distinct slice of props/Onyx data.
    2. Extract each boundary into its own component, passing only the props it actually needs.
    3. After the split, only the sub-component whose inputs changed will re-render. The others stay memoized.
    4. This also reduces the JS that runs per render: hooks, derived calculations and effect setup only execute inside the sub-tree that needs them.

    When to apply: the Ranked view shows one component dominating the commit and its body contains code paths that clearly don't depend on the prop that changed.

    *Examples: [#89120](https://github.com/Expensify/App/pull/89120), [#86865](https://github.com/Expensify/App/pull/86865)*

> [!WARNING]
> Do not reach for `InteractionManager.runAfterInteractions` as a deferral primitive. It is being removed from React Native and is in the process of being migrated out of the codebase. New usages should not be introduced. See [INTERACTION_MANAGER.md](https://github.com/Expensify/App/blob/main/contributingGuides/INTERACTION_MANAGER.md) for more details.

2. Defer non-critical work past the next paint.

    INP measures the time from the input event to the next paint. Anything that doesn't need to be on screen at that paint can be pushed off the critical path. The user sees a fast response; the heavy work resolves a frame or two later.

    Techniques specific to non-visual changes:

    * requestIdleCallback to schedule non-urgent, non-visual work (analytics, prefetching, cache warming, logging). It runs during browser idle time, once the interaction's paint is done and the main thread is free, rather than at a guaranteed point. Because a busy main thread can postpone it indefinitely, pass the `timeout` option to cap the delay and force execution after a deadline.
    * Lazy-mount secondary panels. If a tab, accordion, or popover is closed by default, don't render its tree until it opens.

    When the deferred work eventually resolves into visible, clickable UI, the technique must keep something responsive on screen in the meantime. The previous (stale) state, or a placeholder that will be swapped for the real interactive subtree, fills the gap until the heavy update lands.

    Techniques for visible elements:

    * Skeleton / placeholder first. Render a cheap, static version of the heavy subtree synchronously, then resolve the real content after the paint. The user sees something update immediately, which is what INP rewards.
    * PulsingView (src/components/PulsingView.tsx) to wrap stale content while the deferred update is being computed; it pulses the existing UI to signal a pending refresh without causing layout shifts.
    * useDeferredValue for derived values that are expensive to compute but can tolerate being one frame behind (typically elements visible in the background, derived previews).
    * startTransition to mark a state update as non-urgent. React will keep the previous UI visible and paint the urgent update first, then process the transition.

    When to apply: the heavy work is real (you can't make it cheaper), but it isn't visually required for the paint that closes the interaction.

    *Examples: [#89083](https://github.com/Expensify/App/pull/89083), [#88522](https://github.com/Expensify/App/pull/88522), [#88316](https://github.com/Expensify/App/pull/88316), [#89060](https://github.com/Expensify/App/pull/89060), [#91034](https://github.com/Expensify/App/pull/91034), [#86738](https://github.com/Expensify/App/pull/86738), [#89180](https://github.com/Expensify/App/pull/89180), [#85629](https://github.com/Expensify/App/pull/85629), [#84910](https://github.com/Expensify/App/pull/84910), [#83607](https://github.com/Expensify/App/pull/83607), [#87768](https://github.com/Expensify/App/pull/87768)*

### 7. Re-run the trace and verify the improvement against the baseline

After applying any improvements, collect a corresponding trace (preferably using the UniversalPaintTracker setup) and compare the new Flamegraph and Ranked view against the baseline. Make sure the new trace follows exactly the same pattern as the baseline (compare warm renders with warm renders and cold renders with cold renders). Then confirm that:

* the number of committed components during the interaction has decreased (or at minimum, has not regressed),
* the heaviest components from the previous Ranked view either dropped out of the top entries or render measurably faster (or have at least not regressed),
* the total commit duration for the interaction is lower.

### 8. Check for First Paint regressions

Measure First Paint on the first open of the optimized component. Splitting components, deferring work, or adding memoization can shift cost from interaction time to initial mount time, which is where regressions are most likely to surface. If First Paint regresses, weigh the trade-off against the INP gain and adjust the approach before moving on.

### 9. Quantify the improvement with the trace analyzer and create a proposal

To demonstrate a clear improvement, use the trace analyzer tool (https://sumo-slonik.github.io/react-native-profiler-trace-comparator/) to upload a sufficient number of samples of the relevant traces (ideally 10 each for before and after your changes, to reduce the margin of statistical error). Present the results as a screenshot of the diagram and a screenshot of the number of commits contained in the traces.

> [!NOTE]
> The trace analyzer is an external third-party tool. It is not owned or operated by Expensify.

Create a proposal if the changes show a clear improvement.

### 10. Fall back to a loading state when no further improvement is possible

If you don't see any areas for further performance improvement and the INP remains high, propose a loading state that will not cause significant flickering on high-end devices. These elements should be agreed upon with designers, because there are many ways to implement them:

1. A spinner on the button.
2. If you are reloading content in a list, create a loading state over the old state, e.g., by overlaying a spinner or adding a reload animation to the list items.
3. If you are loading something for the first time, use skeletons.
