import useSidePanelActions from '@hooks/useSidePanelActions';
import useSidePanelState from '@hooks/useSidePanelState';

/**
 * Returns a callback that opens the Concierge side panel on web (opens the Concierge chat on native instead),
 * and a flag indicating that the concierge is opened in the side panel.
 */
function useOpenConciergeAnywhere() {
    const {shouldHideSidePanel} = useSidePanelState();
    const {openSidePanel} = useSidePanelActions();

    const openConciergeAnywhere = () => {
        if (!shouldHideSidePanel) {
            return;
        }
        openSidePanel();
    };

    return {openConciergeAnywhere, isInSidePanel: true};
}

export default useOpenConciergeAnywhere;
