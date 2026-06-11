import {useIsFocused} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import Navigation from '@libs/Navigation/Navigation';

/** Like `useIsFocused`, but the returned flag turns OFF only once the navigation transition has finished, not at the start of navigating away. */
function useIsFocusedUntilTransitionEnd(): boolean {
    const isFocused = useIsFocused();

    const [didTransitionOut, setDidTransitionOut] = useState(false);

    const [prevIsFocused, setPrevIsFocused] = useState(isFocused);
    if (prevIsFocused !== isFocused) {
        setPrevIsFocused(isFocused);
        setDidTransitionOut(false);
    }

    useEffect(() => {
        if (isFocused) {
            return;
        }

        const handle = Navigation.runAfterUpcomingTransition(() => setDidTransitionOut(true));
        return () => handle.cancel();
    }, [isFocused]);

    return isFocused || !didTransitionOut;
}

export default useIsFocusedUntilTransitionEnd;
