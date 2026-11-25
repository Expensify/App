/**
 * Moves the back button of a header into the vertical bar of a foldable iPhone, where UIKit keeps the back button of a
 * navigation bar: at the top, under the status items.
 */
import ModalContext from '@components/Modal/ModalContext';

import useIsTabBarVertical from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useIsTabBarVertical';
import {addVerticalBarBackButton} from '@libs/Navigation/verticalBarHost';

import {NavigationContext} from '@react-navigation/native';
import {useContext, useEffect, useEffectEvent} from 'react';

import type UseVerticalBarBackButton from './types';

const useVerticalBarBackButton: UseVerticalBarBackButton = (goBack, shouldShowBackButton = true) => {
    // Headers are also rendered outside a navigator, so the navigation is read from the context, which may be empty.
    const screenNavigation = useContext(NavigationContext);
    const hasVerticalBar = useIsTabBarVertical();
    // A modal covers the screen and its bars, so a button there could not be reached.
    const isInModal = !useContext(ModalContext).default;
    const isInVerticalBar = shouldShowBackButton && hasVerticalBar && !isInModal && !!screenNavigation;
    // The handler gets a new identity on most renders. Read through an effect event, a press runs the latest one
    // without the button being handed over again each time.
    const pressBackButton = useEffectEvent(goBack);

    // A screen that is covered is frozen, which takes its layout effects away until it is shown again. This effect
    // stays, so the header keeps its part in the button, and the button is there as soon as the screen is uncovered.
    useEffect(() => {
        if (!isInVerticalBar || !screenNavigation) {
            return;
        }
        return addVerticalBarBackButton(screenNavigation, () => pressBackButton());
    }, [isInVerticalBar, screenNavigation]);

    return isInVerticalBar;
};

export default useVerticalBarBackButton;
