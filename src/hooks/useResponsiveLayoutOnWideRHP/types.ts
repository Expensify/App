import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

type ResponsiveLayoutOnWideRHPResult = ResponsiveLayoutResult & {
    /** Whether this route is displayed in the wide RHP, which only happens on a non-small screen. */
    isWideRHPDisplayedOnWideLayout: boolean;

    /** Whether this route is displayed in the super-wide RHP, which only happens on a non-small screen. */
    isSuperWideRHPDisplayedOnWideLayout: boolean;

    /** `useResponsiveLayout`'s own value, unadjusted for wide RHP, so a caller needing both doesn't run that hook twice. */
    shouldUseNarrowLayoutIgnoringWideRHP: boolean;
};

export default ResponsiveLayoutOnWideRHPResult;
