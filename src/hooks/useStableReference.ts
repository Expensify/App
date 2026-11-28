import {useState} from 'react';

/** Returns the previous reference while `isEqual` says the new value equals it. */
function useStableReference<T>(value: T, isEqual: (previous: T, next: T) => boolean): T {
    const [stable, setStable] = useState<T>(value);
    const isUnchanged = isEqual(stable, value);

    if (!isUnchanged) {
        setStable(value);
    }

    return isUnchanged ? stable : value;
}

export default useStableReference;
