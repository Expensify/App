import {useFocusEffect, useIsFocused, useRoute} from '@react-navigation/native';
import FocusTrapOriginal from 'focus-trap-react';
import React, {useMemo, useRef} from 'react';
import BOTTOM_TAB_SCREENS from '@components/FocusTrap/BOTTOM_TAB_SCREENS';
import SCREENS_WITH_AUTOFOCUS from '@components/FocusTrap/SCREENS_WITH_AUTOFOCUS';
import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import WIDE_LAYOUT_INACTIVE_SCREENS from '@components/FocusTrap/WIDE_LAYOUT_INACTIVE_SCREENS';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type FocusTrapProps from './FocusTrapProps';

let activeRouteName = '';

function FocusTrap({children}: FocusTrapProps) {
    const isFocused = useIsFocused();
    const route = useRoute();
    const {isSmallScreenWidth} = useWindowDimensions();

    const isActive = useMemo(() => {
        // Focus trap can't be active on bottom tab screens because it would block access to the tab bar.
        if (BOTTOM_TAB_SCREENS.includes(route.name)) {
            return false;
        }

        // Focus trap can't be active on these screens if the layout is wide because they may be displayed side by side.
        if (WIDE_LAYOUT_INACTIVE_SCREENS.includes(route.name) && !isSmallScreenWidth) {
            return false;
        }
        return true;
    }, [isSmallScreenWidth, route]);

    useFocusEffect(() => {
        activeRouteName = route.name;
    });

    const focusTrapRef = useRef<FocusTrapOriginal | null>(null);

    return (
        <FocusTrapOriginal
            ref={focusTrapRef}
            active={isActive}
            paused={!isFocused}
            focusTrapOptions={{
                trapStack: sharedTrapStack,
                allowOutsideClick: true,
                fallbackFocus: document.body,
                // We don't want to ovverride autofocus on these screens.
                initialFocus: () => {
                    if (SCREENS_WITH_AUTOFOCUS.includes(activeRouteName)) {
                        return false;
                    }
                    return undefined;
                },
                setReturnFocus: (element) => {
                    if (SCREENS_WITH_AUTOFOCUS.includes(activeRouteName)) {
                        return false;
                    }
                    return element;
                },
            }}
        >
            {children}
        </FocusTrapOriginal>
    );
}

FocusTrap.displayName = 'FocusTrapView';

export default FocusTrap;
