import React from 'react';
import useSidePanel from '@hooks/useSidePanel';
import Help from './HelpModal';
import useSyncSidePanelWithHistory from './useSyncSidePanelWithHistory';

function SidePanel() {
    const {sidePanelNVP, isSidePanelTransitionEnded, shouldHideSidePanel, sidePanelTranslateX, shouldHideSidePanelBackdrop, closeSidePanel} = useSidePanel();

    // Hide side panel once animation ends
    // This hook synchronizes the side panel visibility with the browser history when it is displayed as RHP.
    // This means when you open or close the side panel, an entry connected with it is added to or removed from the browser history,
    // allowing this modal to be toggled using browser's "go back" and "go forward" buttons.
    useSyncSidePanelWithHistory();

    // Side panel can't be displayed if NVP is undefined
    if (!sidePanelNVP) {
        return null;
    }

    if (isSidePanelTransitionEnded && shouldHideSidePanel) {
        return null;
    }

    return (
        <Help
            shouldHideSidePanel={shouldHideSidePanel}
            sidePanelTranslateX={sidePanelTranslateX}
            closeSidePanel={closeSidePanel}
            shouldHideSidePanelBackdrop={shouldHideSidePanelBackdrop}
        />
    );
}

SidePanel.displayName = 'SidePanel';

export default SidePanel;
