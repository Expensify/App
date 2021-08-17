# React Performance Tips

- Always test performance with the production build as development mode is not optimized.
- Use [`PureComponent`](https://reactjs.org/docs/react-api.html#reactpurecomponent), [`React.memo()`](https://reactjs.org/docs/react-api.html#reactmemo), and [`shouldComponentUpdate()`](https://reactjs.org/docs/react-component.html#shouldcomponentupdate) to prevent re-rendering expensive components.
- Using a combination of [React DevTools Profiler](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) and [Chrome Dev Tools Performance Timing](https://calibreapp.com/blog/react-performance-profiling-optimization) can help identify unnecessary re-renders. Both tools can be used to time an interaction like the app starting up or navigating to a new screen.
- Watch out for [very large lists](https://reactnative.dev/docs/optimizing-flatlist-configuration) and things like `Image` components re-fetching images on render when a remote uri did not change.
- Avoid the temptation to over-optimize. There is added cost in both code complexity and performance when adding checks like `shouldComponentUpdate()`. Be selective about when you use this and make sure there is a measureable difference before proposing the change. As a very general rule it should be measurably faster to run logic to avoid the re-render (e.g. do a deep comparison) than it would be to let React take care of it without any extra intervention from us.
- Use caution when adding subscriptions that might re-render very large trees of components e.g. subscribing to state that changes often (current report, current route, etc) in the app root.
- Avoid using arrow function callbacks in components that are expensive to re-render. React will re-render this component since each time the parent renders it creates a new instance of that function. **Alternative:** Bind the method in the constructor instead.

## Tools

### Chrome Dev Tools > Performance > Timing

- Profiling in Chrome Dev Tools performance tab in the "Timing" section
- This will show various components and how long they took to render. It can be a little intense to dig through it all at first, but the more time you spend with it the easier it gets to separate the signal from noise.
- The timing information might be inaccurate in development mode since this slows things down a ton. However, it's still useful for seeing which things take the longest and it's not too difficult to look and see which things are re-rendering.

**Suggested:** [React Performance Profiling](https://calibreapp.com/blog/react-performance-profiling-optimization)

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

To capture reliable performance metrics for native app launch we must test against a release build. To make this easier for everyone to do we created an opt-in tool (using [`react-native-performance`](https://github.com/oblador/react-native-performance) that will capture metrics and display them in an alert once the app becomes interactive. To set this up just set `CAPTURE_METRICS=true` in your `.env` file then create a release build on iOS or Android. The metrics this tool shows are as follows:

- `nativeLaunch` - Total time for the native process to intialize
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
```
- Delete any existing apps off emulator or device
- Run `react-native run-android --variant release`

## Reconciliation

React is pretty smart and in many cases is able to tell if something needs to update. The process by which React goes about updating the "tree" or view heirarchy is called reconciliation. If React thinks something needs to update it will render it again. React also assumes that if a parent component rendered then it's child should also re-render.

Re-rendering can be expensive at times and when dealing with nested props or state React may render when it doesn't need to which can be wasteful. A good example of this is a component that is being passed an object as a prop. Let's say the component only requires one or two properties from that object in order to build it's view, but doesn't care about some others. React will still re-render that component even if nothing it cares about has changed. Most of the time this is fine since reconciliation is pretty fast. But we might run into performance issues when re-rendering massive lists.

In this example, the most preferable solution would be to **only pass the properties that the object needs to know about** to the component in the first place.

Another option would be to use `shouldComponentUpdate` or `React.memo()` to add more specific rules comparing `props` to **explicitly  tell React not to perform a re-render**.

React might still take some time to re-render a component when it's parent component renders. If it takes a long time to re-render the child even though we have no props changing then we can use `PureComponent` or `React.memo()` (without a callback) which will "shallow compare" the `props` to see if a component should re-render.

If you aren't sure what exactly is changing about some deeply nested object prop you can use `Performance.diffObject()` method in `componentDidUpdate()` which should show you exactly what is changing from one update to the next.

**Suggested:** [React Docs - Reconciliation](https://reactjs.org/docs/reconciliation.html)
