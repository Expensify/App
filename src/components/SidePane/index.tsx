import React from 'react';
import useSidePane from '@hooks/useSidePane';
import Help from './HelpModal';

function SidePane() {
    const {isSidePaneTransitionEnded, shouldHideSidePane, sidePaneTranslateX, shouldHideSidePaneBackdrop, closeSidePane} = useSidePane();

    if (isSidePaneTransitionEnded && shouldHideSidePane) {
        return null;
    }

    return (
        <Help
            shouldHideSidePane={shouldHideSidePane}
            sidePaneTranslateX={sidePaneTranslateX}
            closeSidePane={closeSidePane}
            shouldHideSidePaneBackdrop={shouldHideSidePaneBackdrop}
        />
    );
}

SidePane.displayName = 'SidePane';

export default SidePane;
