import useThemeStyles from '@hooks/useThemeStyles';

import Log from '@libs/Log';
import CustomViewWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper';

import {useIsFocused} from '@react-navigation/native';
import React, {Activity, useEffect, useRef} from 'react';

import type ScreenActivityWrapperProps from './types';

/**
 * Deprioritizes rendering of a blurred screen with React <Activity>. Unlike react-freeze, a hidden Activity keeps
 * processing state updates at background priority and runs effect cleanups when hiding. A modal or popover that is
 * still dismissing when the screen gets blurred always finishes its close chain, so no freeze delay and no modal
 * coordination are needed here.
 *
 * A screen hides when it is covered inside its own navigator (blurred) or when the whole navigator lost focus to
 * another route higher in the tree - useIsFocused is chain-aware, so e.g. the search expense list hides while an
 * RHP is open on top of it.
 */
function ScreenActivityWrapper({isScreenBlurred, routeKey, routeName, children}: ScreenActivityWrapperProps) {
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const mode = isScreenBlurred || !isFocused ? 'hidden' : 'visible';
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

    // A hidden Activity hides its content through the same mechanism as a suspended tree, so CustomViewWrapper
    // keeps the content painted and the underlay screen stays visible during swipe-back gestures.
    return (
        <Activity mode={mode}>
            <CustomViewWrapper style={styles.flex1}>{children}</CustomViewWrapper>
        </Activity>
    );
}

export default ScreenActivityWrapper;
