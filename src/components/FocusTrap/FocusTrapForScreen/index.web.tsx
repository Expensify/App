import {useIsFocused, useRoute} from '@react-navigation/native';
import FocusTrap from 'focus-trap-react';
import React, {useMemo} from 'react';
import BOTTOM_TAB_SCREENS from '@components/FocusTrap/BOTTOM_TAB_SCREENS';
import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import TOP_TAB_SCREENS from '@components/FocusTrap/TOP_TAB_SCREENS';
import WIDE_LAYOUT_INACTIVE_SCREENS from '@components/FocusTrap/WIDE_LAYOUT_INACTIVE_SCREENS';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type FocusTrapProps from './FocusTrapProps';

function FocusTrapForScreen({children}: FocusTrapProps) {
    const isFocused = useIsFocused();
    const route = useRoute();
    const {isSmallScreenWidth} = useWindowDimensions();

    const isActive = useMemo(() => {
        // Focus trap can't be active on bottom tab screens because it would block access to the tab bar.
        if (BOTTOM_TAB_SCREENS.find((screen) => screen === route.name)) {
            return false;
        }

        // in top tabs only focus trap for currently shown tab should be active
        if (TOP_TAB_SCREENS.find((screen) => screen === route.name)) {
            return isFocused;
        }

        // Focus trap can't be active on these screens if the layout is wide because they may be displayed side by side.
        if (WIDE_LAYOUT_INACTIVE_SCREENS.includes(route.name) && !isSmallScreenWidth) {
            return false;
        }
        return true;
    }, [isFocused, isSmallScreenWidth, route.name]);

    return (
        <FocusTrap
            active={isActive}
            paused={!isFocused}
            focusTrapOptions={{
                trapStack: sharedTrapStack,
                allowOutsideClick: true,
                fallbackFocus: document.body,
                delayInitialFocus: CONST.ANIMATED_TRANSITION,
                initialFocus: (focusTrapContainers) => {
                    const isFocusedElementInsideContainer = focusTrapContainers?.some((container) => container.contains(document.activeElement));
                    if (isFocusedElementInsideContainer) {
                        return false;
                    }
                    return undefined;
                },
                setReturnFocus: (element) => {
                    if (document.activeElement && document.activeElement !== document.body) {
                        return false;
                    }
                    return element;
                },
            }}
        >
            {children}
        </FocusTrap>
    );
}

FocusTrapForScreen.displayName = 'FocusTrapForScreen';

export default FocusTrapForScreen;
