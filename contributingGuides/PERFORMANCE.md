# React Performance Tips

### General Performance Considerations

When investigating performance issues, it's crucial to understand the underlying principles and common pitfalls.

#### Understanding Performance Issues

Performance issues often manifest as slow rendering or unresponsiveness. The goal of performance investigation is to identify the root cause of these regressions and measure their impact on the system. Key metrics to consider typically include:

*   **Resource Consumption:** CPU, RAM, network, storage, and battery usage.
*   **Responsiveness:** Frames per second (FPS) and Time to Interactive (TTI).
*   **Thread Usage:** JavaScript and native thread activity.
*   **React Pipeline:** Frequency and cost of component renders.

These metrics are often interconnected. For example, excessive React re-renders can lead to high JavaScript thread consumption, which in turn increases CPU usage. By understanding these cause-and-effect chains, we can conduct more precise investigations.

#### Precision vs. Effort in Investigation

Different investigation techniques offer varying levels of precision and require different amounts of effort. Some methods provide broad insights with minimal setup, while others offer deep, granular data but demand more time and expertise. It's often beneficial to start with broader, easier-to-obtain insights and then progressively move to more precise methods as needed.

#### Establishing a Test Flow and Baseline

Before diving into detailed profiling, it's essential to establish a consistent "test flow" or reproduction steps for the performance issue. This ensures that measurements are consistent and comparable. Additionally, capturing "baseline measurements" is crucial. This involves noting key meta-information about the testing environment and application state, such as:

*   The specific user account and its state.
*   The exact commit SHA of the codebase being tested.
*   Network conditions (online/offline, throttling).
*   The platform(s) and device types used (simulator/emulator vs. physical device).
*   The type of build (development vs. optimized production build).

Maintaining a stable setup for these baseline measurements is critical for accurate comparisons and effective performance optimization.

