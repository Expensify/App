# Caller sweep

Lint sees where a read is written, never where a caller puts it. Condition 1's caller half is this.

Search with the Grep tool. In CI, `Bash` is allowed only for `gh pr diff`, `gh pr view` and `check-compiler.sh`, so a `grep` command is denied there, not empty. Never read a denial as "no callers".

## Forward: the diff adds `Onyx.get()`

1. Grep `src/` over `**/*.{ts,tsx}` for the reading function's name. Not exported: search its own file only.
2. Ignore the definition, the imports and the re-exports. The rest are call sites.
3. Classify each against the lists below. Render position is a failure: report it and name the caller, which is the thing to fix.
4. A call site inside a plain function is the next question, not a verdict. Repeat from step 1 with that name. Stop when every path ends at event position.

## Reverse: the diff adds a call, not a read

No Onyx call appears in the diff, so the call is the trigger.

1. Take each call the diff adds inside a component or a hook.
2. Grep the callee's file for `Onyx.get`.
3. A hit means step 3 of the forward sweep, on that call.

## Positions

Render, so a read reached from here fails condition 1:

- a component or hook body, at statement level
- a `useMemo` callback
- a `useOnyx` selector
- a `useState` or `useReducer` lazy initializer
- an IIFE or an array-method callback evaluated in the body
- a local function the body invokes, as in `MoneyRequestHeader.tsx`

Event, so a read here satisfies it:

- an action creator or library function with no render-position caller
- a `useEffect`, `useLayoutEffect` or `useFocusEffect` body
- a `useCallback` body that render does not invoke
- an event handler prop, and anything it calls
- a promise continuation, a timer or a network callback

`useCallback` and a prop handler cut both ways, since a component can invoke either during render. Read the body holding the call, not the wrapper.
