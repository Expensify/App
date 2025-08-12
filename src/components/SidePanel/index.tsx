import React from 'react';
import useSidePanel from '@hooks/useSidePanel';
import Help from './HelpModal';

function SidePanel() {
    const {sidePanelNVP, isSidePanelTransitionEnded, shouldHideSidePanel, sidePanelTranslateX, shouldHideSidePanelBackdrop, closeSidePanel} = useSidePanel();

    // Side panel can't be displayed if NVP is undefined
    if (!sidePanelNVP) {
        return null;
    }

    // Hide side panel once animation ends
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
