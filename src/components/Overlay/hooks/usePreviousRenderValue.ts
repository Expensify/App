import {useState} from 'react';

function usePreviousRenderValue<T>(value: T): T | undefined;
function usePreviousRenderValue<T>(value: T, initial: T): T;
function usePreviousRenderValue<T>(value: T, initial?: T): T | undefined {
    const [tracking, setTracking] = useState<{previous: T | undefined; current: T}>(() => ({previous: initial, current: value}));
    if (!Object.is(tracking.current, value)) {
        setTracking({previous: tracking.current, current: value});
        return tracking.current;
    }
    return tracking.previous;
}

export default usePreviousRenderValue;
