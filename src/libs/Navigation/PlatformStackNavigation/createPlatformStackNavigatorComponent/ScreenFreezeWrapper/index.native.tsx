import React, {useLayoutEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {Freeze} from 'react-freeze';
import {NativeComponentRegistry} from 'react-native';
import type {ViewStyle} from 'react-native';
// @ts-expect-error No declaration file for this internal React Native module
import ReactNativeStyleAttributes from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';
import useThemeStyles from '@hooks/useThemeStyles';
import type ScreenFreezeWrapperProps from './types';

// Delay freezing long enough for screen transition and modal/popover dismiss
// animations to complete. On mobile, freezing a screen while an animation
// is still in flight (e.g. a popover closing or a swipe-back gesture finishing)
// blocks React rendering and can cause the app to become unresponsive.
const FREEZE_DELAY_MS = 500;

type NativeComponentRegistryParams = Parameters<typeof NativeComponentRegistry.get<PropsWithChildren<{style: ViewStyle}>>>;
type ViewConfigProvider = NativeComponentRegistryParams[1];

const VIEW_CONFIG = {
    uiViewClassName: 'RCTView',
    validAttributes: {
        style: {
            ...(ReactNativeStyleAttributes as Record<string, unknown>),
            display: {
                process: () => 'contents',
            },
        },
    },
} as ReturnType<ViewConfigProvider>;

// Keeps the underlay screen visible during swipe-back gestures on mobile,
// preventing a blank screen flash while navigating between screens.
// Uses internal RN APIs (NativeComponentRegistry, ReactNativeStyleAttributes) — validated with RN 0.83.1. Re-verify after upgrades.
const CustomViewWrapper = NativeComponentRegistry.get<PropsWithChildren<{style: ViewStyle}>>('CustomViewWrapper', () => VIEW_CONFIG);

function ScreenFreezeWrapper({isScreenBlurred, children}: ScreenFreezeWrapperProps) {
    const [frozen, setFrozen] = useState(false);
    const styles = useThemeStyles();

    // Decouple the Suspense render task so it won't be interrupted by React's concurrent mode
    // and stuck in an infinite loop
    useLayoutEffect(() => {
        // When unfreezing, always apply immediately so the screen is visible right away.
        if (!isScreenBlurred) {
            // Synchronous unfreeze is intentional; the early return prevents infinite loops since
            // isScreenBlurred is the only dependency and won't change as a result of this setState.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFrozen(false);
            return;
        }

        let rafID: number;
        // Wait for FREEZE_DELAY_MS, then schedule the state update after the next
        // frame paint so transitional UI states are fully flushed before suspending.
        const id = setTimeout(() => {
            rafID = requestAnimationFrame(() => setFrozen(true));
        }, FREEZE_DELAY_MS);
        return () => {
            clearTimeout(id);
            cancelAnimationFrame(rafID);
        };
    }, [isScreenBlurred]);

    return (
        <Freeze freeze={frozen}>
            <CustomViewWrapper style={styles.flex1}>{children}</CustomViewWrapper>
        </Freeze>
    );
}

export default ScreenFreezeWrapper;
