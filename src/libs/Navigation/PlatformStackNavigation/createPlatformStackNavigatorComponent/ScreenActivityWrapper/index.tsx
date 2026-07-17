import useThemeStyles from '@hooks/useThemeStyles';

import Log from '@libs/Log';

import htmlDivElementRef from '@src/types/utils/htmlDivElementRef';

import React, {Activity, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type ScreenActivityWrapperProps from './types';

/**
 * Deprioritizes rendering of a blurred screen with React <Activity>. Unlike react-freeze, a hidden Activity keeps
 * processing state updates at background priority and runs effect cleanups when hiding, so a modal or popover that
 * is still dismissing when the screen gets blurred always finishes its close chain.
 *
 * A hidden Activity applies display none to its content, so hiding is deferred until the navigator has already
 * hidden the surrounding card. The sentinel view sits outside the Activity boundary and reflects the visibility of
 * the card itself. The stack navigator detaches a covered card (sets display none on it) only after the covering
 * transition completes, so observing the sentinel hides the content exactly when the navigator hides the card,
 * without timing heuristics. If the card ever becomes visible again while the screen is still blurred, the content
 * is restored the same way.
 */
function ScreenActivityWrapper({isScreenBlurred, routeKey, routeName, children}: ScreenActivityWrapperProps) {
    const styles = useThemeStyles();
    const sentinelRef = useRef<View>(null);
    const [isCardHidden, setIsCardHidden] = useState(false);

    useEffect(() => {
        const sentinel = htmlDivElementRef(sentinelRef).current;
        if (!sentinel || typeof IntersectionObserver === 'undefined') {
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            const entry = entries.at(-1);
            if (!entry) {
                return;
            }
            setIsCardHidden(!entry.isIntersecting);
        });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, []);

    const mode = isScreenBlurred && isCardHidden ? 'hidden' : 'visible';
    const previousModeRef = useRef<typeof mode | null>(null);

    useEffect(() => {
        if (previousModeRef.current === mode) {
            return;
        }

        const isFirstMount = previousModeRef.current === null;
        previousModeRef.current = mode;
        Log.info(`[ScreenActivityWrapper] ${isFirstMount ? 'Activity mounted' : 'Activity state changed'}`, false, {
            routeKey,
            routeName,
            mode,
        });
    }, [mode, routeKey, routeName]);

    return (
        <>
            <View
                ref={sentinelRef}
                style={styles.screenActivityWrapperSentinel}
            />
            <Activity mode={mode}>{children}</Activity>
        </>
    );
}

export default ScreenActivityWrapper;
