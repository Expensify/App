import {isRHPVisibleSelector} from '@selectors/Modal';
import React, {useEffect, useMemo} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';
// @ts-expect-error This is a workaround to display HelpPane on top of everything,
// Modal from react-native can't be used here, as it would block interactions with the rest of the app
import ModalPortal from 'react-native-web/dist/exports/Modal/ModalPortal';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import HelpContent from '@components/SidePanel/HelpComponents/HelpContent';
import HelpOverlay from '@components/SidePanel/HelpComponents/HelpOverlay';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type HelpProps from './types';

function Help({sidePanelTranslateX, closeSidePanel, shouldHideSidePanelBackdrop}: HelpProps) {
    const styles = useThemeStyles();
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {paddingTop, paddingBottom} = useSafeAreaPaddings();

    const [isRHPVisible = false] = useOnyx(ONYXKEYS.MODAL, {selector: isRHPVisibleSelector, canBeMissing: true});
    const uniqueModalId = useMemo(() => ComposerFocusManager.getId(), []);

    const onCloseSidePanelOnSmallScreens = () => {
        if (isExtraLargeScreenWidth) {
            return;
        }

        closeSidePanel();
    };

    // Close Side Panel on escape key press
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => closeSidePanel(), {isActive: !isExtraLargeScreenWidth, shouldBubble: false});
    // Close Side Panel on debug key press i.e. opening the TestTools modal
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.DEBUG, () => closeSidePanel(), {shouldBubble: true});

    // Close Side Panel on small screens when navigation keyboard shortcuts are used
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.SEARCH, onCloseSidePanelOnSmallScreens, {shouldBubble: true});
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.NEW_CHAT, onCloseSidePanelOnSmallScreens, {shouldBubble: true});
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.SHORTCUTS, onCloseSidePanelOnSmallScreens, {shouldBubble: true});

    // Web back button: push history state and close Side Panel on popstate
    useEffect(() => {
        ComposerFocusManager.resetReadyToFocus(uniqueModalId);
        return () => {
            ComposerFocusManager.setReadyToFocus(uniqueModalId);
        };
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
                    <ColorSchemeWrapper>
                        <Animated.View
                            style={[
                                styles.sidePanelContent,
                                styles.sidePanelContentWidth(shouldUseNarrowLayout),
                                styles.sidePanelContentBorderWidth(isExtraLargeScreenWidth),
                                {transform: [{translateX: sidePanelTranslateX.current}], paddingTop, paddingBottom},
                            ]}
                        >
                            <HelpContent closeSidePanel={closeSidePanel} />
                        </Animated.View>
                    </ColorSchemeWrapper>
                </View>
            </FocusTrapForModal>
        </ModalPortal>
    );
}

Help.displayName = 'Help';

export default Help;
