import {useWideRHPState} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

/**
 * PoC on wide layout every "small" RHP renders as a
 * centered modal instead of a right-docked panel. The wide/super-wide expense & report panes keep their existing layout, so
 * while one of them is in the stack the small RHPs fall back to the legacy right-aligned positioning.
 *
 * This is the single source of truth for that decision and must be used by every place that styles a centered RHP
 * (the RightModalNavigator container, the modal stack container width, and the content card corners).
 */
function useIsCenteredRHPModal(): boolean {
    // We intentionally use isSmallScreenWidth (raw screen width, ignoring the side-modal context) so the value is identical
    // across the RHP container and the modal stack screens it wraps.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {wideRHPRouteKeys, superWideRHPRouteKeys} = useWideRHPState();

    return !isSmallScreenWidth && superWideRHPRouteKeys.length === 0 && wideRHPRouteKeys.length === 0;
}

export default useIsCenteredRHPModal;
