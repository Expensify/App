# React Performance Tips

### General Performance Considerations

When investigating performance issues, it's crucial to understand the underlying principles and common pitfalls.

#### Understanding Performance Issues

Performance issues often manifest as slow rendering or unresponsiveness. The goal of performance investigation is to identify the root cause of these regressions and measure their impact on the system. Key metrics to consider typically include:

*   **Resource Consumption:** CPU, RAM, network, storage, and battery usage.
*   **Responsiveness:** Frames per second (FPS) and Time to Interactive (TTI).
*   **Thread Usage:** JavaScript and native thread activity.
*   **React Pipeline:** The number and volume of component renders.

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

- Always test performance with the production build as development mode is not optimized.
- Use [`React.memo`](https://react.dev/reference/react/memo), [`useMemo`](https://react.dev/reference/react/useMemo), and [`useCallback`](https://react.dev/reference/react/useCallback) to prevent expensive re-renders.
- Using a combination of [React DevTools Profiler](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) and [Chrome Dev Tools Performance Timing](https://calibreapp.com/blog/react-performance-profiling-optimization) can help identify unnecessary re-renders. Both tools can be used to time an interaction like the app starting up or navigating to a new screen.
- Watch out for [very large lists](https://reactnative.dev/docs/optimizing-flatlist-configuration) and things like `Image` components re-fetching images on render when a remote uri did not change.
- Avoid the temptation to over-optimize. There is added cost in both code complexity and performance when using memoization hooks like `useMemo` and `useCallback`. Be selective about when you use them and make sure there is a measurable difference before proposing the change. As a very general rule, it should be measurably faster to run the memoized logic than it would be to let React re-render the component without any extra intervention from us.
- Use caution when adding subscriptions that might re-render very large trees of components e.g. subscribing to state that changes often (current report, current route, etc) in the app root.
- Avoid passing new functions as props to components on every render. This can be avoided by using `useCallback` or by defining the function outside of the component.

## Tools

### Chrome Dev Tools > Performance > Timing (Web Only)

- Profiling in Chrome Dev Tools performance tab in the "Timing" section
- This will show various components and how long they took to render. It can be a little intense to dig through it all at first, but the more time you spend with it the easier it gets to separate the signal from noise.
- The timing information might be inaccurate in development mode since this slows things down a ton. However, it's still useful for seeing which things are re-rendering. You can also use the React DevTools Profiler to get more accurate timing information.

**Suggested:** [React Performance Profiling](https://calibreapp.com/blog/react-performance-profiling-optimization)

### Hermes Profiling

It's possible, but slightly trickier to profile the JS running on Android devices as it does not run in a browser but a JS VM that React Native must spin up first then run the app code. The VM we are currently using on both Android and iOS is called [Hermes](https://reactnative.dev/docs/profile-hermes) and is developed by Facebook.

In order to profile with Hermes, follow these steps:

- In the metro bundler window, press `d` on your keyboard to bring up the developer menu on your device.
- Select "Settings"
- Select "Start Sampling Profiler on Init"
- In metro bundler, refresh by pressing r
- The app will start up and a profile will begin
- Once the app loads take whatever action you want to profile
- Press `d` again and select "Disable Sampling Profiler". You can also use the "Performance" tab in the Chrome DevTools to start and stop profiling.
- A toast should appear with a path to a profile
- We need to then convert this into something Chrome Dev Tools can use by typing into terminal `react-native profile-hermes .`
- This should create a json file in the directory where we typed the previous command that we can load up into Chrome Dev Tools "Performance" tab via the "Load Profile" option and inspect further.

### React DevTools Profiler
- The React DevTools Profiler can also be used to detect similar information to Chrome Dev Tools, but is a little more streamlined. There is also an options cog where you can filter events by cutting at a specified millisecond (length it took for the thing to happen)
- Try checking the option to "Record why each component rendered while profiling". This may provide insights into why the component rendered unnecessarily.

**Suggested:** [Deep Dive with the React DevTools creator](https://www.youtube.com/watch?v=nySib7ipZdk)

### Why Did You Render?
- Why Did You Render (WDYR) sends console notifications about potentially avoidable component re-renders.
- It can also help to simply track when and why a certain component re-renders.
- To enable it, set `USE_WDYR=true` in your `.env` file.
- You can add or exclude tracked components by their `displayName` in `wdyr.js`.
- Open the browser console to see WDYR notifications.

**Suggested** [Why Did You Render docs](https://github.com/welldone-software/why-did-you-render)

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

## Reconciliation

React is pretty smart and in many cases is able to tell if something needs to update. The process by which React goes about updating the UI is called reconciliation. If React thinks something needs to update, it will render it again. React also assumes that if a parent component rendered, then its child should also re-render.

Re-rendering can be expensive at times and when dealing with nested props or state React may render when it doesn't need to which can be wasteful. A good example of this is a component that is being passed an object as a prop. Let's say the component only requires one or two properties from that object in order to build its view, but doesn't care about some others. React will still re-render that component even if nothing it cares about has changed. Most of the time this is fine since reconciliation is pretty fast. But we might run into performance issues when re-rendering massive lists.

In this example, the most preferable solution would be to **only pass the properties that the object needs to know about** to the component in the first place.

Another option would be to use `React.memo()` to add more specific rules comparing `props` to **explicitly  tell React not to perform a re-render**.

React might still take some time to re-render a component when its parent component renders. If it takes a long time to re-render the child even though we have no props changing, then we can use `React.memo()` which will "shallow compare" the `props` to see if a component should re-render.

If you aren't sure what exactly is changing about some deeply nested object prop, you can use `Performance.diffObject()` in `React.memo()` method which should show you exactly what is changing from one update to the next.

**Suggested:** [React Docs - Preserving and Resetting state](https://react.dev/learn/preserving-and-resetting-state)

### Further Optimization and Validation

Once potential performance bottlenecks are identified, the next step is to optimize the code. Common areas to investigate for improvements include:

*   Components performing heavy calculations or processing large datasets.
*   Components subscribing directly to frequently changing data instead of receiving it as props from a parent.
*   Incorrect or inefficient use of memoization techniques (`React.memo`, `useMemo`, `useCallback`).
*   Rendering of unnecessary or duplicated child components.

After implementing optimizations, it's crucial to validate the changes. Manual comparison of performance metrics can be tedious and prone to bias. It's highly recommended to use tools that allow for objective comparison of traces or metrics before and after changes. This helps in confirming actual performance gains and avoiding regressions in other areas.

The optimization process is often iterative. Small, incremental improvements can accumulate to significant overall gains. When proposing changes, aim for self-contained and predictable modifications to facilitate review and discussion.

Finally, before concluding an investigation, always validate improvements against real-world scenarios. This includes testing on different platforms and with various build configurations (e.g., production builds) to ensure the optimizations hold up in diverse environments. Remember that performance maintenance is a continuous effort, encompassing not just profiling but also adherence to code conventions and real user monitoring.
