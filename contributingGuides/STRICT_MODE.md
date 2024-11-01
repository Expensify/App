# Usage of react concurrent mode and StrictMode
## Concurrent react
This App is rendered using react concurrent mode, which is the direction that React seems to be moving.

Concurrent mode enables a lot of new behaviours in react, most importantly renders can be interrupted by React, re-run or run more than once. This is supposed to make react more performant and webapps more responsive to user actions.

Further reading:
 - [What is Concurrent React](https://react.dev/blog/2022/03/29/react-v18#what-is-concurrent-react)

## StrictMode
Because the previously described concurrent mode could potentially introduce new bugs in the code (related to parallel rendering) we are using `<StrictMode />`.
This is a recommendation from React team as per react official docs.

`<StrictMode>` is a component that wraps the whole App in (or parts of App) and it runs extra checks and extra behaviors only in dev. So in essence this is a developer tool.

### Temporarily disabling StrictMode for dev
Strict mode *by default always* wraps entire Expensify App component tree. This happens in `src/App.tsx`.

However, it might happen you want to temporarily disable `StrictMode` when developing, to verify that your code behaves properly.

To do that:
 - go to `src/CONFIG.ts`
 - set `USE_REACT_STRICT_MODE_IN_DEV` flag to `false`

_Important note_: this ☝️flag is strictly for developers. It does not affect production builds of React.  
StrictMode is supposed to always wrap your App regardless of environment, and it will simply do nothing when run on production react build.
Only use this flag for local development and testing, but do not make it depending on `NODE_ENV` or any other env vars.

### Common StrictMode pitfalls
 - every component will go through: `mount -> unmount -> mount` on first app render
 - any code running inside `useEffect(() => {...}, [])` that would be expected to run once on initial render, will run twice, this might include initial api calls

#### Example: How StrictMode Affects AuthScreen
In AuthScreen, we have a typical pattern where certain logic is executed during mounting and unmounting, this is what happen after a refresh:
- Mounting: it runs `ReconnectApp`.
- Unmounting: AuthScreen cleans up data.
- Re-mounting Due to StrictMode: This behavior will cause `OpenApp` to be executed on the new mount.

Impact: This double execution could lead to unnecessary API calls or unexpected states.

Sources:
 - [StrictMode docs](https://react.dev/reference/react/StrictMode)
 - [StrictMode recommended usage](https://react.dev/reference/react/StrictMode)
 - [Original PR introducing this feature](https://github.com/Expensify/App/pull/42592)