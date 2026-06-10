import {useWideRHPState} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

/** On wide layout every "small" RHP renders as a centered modal instead of a right-docked panel; on narrow layout it stays full-screen. */
function useIsCenteredRHPModal(): boolean {
    // Raw screen width (ignoring the side-modal context) so the value is identical across the RHP container and the modal stack screens it wraps.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    return !isSmallScreenWidth;
}

/**
 * Shared centered-modal conditions for the navigator side (avoids recomputing them per file).
 * - `hasWidePane`: a wide/super-wide pane exists in the stack (focused or below).
 * - `isFocusedOverWidePane`: a centered modal is the focused card above a wide/super-wide pane.
 */
function useCenteredRHPModalState() {
    const isCenteredModal = useIsCenteredRHPModal();
    const {wideRHPRouteKeys, superWideRHPRouteKeys, shouldRenderSecondaryOverlayForRHPOnWideRHP, shouldRenderSecondaryOverlayForRHPOnSuperWideRHP} = useWideRHPState();

    const hasWidePane = wideRHPRouteKeys.length > 0 || superWideRHPRouteKeys.length > 0;
    const isFocusedOverWidePane = isCenteredModal && (shouldRenderSecondaryOverlayForRHPOnWideRHP || shouldRenderSecondaryOverlayForRHPOnSuperWideRHP);

    return {isCenteredModal, hasWidePane, isFocusedOverWidePane};
}

export default useIsCenteredRHPModal;
export {useCenteredRHPModalState};
