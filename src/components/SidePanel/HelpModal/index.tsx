import React, {useEffect} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
// @ts-expect-error This is a workaround to display HelpPane on top of everything,
// Modal from react-native can't be used here, as it would block interactions with the rest of the app
import ModalPortal from 'react-native-web/dist/exports/Modal/ModalPortal';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import HelpContent from '@components/SidePanel/HelpComponents/HelpContent';
import HelpOverlay from '@components/SidePanel/HelpComponents/HelpOverlay';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type HelpProps from './types';

function Help({sidePanelTranslateX, closeSidePanel, shouldHideSidePanelBackdrop}: HelpProps) {
    const styles = useThemeStyles();
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {paddingTop, paddingBottom} = useSafeAreaPaddings();
    const [isRHPVisible = false] = useOnyx(ONYXKEYS.MODAL, {selector: (modal) => modal?.type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED});

    const onCloseSidePanelOnSmallScreens = () => {
        if (isExtraLargeScreenWidth) {
            return;
        }

        closeSidePanel();
    };

    // Close Side Panel on escape key press
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => closeSidePanel(), {isActive: !isExtraLargeScreenWidth, shouldBubble: false});

    // Close Side Panel on small screens when navigation keyboard shortcuts are used
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.SEARCH, onCloseSidePanelOnSmallScreens, {shouldBubble: true});
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.NEW_CHAT, onCloseSidePanelOnSmallScreens, {shouldBubble: true});
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.SHORTCUTS, onCloseSidePanelOnSmallScreens, {shouldBubble: true});

    // Web back button: push history state and close Side Panel on popstate
    useEffect(() => {
        window.history.pushState({isSidePanelOpen: true}, '', null);
        const handlePopState = () => {
            if (isExtraLargeScreenWidth) {
                return;
            }

            closeSidePanel();
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    return (
        <ModalPortal>
            <FocusTrapForModal active={!isExtraLargeScreenWidth}>
                <View style={styles.sidePanelContainer}>
                    <View>
                        {!shouldHideSidePanelBackdrop && (
                            <HelpOverlay
                                onBackdropPress={closeSidePanel}
                                isRHPVisible={isRHPVisible}
                            />
                        )}
                    </View>
                    <Animated.View
                        style={[styles.sidePanelContent(shouldUseNarrowLayout, isExtraLargeScreenWidth), {transform: [{translateX: sidePanelTranslateX.current}], paddingTop, paddingBottom}]}
                    >
                        <HelpContent closeSidePanel={closeSidePanel} />
                    </Animated.View>
                </View>
            </FocusTrapForModal>
        </ModalPortal>
    );
}

Help.displayName = 'Help';

export default Help;