- You can test performance in development mode, but keep in mind it’s not optimized — things like loggers, debug tools, and extra checks can slow things down or cause jank that won’t happen in production. This can skew results, meaning you might misinterpret what’s slow in your app. For accurate metrics, always verify with a production build.
- Use [`React.memo`](https://react.dev/reference/react/memo), [`useMemo`](https://react.dev/reference/react/useMemo), and [`useCallback`](https://react.dev/reference/react/useCallback) to prevent expensive re-renders.
- Using a combination of [React DevTools Profiler](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) and [Chrome Dev Tools Performance Timing](https://calibreapp.com/blog/react-performance-profiling-optimization) can help identify unnecessary re-renders. Both tools can be used to time an interaction like the app starting up or navigating to a new screen.
- Watch out for [very large lists](https://reactnative.dev/docs/optimizing-flatlist-configuration) and things like `Image` components re-fetching images on render when a remote uri did not change.
- **When to use memoization (useMemo/useCallback/React.memo):**
  - ✅ Component renders frequently (>10 times during normal user interaction)
  - ✅ Heavy computations that take >10ms to execute
  - ✅ Large lists or complex data transformations
  - ✅ Props passed to many child components that could cause cascading re-renders
  - ✅ You can measure a meaningful performance improvement with profiling tools

- **When NOT to use memoization:**
  - ❌ Component only renders a few times during normal usage
  - ❌ Computations are simple/fast (<1ms)
  - ❌ Small lists or basic data operations
  - ❌ You're just guessing it might help without measuring
  - ❌ The memoization logic itself is more expensive than re-rendering

**Rule of thumb:** Profile first, optimize second. Always measure the performance impact before and after adding memoization.
- Use caution when adding subscriptions that might re-render very large trees of components e.g. subscribing to state that changes often (current report, current route, etc) in the app root.
- Avoid passing new functions as props to components on every render. This can be avoided by using `useCallback` or by defining the function outside of the component.

## Tools

### **Web**: Chrome Dev Tools > Performance

- Profiling in Chrome Dev Tools performance tab in the "Timing" section
- This will show various components and how long they took to render. It can be a little intense to dig through it all at first, but the more time you spend with it the easier it gets to separate the signal from noise.
- The timing information might be inaccurate in development mode since this slows things down a ton. However, it's still useful for seeing which things are re-rendering. You can also use the React DevTools Profiler to get more accurate timing information.

#### Steps to Profile:

1. **Open Chrome DevTools (`cmd+option+j`)**
   
2. **Capture Performance Data**
   - Open "Performance" tab
   - Press red record button in the top-left corner to start profiling
   - Perform the actions you want to profile
   - Press the red record button again to stop profiling
  
3. **Analyze the profile:**
   - Download the trace
   - Open [SpeedScope](https://www.speedscope.app/) and upload the trace
   - Analyze the trace

**Suggested reading:** [React Performance Profiling](https://calibreapp.com/blog/react-performance-profiling-optimization)

### **iOS & Android:** React Native DevTools

React Native uses the [Hermes](https://reactnative.dev/docs/hermes) JavaScript engine on both Android and iOS.

#### Steps to Profile with Hermes:

1. **Enable profiling:**
   - In the Metro bundler terminal, press `j` to open React Native DevTools
   - Select the instance of the app you want to connect to
   - Open "Settings"
   - Go to "Experiments" tab
   - Enable "[React Native] Enable Performance panel"
  
  Once it's done, you should have the "Performance" tab available in the React Native DevTools

2. **Capture Performance Data:**
   - Open "Performance" tab
   - Press red record button in the top-left corner to start profiling
   - Perform the actions you want to profile
   - Press the red record button again to stop profiling

3. **Analyze the profile:**
   - Download the trace
   - Open [SpeedScope](https://www.speedscope.app/) and upload the trace
   - Analyze the trace

https://github.com/user-attachments/assets/fe00da26-af07-4ea1-bd92-2dbe06c4bdad

#### Important Notes:
- For more accurate performance data, prefer release builds when possible
- The generated traces require symbolication to show meaningful function names in release builds

### React Native Release Profiler

For more advanced JavaScript profiling on native devices, [`react-native-release-profiler`](https://github.com/margelo/react-native-release-profiler) provides programmatic profiling capabilities that work on both development and release builds.

#### Setup:
The profiler is already integrated into our debugging console. See the [App README](https://github.com/Expensify/App?tab=readme-ov-file#release-profiler) for detailed setup instructions.

#### Steps to Profile:

1. **Start Profiling:**
   - Open the debugging console (four-finger tap)
   - Press "Record Troubleshoot Data"
   - Perform the actions you want to profile
   - Press "Record Troubleshoot Data" again

2. **Retrieve Profile:**
   - The profile is saved to the device's Documents folder

3. **Symbolicate Profile:**
   - Download source maps from the GitHub release. Each release contains source maps for Android, iOS and Web.
   - Copy the recorded profile to the root folder of the E/App repository
   - Copy the source maps to the specific paths:
     - **Android:** `android/app/build/generated/sourcemaps/react/productionRelease/` and rename file to `index.android.bundle.map`
     - **iOS:** root folder and rename file to `main.jsbundle.map`
     - **Web:** `dist` and run `npm run combine-web-sourcemaps` to generate merged sourcemaps
   - Run the appropriate symbolication command:
     ```bash
     # iOS
     npm run symbolicate-release:ios
     # Android
     npm run symbolicate-release:android
     # Web
     npm run symbolicate-release:web
     ```
   - This converts the raw profile into a format with readable function names

4. **Analyze:**
   - Upload the symbolicated profile to [Speedscope](https://www.speedscope.app/)
   - Or use Chrome DevTools Performance tab

### Flashlight

[Flashlight](https://github.com/bamlab/flashlight) is a tool for measuring React Native app performance with quantifiable metrics. It provides automated performance testing and can generate consistent baseline measurements.

#### Installation:
```bash
curl https://get.flashlight.dev | bash
```

#### Prerequisites:
- Android device
- Release build of the app (See #how-to-create-a-release-build-on-android)
- USB debugging enabled on the Android device
  - Go to Settings > Developer options > Enable USB debugging
  - If Developer options is not visible, go to Settings > About phone and tap "Build number" 7 times

#### Setup and Usage:

1. **Start the Flashlight measurement server:**
   ```bash
   flashlight measure
   ```

2. **Open your app and detect bundle ID:**
   - Open the app on the connected Android device
   - Press "Auto Detect" in the opened window

3. **Perform your test actions:**
   - Press "Start measuring"
   - Interact with your app: Navigate, scroll, or perform the actions you want to measure
   - Flashlight will collect performance metrics in real-time

4. **Stop measurement and view results:**
   - Press "Stop measuring"

You can run the same flow multiple times and record a measurements for each run. Once you download the report, you can later see an average results for all the runs.

https://github.com/user-attachments/assets/e024a1df-4b42-422e-affd-1c80a95dfe94

#### Comparing Results:

Flashlight excels at providing objective performance comparisons:

1. **Run baseline measurements** before making any optimizations
2. **Save measurement sessions**
3. **Run measurements after changes** using the same test flow
4. **Generate comparison report:**
   ```bash
   flashlight report baseline.json improvements.json
   ```
5. **Analyze deltas** - Flashlight shows performance differences between runs

**Best Practices:**
- Use consistent test flows across measurements
- Run multiple iterations for statistical accuracy
- Test on the same device and build configuration
- Document what changes were made between measurements

### React DevTools Profiler

The React DevTools Profiler provides React-specific performance insights and is more streamlined than general JavaScript profilers. It focuses specifically on component rendering performance and can help identify unnecessary re-renders.

#### Setup:
- **Web:** Built into React DevTools browser extension
- **Mobile:** Built-in - press `j` in Metro terminal to open React DevTools

#### Steps to Profile:

1. **Configure Settings:**
   - Open React DevTools and go to the Profiler tab
   - Click the settings icon
   - Enable "Record why each component rendered while profiling" for detailed insights
   - Optionally set "Hide commits below X ms" to focus on slow renders

2. **Capture React Performance:**
   - Click the red record button to start profiling
   - Perform the actions you want to analyze
   - Click stop to end the recording

3. **Analyze Results:**
   - Review the flame graph showing component render times
   - Use the timeline to identify slow commits
   - Click on components to see why they rendered
   - Look for components with high render times or frequent re-renders

https://github.com/user-attachments/assets/d1047706-1143-4860-9541-0487503b4041

#### Key Metrics to Focus On:
- **Commit duration:** Total time for a render cycle
- **Component render time:** Individual component performance
- **Render reasons:** Why components re-rendered (props change, state change, parent render)

#### Compare the results

When working with React Profiler, you can compare the results using [this tool](https://kacper-mikolajczak.github.io/rcc/). It will tell you the time and commit difference between two or more profiles.

**Suggested:** [Deep Dive with the React DevTools creator](https://www.youtube.com/watch?v=nySib7ipZdk)

### Tracking Re-renders

Understanding when and why components re-render is crucial for identifying performance bottlenecks. Several tools can help visualize and track component re-renders in real-time.

#### React DevTools Highlight Updates

React DevTools includes a built-in feature to visually highlight components when they re-render:

- Open React DevTools
- Go to "Settings" (gear icon)
- Under "General" tab, enable "Highlight updates when components render"
- Components will be highlighted with colored borders when they update

https://github.com/user-attachments/assets/4c3da04d-87a1-411f-a93b-2b146c115ad5

#### React Scan

[React Scan](https://github.com/aidenybai/react-scan) automatically detects and highlights performance issues in React applications without requiring installation:

**Usage:**
```bash
npx react-scan https://localhost:8082
```

https://github.com/user-attachments/assets/39e8514a-caac-4296-b837-b986e088fa9a

You need to have the web server running. The app will open in a separate browser window.

### Performance Metrics (Opt-In on local release builds)

To capture reliable performance metrics for native app launch, we must test against a release build. To make this easier for everyone to do, we created an opt-in tool (using [`react-native-performance`](https://github.com/oblador/react-native-performance)) that will capture metrics and display them in an alert once the app becomes interactive. To set this up, just set `CAPTURE_METRICS=true` in your `.env` file, then create a release build on iOS or Android. The metrics this tool shows are as follows:

- `nativeLaunch` - Total time for the native process to initialize
- `runJSBundle` - Total time to parse and execute the JS bundle
- `timeToInteractive` - Rough TTI (Time to Interactive). Includes native init time + sidebar UI partially loaded

#### How to create a Release Build on Android

- Create a keystore by running `keytool -genkey -v -keystore your_key_name.keystore -alias your_key_alias -keyalg RSA -keysize 2048 -validity 10000`
- Fill out all the prompts with any info and give it a password
- Drag the generated keystore to `/android/app`
- Hardcode the values to the gradle config like so:

```
signingConfigs {
        release {
            storeFile file('your_key_name.keystore')
            storePassword 'Password1'
            keyAlias 'your_key_alias'
            keyPassword 'Password1'
        }
}
```
- Delete any existing apps off emulator or device
- Run `react-native run-android --variant release`

## Example Performance Optimization Proposals

Here are examples of well-documented performance optimization proposals that demonstrate good practices for investigating, profiling, and fixing performance issues:

- [#65926 Do not render `ChatBubbleCell` when not displayed](https://github.com/Expensify/App/issues/65926#issue-3222509070)
- [#65789 Optimize `useSearchHighlightAndScroll`](https://github.com/Expensify/App/issues/65789#issue-3217069356)
- [#64774 Improve the `subscribeToKey` efficiency in Onyx](https://github.com/Expensify/App/issues/64774#issue-3169673669)
- [#67626 Migrate FlashList to 2.0](https://github.com/Expensify/App/issues/67626#issue-3283123603)

## Reconciliation

React is pretty smart and in many cases is able to tell if something needs to update. The process by which React goes about updating the UI is called reconciliation. If React thinks something needs to update, it will render it again. React also assumes that if a parent component rendered, then its child should also re-render.

Re-rendering can be expensive at times and when dealing with nested props or state React may render when it doesn't need to which can be wasteful. A good example of this is a component that is being passed an object as a prop. Let's say the component only requires one or two properties from that object in order to build its view, but doesn't care about some others. React will still re-render that component even if nothing it cares about has changed. Most of the time this is fine since reconciliation is pretty fast. But we might run into performance issues when re-rendering massive lists.

In this example, the most preferable solution would be to **only pass the properties that the object needs to know about** to the component in the first place.

Another option is to use `React.memo()` with a custom comparison function to prevent unnecessary re-renders.

React might still take some time to re-render a component when its parent component renders. If it takes a long time to re-render the child even though we have no props changing, then we can use `React.memo()` which will "shallow compare" the `props` to see if a component should re-render.

If you aren't sure what exactly is changing about some deeply nested object prop, you can use `Performance.diffObject()` in `React.memo()` method which should show you exactly what is changing from one update to the next.

**Suggested resource:** [React Docs - Preserving and Resetting state](https://react.dev/learn/preserving-and-resetting-state)

### Further Optimization and Validation

Once potential performance bottlenecks are identified, the next step is to optimize the code. Common areas to investigate for improvements include:

*   Components performing heavy calculations or processing large datasets.
*   Components subscribing directly to frequently changing data instead of receiving it as props from a parent.
*   Incorrect or inefficient use of memoization techniques (`React.memo`, `useMemo`, `useCallback`).
*   [Rendering of unnecessary or duplicated child components](#rendering-of-unnecessary-or-duplicated-child-components).

After implementing optimizations, it's crucial to validate the changes. Manual comparison of performance metrics can be tedious and prone to bias. It's highly recommended to use tools that allow for objective comparison of traces or metrics before and after changes. This helps in confirming actual performance gains and avoiding regressions in other areas.

The optimization process is often iterative. Small, incremental improvements can accumulate to significant overall gains. When proposing changes, aim for self-contained and predictable modifications to facilitate review and discussion.

Finally, before concluding an investigation, always validate improvements against real-world scenarios. This includes testing on different platforms and with various build configurations (e.g., production builds) to ensure the optimizations hold up in diverse environments. Remember that performance maintenance is a continuous effort, encompassing not just profiling but also adherence to code conventions and real user monitoring.

## Common performance bottlenecks
### Rendering of unnecessary or duplicated child components
Since our codebase is very complex, it results in a large DOM tree rendered for the user. This may become a potential performance issue if not handled carefully.

One of the most common issues is related to modals, popovers, and tooltips — elements that may appear on the screen. The problem is that they are usually present in the DOM tree even when initially invisible. Because of this, the initial render time of a screen may increase, ultimately slowing down the app.

The solution is better control of invisible elements, making sure they are not included in the first render. This can be done, e.g., by a simple `return null`, smart usage of `lazy loading`, the `useTransition` hook, or the `<Deferred />` component.

Another issue worth mentioning is unnecessary code execution, especially for elements that are never shown on a specific platform. In theory, we separate the logic between platforms by using index.tsx/index.native.tsx files, but sometimes platform-specific logic may slip in, causing unnecessary execution. For example, this may happen when logic specific to a wide layout (applicable only for web) is included.

The last common issue is related to the use of `return null`. Sometimes we already know in the parent component that a specific child should not be rendered. In such cases, we unnecessarily execute the child's internal logic (calling hooks, sending requests) only to find out that the whole process was redundant.

Examples:
- [Add shouldRender check in EducationalTooltip to avoid unnecessary calls](https://github.com/Expensify/App/pull/66052) - avoids rendering invisible components
- [Remove shouldAdjustScrollView to avoid heavy rerender](https://github.com/Expensify/App/pull/66849) - removes hooks that were called only for Safari logic slowing down the `ReportScreen.tsx`
- [PopoverWithMeasuredContent optimization for mobile](https://github.com/Expensify/App/pull/68223) - returns early to avoid unnecessary calculations
- [Reduce confirm modal initial render count](https://github.com/Expensify/App/pull/67518) - returns early to reduce first load cost
- [Do not render PopoverMenu until it gets opened](https://github.com/Expensify/App/pull/67877) - adds a wrapper to control if `PopoverMenu` should be rendered

# Proposing Performance Improvements

We are actively looking for contributions that improve the performance of the App, specifically regarding unnecessary re-renders, slow method executions, and user perceived latency.

If you haven't already, check out our [Contributing Guidelines](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md).

👉 **Before posting the proposal, please read through this whole process for important context and instructions.** Proposals that do not follow these guidelines cannot be accepted.

___

### Instructions for Submission
1.  Copy the template below.
2.  Fill out the details strictly following the guide.
3.  Post it in `#expensify-open-source` with the title `[Performance Proposal] <Component_Name>`.

___

```
# [Performance Proposal] <Component_Name>

## 1. Component and Flow Description

**Component/Flow:** Describe the specific UI component or user flow being optimized.
- [Add details here]

**Preconditions:** List any specific setup required before reproducing the steps (e.g., "Workspace must have chat history").
- [Add details here]

**Reproduction Steps:** Provide a numbered list of steps to reproduce the performance issue (similar to a QA test case).
- [Add details here]

## 2. Required Tools
*I have verified these metrics using (check all that apply):*
- [ ] React DevTools Profiler
- [ ] Chrome Performance Tab
- [ ] JS Flame charts
- [ ] Hermes / Release Profiler traces
- [ ] Sentry (If you have access)

## 3. Before/After Metrics
*Please fill out the metrics below. If a metric is not applicable, write N/A.*

*Perceived Latency:*
  - Before:
  - After:
  - Improvement:

*Device Used:* (e.g. iPhone 13, Pixel 6, Chrome on M1 Mac) - Note: Don't use CPU throttling for these measurements!
  - Device CPU: ___
  - Device RAM: ___
*Evidence:* (Attach screenshots of the profiler or logs for both Before and After below this section)*

## 4. Prerequisites & Eligibility
*To ensure proposals are measurable and based on realistic scenarios, you must meet the following criteria:*

- [ ] **Test Environment:** I tested on a high-traffic account (instructions to create this [here](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md#high-traffic-accounts)).
- [ ] **Thresholds:** My proposal reduces Perceived Latency by at least 100ms

## 5. Pattern Detection & Prevention
*Is the code logic being optimized something that should be prevented from being added to the app in the future (e.g., via an ESLint rule)?*
- [ ] Yes (Proposal: _________________)
- [ ] No (It's a valid pattern, just unoptimized here)

*Other*
- [ ] **App-wide Audit:** I have checked for other places in the app that have this same performance problem and fixed them.
- [ ] **Shared Refactor:** This fixes a shared utility/component (e.g., `Avatar.ts`) used across the app.
- [ ] **Localized Fix:** This only affects this specific view.


## 6. Automated Tests & QA
*Tests are required by default. If you cannot add them, explain why.*
- [ ] **Unit Tests:** Added to prevent regression.
- [ ] **Reassure Tests:** Added (Required for execution time improvements).
- [ ] **Exception:** I cannot add automated tests because: _________________
- [ ] **Manual Verification:** I have included manual verification steps (Required).

## 7. Other Considerations & UX Risks
*Performance improvements should not change user experience and product design.*
- [ ] This change preserves existing UX (No visual/behavioral changes).
- [ ] This change alters UX (Description: _________________).
```

---

### Compensation
* **Bounty:** Accepted and merged performance improvements are eligible for a flat **$250 bounty**.
* **Scope:** We prefer smaller, atomic PRs. However, if multiple proposals are submitted for closely related logic that could have been one PR, we reserve the right to consolidate them.

___

### Review Process
1.  **Peer Review:** Wait for **2 Expert Contributors** to approve your proposal.
2.  **Internal Review:** Once approved by experts, comment `Proposal ready for final review - cc: perf-review` in slack to notify Internal Engineers that the proposal is ready a final review.
    - Note: Internal Engineers can set up notifications for `perf-review` keyword as mentioned in [this Internal SO](https://stackoverflowteams.com/c/expensify/questions/23081/23082#23082).
3.  **Approval:** **2 Internal Engineers** must approve before a GH issue is created.
