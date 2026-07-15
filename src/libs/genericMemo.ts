import {memo} from 'react';

/**
 * `React.memo` typed to preserve a component's generic call signature.
 *
 * `React.memo` widens a generic function component to a non-generic `MemoExoticComponent`, which
 * erases the type parameters callers rely on. Casting the memo helper itself (once, here) lets
 * generic components be memoized at their export without a per-file `as typeof Component` cast.
 *
 * This is used to memoize generic components that OXC's React Compiler does not memoize on web
 * ("Unsupported declaration type for hoisting" on nested callbacks typed with the component's type
 * parameter), keeping parent-driven re-renders cheap on both platforms.
 */
const genericMemo = memo as <T>(component: T) => T;

export default genericMemo;
