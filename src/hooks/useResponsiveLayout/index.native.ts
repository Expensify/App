import ModalContext from '@components/Modal/ModalContext';

import useWindowDimensions from '@hooks/useWindowDimensions';

import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import NarrowPaneContext from '@libs/Navigation/AppNavigator/Navigators/NarrowPaneContext';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import {useContext} from 'react';

import type ResponsiveLayoutResult from './types';

/**
 * Hook to determine if we are on mobile devices or in the Modal Navigator. It also provides booleans for our breakpoints
 * Use "shouldUseNarrowLayout" for "on mobile or in RHP", "isSmallScreenWidth" for "on mobile", "isInNarrowPaneModal" for "in RHP".
 *
 * There are two kinds of modals in this app:
 *     1. Modal stack navigators from react-navigation
 *     2. Modal components that use react-native-reanimated
 *
 * This hook is designed to handle both. `shouldUseNarrowLayout` will return `true` if any of the following are true:
 *     1. The device screen width is narrow
 *     2. The consuming component is the child of a "right docked" react-native-reanimated component
 *     3. The consuming component is a screen in a modal stack navigator and not a child of a "non-right-docked" react-native-reanimated component.
 *
 * For more details on the various modal types we've defined for this app and implemented using react-native-reanimated, see `ModalType`.
 */
export default function useResponsiveLayout(): ResponsiveLayoutResult {
    const {windowWidth, windowHeight} = useWindowDimensions();
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);

    const isExtraSmallScreenHeight = windowHeight <= variables.extraSmallMobileResponsiveHeightBreakpoint;
    const isSmallScreenWidth = true;
    const isMediumScreenWidth = false;
    const isLargeScreenWidth = false;
    const isExtraLargeScreenWidth = false;
    const isExtraSmallScreenWidth = windowWidth <= variables.extraSmallMobileResponsiveWidthBreakpoint;
    const isSmallScreen = true;

    // we need to always take screen width into consideration, no matter the platform (with exception of landscape mode).
    const onboardingIsMediumOrLargerScreenWidth = !isInLandscapeMode && windowWidth > variables.mobileResponsiveWidthBreakpoint;

    // Note: activeModalType refers to our react-native-reanimated component wrapper, not react-navigation's modal stack navigators.
    // This means it will only be defined if the component calling this hook is a child of a modal component. See BaseModal for the provider.
    const {activeModalType} = useContext(ModalContext);

    // RN8: v7 detected "inside the RHP" via getParent(navigator id), but v8 removed navigator ids -
    // getParent(name) matches by route name and self-matches on the RightModalNavigator's own route.
    // Instead of relying on that alpha semantic, use NarrowPaneContext: RightModalNavigator provides
    // it around its screens (ScreenWrapper/BaseModal already consume it), and since the provider is
    // rendered below the navigator component itself, the navigator is naturally excluded.
    const {isInNarrowPane: isDisplayedInNarrowModalNavigator} = useContext(NarrowPaneContext);

    // The component calling this hook is in a "narrow pane modal" if:
    const isInNarrowPaneModal =
        // it's a child of the right-docked modal
        activeModalType === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED ||
        // or there's a "right modal navigator" or "left modal navigator" on the top of the root navigation stack
        // and the component calling this hook is not the child of another modal type, such as a confirm modal
        (isDisplayedInNarrowModalNavigator && !activeModalType);

    const shouldUseNarrowLayout = isSmallScreenWidth || isInNarrowPaneModal;

    return {
        shouldUseNarrowLayout,
        isSmallScreenWidth,
        isInNarrowPaneModal,
        isExtraSmallScreenHeight,
        isExtraSmallScreenWidth,
        isMediumScreenWidth,
        onboardingIsMediumOrLargerScreenWidth,
        isLargeScreenWidth,
        isSmallScreen,
        isExtraLargeScreenWidth,
        isInLandscapeMode,
    };
}
