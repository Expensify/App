import {useWideRHPState} from '@components/WideRHPContextProvider';
import useIsCenteredRHPModal from './useIsCenteredRHPModal';

/**
 * Shared centered-modal conditions for the navigator side (avoids recomputing them per file).
 * - `isCenteredModal`: wide layout, so small RHPs should render as centered modals.
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

export default useCenteredRHPModalState;
