/**
 * Moves the back button of a header into the vertical bar of a foldable iPhone, where UIKit keeps the back button of a
 * navigation bar: at the top, under the status items.
 */
import ModalContext from '@components/Modal/ModalContext';

import useIsInSidePanel from '@hooks/useIsInSidePanel';

import useIsTabBarVertical from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useIsTabBarVertical';
import {addVerticalBarBackButton} from '@libs/Navigation/verticalBarHost';

import {NavigationContext} from '@react-navigation/native';
import {useContext, useEffect, useEffectEvent} from 'react';

import type UseVerticalBarBackButton from './types';

const useVerticalBarBackButton: UseVerticalBarBackButton = (goBack, shouldShowBackButton = true) => {
    // useNavigation() throws outside a navigator, and headers are rendered there too, so read the context, which is then empty.
    const screenNavigation = useContext(NavigationContext);
    const hasVerticalBar = useIsTabBarVertical();
    // A modal covers the screen and its bars, so a button there could not be reached.
    const isInModal = !useContext(ModalContext).default;
    // The side panel is not a screen with a bar of its own, so a header in it keeps its button.
    const isInSidePanel = useIsInSidePanel();
    const isInVerticalBar = shouldShowBackButton && hasVerticalBar && !isInModal && !isInSidePanel && !!screenNavigation;
    // The handler gets a new identity on most renders. Read through an effect event, a press runs the latest one
    // without the button being handed over again each time.
    const pressBackButton = useEffectEvent(goBack);

    // Not useLayoutEffect: a covered screen is frozen and loses its layout effects, so the button would blink on return.
    useEffect(() => {
        if (!isInVerticalBar || !screenNavigation) {
            return;
        }
        return addVerticalBarBackButton(screenNavigation, () => pressBackButton());
    }, [isInVerticalBar, screenNavigation]);

    return isInVerticalBar;
};

export default useVerticalBarBackButton;
