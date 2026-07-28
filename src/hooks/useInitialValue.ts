import {useState} from 'react';

// In some places we set initial value on first render, but we don't want to re-run the function
// This hook will memoize the initial value and return that without setter, so it's never changed
// https://github.com/Expensify/App/pull/29643#issuecomment-1765894078
export default function useInitialValue<T>(initialStateFunc: () => T) {
    const [initialValue] = useState(initialStateFunc);
    return initialValue;
}
