import useResponsiveLayout from '@hooks/useResponsiveLayout';

/** On wide layout every "small" RHP renders as a centered modal instead of a right-docked panel; on narrow layout it stays full-screen. */
function useIsCenteredRHPModal(): boolean {
    // Raw screen width (ignoring the side-modal context) so the value is identical across the RHP container and the modal stack screens it wraps.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    return !isSmallScreenWidth;
}

export default useIsCenteredRHPModal;
