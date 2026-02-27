import {useIsFocused, useRoute} from '@react-navigation/native';
import {FocusTrap} from 'focus-trap-react';
import React, {useMemo} from 'react';
import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import TOP_TAB_SCREENS from '@components/FocusTrap/TOP_TAB_SCREENS';
import WIDE_LAYOUT_INACTIVE_SCREENS from '@components/FocusTrap/WIDE_LAYOUT_INACTIVE_SCREENS';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {isSidebarScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import CONST from '@src/CONST';
import type FocusTrapProps from './FocusTrapProps';

function FocusTrapForScreen({children, focusTrapSettings}: FocusTrapProps) {
    const isFocused = useIsFocused();
    const route = useRoute();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const isActive = useMemo(() => {
        if (typeof focusTrapSettings?.active !== 'undefined') {
            return focusTrapSettings.active;
        }
        // Focus trap can't be active on sidebar screens because it would block access to the tab bar.
        if (isSidebarScreenName(route.name)) {
            return false;
        }

        // in top tabs only focus trap for currently shown tab should be active
        if (TOP_TAB_SCREENS.find((screen) => screen === route.name)) {
            return isFocused;
        }

        // Focus trap can't be active on these screens if the layout is wide because they may be displayed side by side.
        if (WIDE_LAYOUT_INACTIVE_SCREENS.includes(route.name) && !shouldUseNarrowLayout) {
            return false;
        }
        return isFocused;
    }, [isFocused, shouldUseNarrowLayout, route.name, focusTrapSettings?.active]);

    return (
        <FocusTrap
            active={isActive}
            paused={!isFocused}
            containerElements={focusTrapSettings?.containerElements?.length ? focusTrapSettings.containerElements : undefined}
            focusTrapOptions={{
                onActivate: () => {
                    const activeElement = document?.activeElement as HTMLElement;
                    if (activeElement?.nodeName === CONST.ELEMENT_NAME.INPUT || activeElement?.nodeName === CONST.ELEMENT_NAME.TEXTAREA) {
                        return;
                    }
                    activeElement?.blur();
                },
                trapStack: sharedTrapStack,
                allowOutsideClick: true,
                // Clicking outside should break the trap so side panel can remain interactive.
                clickOutsideDeactivates: true,
                fallbackFocus: document.body,
                delayInitialFocus: CONST.ANIMATED_TRANSITION,
                initialFocus: false,
                setReturnFocus: false,
                ...(focusTrapSettings?.focusTrapOptions ?? {}),
            }}
        >
            {children}
        </FocusTrap>
    );
}

export default FocusTrapForScreen;
