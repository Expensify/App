import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';

import CONST from '@src/CONST';

import type {ParamListBase} from '@react-navigation/native';

import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';

/** Like `useIsFocused`, but the returned flag turns OFF only once the navigation transition has finished, not at the start of navigating away. */
function useIsFocusedUntilTransitionEnd(): boolean {
    const isFocused = useIsFocused();
    const navigation = useNavigation<PlatformStackNavigationProp<ParamListBase>>();

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

        // On iOS the `transitionEnd` event is sometimes not emitted (the same flakiness ScreenWrapper and
        // useAutoFocusInput guard against). Without a fallback, `didTransitionOut` would stay false forever
        // and the consumer would never unmount, so use a timeout as a safety net.
        const timeout = setTimeout(() => setDidTransitionOut(true), CONST.SCREEN_TRANSITION_END_TIMEOUT);

        const unsubscribe = navigation.addListener('transitionEnd', () => {
            clearTimeout(timeout);
            setDidTransitionOut(true);
        });

        return () => {
            clearTimeout(timeout);
            unsubscribe();
        };
    }, [isFocused, navigation]);

    return isFocused || !didTransitionOut;
}

export default useIsFocusedUntilTransitionEnd;
