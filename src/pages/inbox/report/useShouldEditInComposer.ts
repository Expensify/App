import useResponsiveLayout from '@hooks/useResponsiveLayout';

/**
 * Whether message edits happen in the bottom composer (#90516) instead of the inline editor.
 * This depends only on the screen size, so reports opened in the RHP on a wide screen still edit inline.
 */
function useShouldEditInComposer() {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout, because shouldUseNarrowLayout is also true in the RHP on wide screens
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    return isSmallScreenWidth;
}

export default useShouldEditInComposer;
