import React from 'react';
import {View} from 'react-native';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSidePane from '@hooks/useSidePane';
import NAVIGATORS from '@src/NAVIGATORS';
import Help from './Help';
import SidePaneOverlay from './SidePaneOverlay';

function SidePane() {
    const {shouldHideSidePane, sidePaneTranslateX, shouldHideSidePaneBackdrop, closeSidePane} = useSidePane();
    const isInNarrowPaneModal = useRootNavigationState((state) => state?.routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);

    if (shouldHideSidePane) {
        return null;
    }

    return (
        <>
            <View>
                {!shouldHideSidePaneBackdrop && (
                    <SidePaneOverlay
                        onBackdropPress={closeSidePane}
                        isInNarrowPaneModal={isInNarrowPaneModal}
                    />
                )}
            </View>
            <Help
                sidePaneTranslateX={sidePaneTranslateX}
                closeSidePane={closeSidePane}
            />
        </>
    );
}

SidePane.displayName = 'SidePane';

export default SidePane;
