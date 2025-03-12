import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSidePane from '@hooks/useSidePane';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import NAVIGATORS from '@src/NAVIGATORS';
import Help from './Help';
import SidePaneOverlay from './SidePaneOverlay';

function SidePane() {
    const styles = useThemeStyles();
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {sidePaneTranslateX, shouldHideSidePane, shouldHideSidePaneBackdrop, closeSidePane} = useSidePane();
    const {paddingTop} = useStyledSafeAreaInsets();
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
            <Animated.View style={[styles.sidePaneContainer(shouldUseNarrowLayout, isExtraLargeScreenWidth), {transform: [{translateX: sidePaneTranslateX.current}], paddingTop}]}>
                <Help />
            </Animated.View>
        </>
    );
}

SidePane.displayName = 'SidePane';

export default SidePane;
