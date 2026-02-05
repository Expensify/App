import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutOnWideRHPResult from './types';

// Super Wide and Wide RHPs are not displayed on native platforms.
export default function useResponsiveLayoutOnWideRHP(): ResponsiveLayoutOnWideRHPResult {
    const responsiveLayoutValues = useResponsiveLayout();

    return {
        ...responsiveLayoutValues,
        isWideRHPDisplayedOnWideLayout: false,
        isSuperWideRHPDisplayedOnWideLayout: false,
    };
}
