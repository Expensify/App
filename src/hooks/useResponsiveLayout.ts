import {useEffect, useRef, useState} from 'react';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
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

    const [isInModal, setIsInModal] = useState(false);
    const hasSetIsInModal = useRef(false);
    const updateModalStatus = () => {
        if (hasSetIsInModal.current) {
            return;
        }
        const isDisplayedInModal = Navigation.isDisplayedInModal();
        if (isInModal !== isDisplayedInModal) {
            setIsInModal(isDisplayedInModal);
        }
        hasSetIsInModal.current = true;
    };

    useEffect(() => {
        const unsubscribe = navigationRef?.current?.addListener('state', updateModalStatus);

        if (navigationRef?.current?.isReady()) {
            updateModalStatus();
        }

        return () => {
            unsubscribe?.();
        };
    }, []);

    const shouldUseNarrowLayout = isSmallScreenWidth || isInModal;
    return {shouldUseNarrowLayout, isSmallScreenWidth, isInModal, isExtraSmallScreenHeight, isExtraSmallScreenWidth, isMediumScreenWidth, isLargeScreenWidth, isSmallScreen};
}
