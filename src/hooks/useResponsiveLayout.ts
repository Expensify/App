import {navigationRef} from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';
import useWindowDimensions from './useWindowDimensions';

type ResponsiveLayoutResult = {
    shouldUseNarrowLayout: boolean;
    isSmallScreenWidth: boolean;
    isInModal: boolean;
    isExtraSmallScreenHeight: boolean;
    isMediumScreenWidth: boolean;
    isLargeScreenWidth: boolean;
    isExtraSmallScreenWidth: boolean;
    isSmallScreen: boolean;
};
/**
 * Hook to determine if we are on mobile devices or in the Modal Navigator.
 * Use "shouldUseNarrowLayout" for "on mobile or in RHP/LHP", "isSmallScreenWidth" for "on mobile", "isInModal" for "in RHP/LHP".
 * Note: Don't use "shouldUseNarrowLayout" in popovers and "alert-style" modals.
 */
export default function useResponsiveLayout(): ResponsiveLayoutResult {
    const {isSmallScreenWidth, isExtraSmallScreenHeight, isExtraSmallScreenWidth, isMediumScreenWidth, isLargeScreenWidth, isSmallScreen} = useWindowDimensions();
    const state = navigationRef?.current?.getRootState();
    const lastRoute = state?.routes?.at(-1);
    const lastRouteName = lastRoute?.name;
    const isInModal = lastRouteName === NAVIGATORS.LEFT_MODAL_NAVIGATOR || lastRouteName === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
    const shouldUseNarrowLayout = isSmallScreenWidth || isInModal;
    return {shouldUseNarrowLayout, isSmallScreenWidth, isInModal, isExtraSmallScreenHeight, isExtraSmallScreenWidth, isMediumScreenWidth, isLargeScreenWidth, isSmallScreen};
}
