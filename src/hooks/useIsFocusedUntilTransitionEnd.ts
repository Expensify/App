import type {ParamListBase} from '@react-navigation/native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';

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

        // Flip "transitioned out" only after this screen's own closing transition finishes. The global
        // transition tracker was racy — it could resolve before the animation ended and unmount content
        // mid-transition (a visible blink). A screen's own `transitionEnd` event fires only once its
        // animation truly completes.
        const unsubscribe = navigation.addListener('transitionEnd', () => setDidTransitionOut(true));
        return unsubscribe;
    }, [isFocused, navigation]);

    return isFocused || !didTransitionOut;
}

export default useIsFocusedUntilTransitionEnd;
