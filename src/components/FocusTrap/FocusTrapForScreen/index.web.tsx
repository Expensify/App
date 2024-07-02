import {useFocusEffect, useIsFocused, useRoute} from '@react-navigation/native';
import FocusTrap from 'focus-trap-react';
import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import BOTTOM_TAB_SCREENS from '@components/FocusTrap/BOTTOM_TAB_SCREENS';
import getScreenWithAutofocus from '@components/FocusTrap/SCREENS_WITH_AUTOFOCUS';
import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import TOP_TAB_SCREENS from '@components/FocusTrap/TOP_TAB_SCREENS';
import WIDE_LAYOUT_INACTIVE_SCREENS from '@components/FocusTrap/WIDE_LAYOUT_INACTIVE_SCREENS';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ONYXKEYS from '@src/ONYXKEYS';
import type FocusTrapProps from './FocusTrapProps';

let activeRouteName = '';
function FocusTrapForScreen({children}: FocusTrapProps) {
    const isFocused = useIsFocused();
    const route = useRoute();
    const {isSmallScreenWidth} = useWindowDimensions();
    const [isAuthenticated] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => !!session?.authToken});
    const screensWithAutofocus = useMemo(() => getScreenWithAutofocus(!!isAuthenticated), [isAuthenticated]);

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

    useFocusEffect(
        useCallback(() => {
            activeRouteName = route.name;
        }, [route]),
    );

    return (
        <FocusTrap
            active={isActive}
            paused={!isFocused}
            focusTrapOptions={{
                trapStack: sharedTrapStack,
                allowOutsideClick: true,
                fallbackFocus: document.body,
                // We don't want to ovverride autofocus on these screens.
                initialFocus: () => {
                    if (screensWithAutofocus.includes(activeRouteName)) {
                        return false;
                    }
                    return undefined;
                },
                setReturnFocus: (element) => {
                    if (screensWithAutofocus.includes(activeRouteName)) {
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
