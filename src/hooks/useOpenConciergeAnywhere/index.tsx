import useSidePanelActions from '@hooks/useSidePanelActions';
import useSidePanelState from '@hooks/useSidePanelState';

type OpenConciergeAnywhereOptions = {
    forceConcierge?: boolean;
    reportID?: string;
};

/**
 * Returns a callback that opens the Concierge side panel on web (opens the Concierge chat on native instead),
 * and a flag indicating that the concierge is opened in the side panel.
 */
function useOpenConciergeAnywhere() {
    const {shouldHideSidePanel} = useSidePanelState();
    const {openSidePanel} = useSidePanelActions();

    const openConciergeAnywhere = (options?: OpenConciergeAnywhereOptions) => {
        if (!shouldHideSidePanel && !options?.forceConcierge && !options?.reportID) {
            return;
        }
        openSidePanel({forceConcierge: options?.forceConcierge, reportID: options?.reportID});
    };

    return {openConciergeAnywhere, isInSidePanel: true};
}

export default useOpenConciergeAnywhere;
