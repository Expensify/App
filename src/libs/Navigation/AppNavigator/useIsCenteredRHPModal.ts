import useResponsiveLayout from '@hooks/useResponsiveLayout';

/**
 * PoC: on wide layout every "small" RHP renders as a centered modal instead of a right-docked panel. This is true whether the
 * small RHP stands alone or floats on top of a wide/super-wide expense/report pane (the wide panes themselves keep their
 * layout). On narrow layout the RHP stays full-screen, so this returns false.
 *
 * Used by the pieces that switch on "is this RHP a centered modal": the inline pickers (which avoid opening a second docked
 * modal inside a centered one) and the RightModalNavigator container.
 */
function useIsCenteredRHPModal(): boolean {
    // We intentionally use isSmallScreenWidth (raw screen width, ignoring the side-modal context) so the value is identical
    // across the RHP container and the modal stack screens it wraps.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    return !isSmallScreenWidth;
}

export default useIsCenteredRHPModal;
