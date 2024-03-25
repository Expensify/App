import {useEffect, useState} from 'react';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
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
    const isDisplayedInModal = () => {
        const state = navigationRef?.current?.getRootState();
        const lastRoute = state?.routes?.at(-1);
        const lastRouteName = lastRoute?.name;
        return lastRouteName === NAVIGATORS.LEFT_MODAL_NAVIGATOR || lastRouteName === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
    };

    const [isInModal, setIsInModal] = useState(isDisplayedInModal());

    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            setIsInModal(isDisplayedInModal());
        });
    }, []);
    const shouldUseNarrowLayout = isSmallScreenWidth || isInModal;
    return {shouldUseNarrowLayout, isSmallScreenWidth, isInModal};
}
