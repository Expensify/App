import {navigationRef} from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';
import useWindowDimensions from './useWindowDimensions';

type ResponsiveLayoutResult = {
    shouldUseNarrowLayout: boolean;
    isSmallScreenWidth: boolean;
    isInModal: boolean;
};
/**
 * Hook to determine if we are on mobile devices or in the Modal Navigator
 */
export default function useResponsiveLayout(): ResponsiveLayoutResult {
    const {isSmallScreenWidth} = useWindowDimensions();
    const state = navigationRef?.getRootState();
    const lastRoute = state?.routes?.at(-1);
    const lastRouteName = lastRoute?.name;
    const isInModal = lastRouteName === NAVIGATORS.LEFT_MODAL_NAVIGATOR || lastRouteName === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
    const shouldUseNarrowLayout = isSmallScreenWidth || isInModal;
    return {shouldUseNarrowLayout, isSmallScreenWidth, isInModal};
}
