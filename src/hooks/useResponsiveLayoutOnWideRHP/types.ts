import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

type ResponsiveLayoutOnWideRHPResult = ResponsiveLayoutResult & {
    isWideRHPDisplayedOnWideLayout: boolean;
    isSuperWideRHPDisplayedOnWideLayout: boolean;
};

export default ResponsiveLayoutOnWideRHPResult;
