import {useContext} from 'react';
import ModalContext from '@components/Modal/ModalContext';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import useRootNavigationState from './useRootNavigationState';
import useWindowDimensions from './useWindowDimensions';

type ResponsiveLayoutResult = {
    shouldUseNarrowLayout: boolean;
    isSmallScreenWidth: boolean;
    isInNarrowPaneModal: boolean;
    isExtraSmallScreenHeight: boolean;
    isMediumScreenWidth: boolean;
    isLargeScreenWidth: boolean;
    isExtraSmallScreenWidth: boolean;
    isSmallScreen: boolean;
};

/**
 * Hook to determine if we are on mobile devices or in the Modal Navigator.
 * Use "shouldUseNarrowLayout" for "on mobile or in RHP/LHP", "isSmallScreenWidth" for "on mobile", "isInNarrowPaneModal" for "in RHP/LHP".
 *
 * There are two kinds of modals in this app:
 *     1. Modal stack navigators from react-navigation
 *     2. Modal components that use react-native-modal
 *
 * This hook is designed to handle both. `shouldUseNarrowLayout` will return `true` if any of the following are true:
 *     1. The device screen width is narrow
 *     2. The consuming component is the child of a "right docked" react-native-modal component
 *     3. The consuming component is a screen in a modal stack navigator and not a child of a "non-right-docked" react-native-modal component.
 *
 * For more details on the various modal types we've defined for this app and implemented using react-native-modal, see `ModalType`.
 */
export default function useResponsiveLayout(): ResponsiveLayoutResult {
    const {isSmallScreenWidth, isExtraSmallScreenHeight, isExtraSmallScreenWidth, isMediumScreenWidth, isLargeScreenWidth, isSmallScreen} = useWindowDimensions();

    // Note: activeModalType refers to our react-native-modal component wrapper, not react-navigation's modal stack navigators.
    // This means it will only be defined if the component calling this hook is a child of a modal component. See BaseModal for the provider.
    const {activeModalType} = useContext(ModalContext);

    // This refers to the state of the root navigator, and is true if and only if the topmost navigator is the "left modal navigator" or the "right modal navigator"
    const isDisplayedInModalNavigator = !!useRootNavigationState(Navigation.isModalNavigatorActive);

    // The component calling this hook is in a "narrow pane modal" if:
    const isInNarrowPaneModal =
        // it's a child of the right-docked modal
        activeModalType === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED ||
        // or there's a "right modal navigator" or "left modal navigator" on the top of the root navigation stack
        // and the component calling this hook is not the child of another modal type, such as a confirm modal
        (isDisplayedInModalNavigator && !activeModalType);

    const shouldUseNarrowLayout = isSmallScreenWidth || isInNarrowPaneModal;

    return {
        shouldUseNarrowLayout,
        isSmallScreenWidth,
        isInNarrowPaneModal,
        isExtraSmallScreenHeight,
        isExtraSmallScreenWidth,
        isMediumScreenWidth,
        isLargeScreenWidth,
        isSmallScreen,
    };
}
