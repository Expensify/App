import React from 'react';
import useSidePanel from '@hooks/useSidePanel';
import Help from './HelpModal';

function SidePanel() {
    const {isSidePanelTransitionEnded, shouldHideSidePanel, sidePanelTranslateX, shouldHideSidePanelBackdrop, closeSidePanel} = useSidePanel();

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
