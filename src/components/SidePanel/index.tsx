import React from 'react';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useSidePanelState from '@hooks/useSidePanelState';
import type {ExtraContentProps} from '@libs/Navigation/PlatformStackNavigation/types';
import SidePanelModal from './SidePanelModal';
import SidePanelReport from './SidePanelReport';
import useSyncSidePanelWithHistory from './useSyncSidePanelWithHistory';

function SidePanel({navigation}: Pick<ExtraContentProps, 'navigation'>) {
    const {sidePanelNVP, isSidePanelTransitionEnded, shouldHideSidePanel, sidePanelTranslateX, shouldHideSidePanelBackdrop, reportID} = useSidePanelState();
    const {closeSidePanel} = useSidePanelActions();

    // Hide side panel once animation ends
    // This hook synchronizes the side panel visibility with the browser history when it is displayed as RHP.
    // This means when you open or close the side panel, an entry connected with it is added to or removed from the browser history,
    // allowing this modal to be toggled using browser's "go back" and "go forward" buttons.
    useSyncSidePanelWithHistory();

    // Side panel can't be displayed if NVP is undefined
    if (!sidePanelNVP || !reportID) {
        return null;
    }

    if (isSidePanelTransitionEnded && shouldHideSidePanel) {
        return null;
    }

    return (
        <SidePanelModal
            shouldHideSidePanel={shouldHideSidePanel}
            sidePanelTranslateX={sidePanelTranslateX}
            closeSidePanel={closeSidePanel}
            shouldHideSidePanelBackdrop={shouldHideSidePanelBackdrop}
        >
            <SidePanelReport
                navigation={navigation}
                reportID={reportID}
            />
        </SidePanelModal>
    );
}

export default SidePanel;
