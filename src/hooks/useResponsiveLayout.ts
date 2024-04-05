import {useEffect, useState} from 'react';
import Navigation from '@libs/Navigation/Navigation';
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

    const [isInModal, setIsInModal] = useState(Navigation.isDisplayedInModal());

    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            setIsInModal(Navigation.isDisplayedInModal());
        });
    }, []);

    const shouldUseNarrowLayout = isSmallScreenWidth || isInModal;
    return {shouldUseNarrowLayout, isSmallScreenWidth, isInModal};
}
