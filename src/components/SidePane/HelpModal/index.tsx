import React, {useEffect} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
// @ts-expect-error This is a workaround to display HelpPane on top of everything,
// Modal from react-native can't be used here, as it would block interactions with the rest of the app
import ModalPortal from 'react-native-web/dist/exports/Modal/ModalPortal';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import HelpContent from '@components/SidePane/HelpComponents/HelpContent';
import HelpOverlay from '@components/SidePane/HelpComponents/HelpOverlay';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type HelpProps from './types';

function Help({sidePaneTranslateX, closeSidePane, shouldHideSidePaneBackdrop}: HelpProps) {
    const styles = useThemeStyles();
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {paddingTop, paddingBottom} = useSafeAreaPaddings();
    const [isRHPVisible = false] = useOnyx(ONYXKEYS.MODAL, {selector: (modal) => modal?.type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED});

    const onCloseSidePaneOnSmallScreens = () => {
        if (isExtraLargeScreenWidth) {
            return;
        }

        closeSidePane();
    };

    // Close side pane on escape key press
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => closeSidePane(), {isActive: !isExtraLargeScreenWidth, shouldBubble: false});

    // Close side pane on small screens when navigation keyboard shortcuts are used
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.SEARCH, onCloseSidePaneOnSmallScreens, {shouldBubble: true});
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.NEW_CHAT, onCloseSidePaneOnSmallScreens, {shouldBubble: true});
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.SHORTCUTS, onCloseSidePaneOnSmallScreens, {shouldBubble: true});

    // Web back button: push history state and close side pane on popstate
    useEffect(() => {
        window.history.pushState({isSidePaneOpen: true}, '', null);
        const handlePopState = () => {
            if (isExtraLargeScreenWidth) {
                return;
            }

            closeSidePane();
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    return (
        <ModalPortal>
            <FocusTrapForModal active={!isExtraLargeScreenWidth}>
                <View style={styles.sidePaneContainer}>
                    <View>
                        {!shouldHideSidePaneBackdrop && (
                            <HelpOverlay
                                onBackdropPress={closeSidePane}
                                isRHPVisible={isRHPVisible}
                            />
                        )}
                    </View>
                    <Animated.View
                        style={[styles.sidePaneContent(shouldUseNarrowLayout, isExtraLargeScreenWidth), {transform: [{translateX: sidePaneTranslateX.current}], paddingTop, paddingBottom}]}
                    >
                        <HelpContent closeSidePane={closeSidePane} />
                    </Animated.View>
                </View>
            </FocusTrapForModal>
        </ModalPortal>
    );
}

Help.displayName = 'Help';

export default Help;
