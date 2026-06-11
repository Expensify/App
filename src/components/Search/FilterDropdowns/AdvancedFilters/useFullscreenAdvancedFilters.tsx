import useResponsiveLayout from '@hooks/useResponsiveLayout';

function useFullscreenAdvancedFilters() {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- PopoverWithMeasuredContent renders as a Modal on a small screen width
    const {isSmallScreenWidth} = useResponsiveLayout();
    return isSmallScreenWidth;
}

export default useFullscreenAdvancedFilters;
