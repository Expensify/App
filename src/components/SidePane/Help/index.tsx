import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
// @ts-expect-error This is a workaround to display HelpPane on top of everything,
// Modal from react-native can't be used here, as it would block interactions with the rest of the app
import ModalPortal from 'react-native-web/dist/exports/Modal/ModalPortal';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import SidePaneOverlay from '@components/SidePane/SidePaneOverlay';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import HelpContent from './HelpContent';
import type HelpProps from './types';

function Help({sidePaneTranslateX, closeSidePane, shouldHideSidePaneBackdrop}: HelpProps) {
    const styles = useThemeStyles();
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {paddingTop, paddingBottom} = useSafeAreaPaddings();

    const isInRHP = useRootNavigationState((state) => state?.routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    const isInNarrowPaneModal = !!modal?.isVisible || isInRHP;

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => closeSidePane(), {isActive: !isExtraLargeScreenWidth, shouldBubble: false});

    return (
        <ModalPortal>
            <FocusTrapForModal active>
                <View style={styles.sidePaneContainer}>
                    <View>
                        {!shouldHideSidePaneBackdrop && (
                            <SidePaneOverlay
                                onBackdropPress={closeSidePane}
                                isInNarrowPaneModal={isInNarrowPaneModal}
                            />
                        )}
                    </View>
                    <Animated.View
                        style={[styles.sidePaneContent(shouldUseNarrowLayout, isExtraLargeScreenWidth), {transform: [{translateX: sidePaneTranslateX.current}], paddingTop, paddingBottom}]}
                    >
                        <HelpContent />
                    </Animated.View>
                </View>
            </FocusTrapForModal>
        </ModalPortal>
    );
}

Help.displayName = 'Help';

export default Help;
