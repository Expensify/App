import React from 'react';
import useSidePane from '@hooks/useSidePane';
import Help from './HelpModal';

function SidePane() {
    const {shouldHideSidePane, isPaneHidden, sidePaneTranslateX, shouldHideSidePaneBackdrop, closeSidePane} = useSidePane();

    if (shouldHideSidePane) {
        return null;
    }

    return (
        <Help
            isPaneHidden={isPaneHidden}
            sidePaneTranslateX={sidePaneTranslateX}
            closeSidePane={closeSidePane}
            shouldHideSidePaneBackdrop={shouldHideSidePaneBackdrop}
        />
    );
}

SidePane.displayName = 'SidePane';

export default SidePane;
