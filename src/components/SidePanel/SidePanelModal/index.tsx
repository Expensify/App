import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import SidePanelOverlay from '@components/SidePanel/SidePanelOverlay';
import SidePanelResizeHandle from '@components/SidePanel/SidePanelResizeHandle';
import {useWideRHPState} from '@components/WideRHPContextProvider';

import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useSidePanelState from '@hooks/useSidePanelState';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import ComposerFocusManager from '@libs/ComposerFocusManager';

import variables from '@styles/variables';

import {areAllModalsHidden} from '@userActions/Modal';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {isRHPVisibleSelector} from '@selectors/Modal';
import React, {useEffect} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';
// @ts-expect-error This is a workaround to display SidePanel on top of everything,
// Modal from react-native can't be used here, as it would block interactions with the rest of the app
import ModalPortal from 'react-native-web/dist/exports/Modal/ModalPortal';

import type SidePanelModalProps from './types';

import useSidePanelFloatingRight from '../useSidePanelFloatingRight';

function SidePanelModal({children, sidePanelTranslateX, closeSidePanel, shouldHideSidePanelBackdrop}: SidePanelModalProps) {
    const styles = useThemeStyles();
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {paddingTop, paddingBottom, paddingLeft, paddingRight} = useSafeAreaPaddings();
    const {sidePanelWidth, sidePanelMode} = useSidePanelState();
    const {setSidePanelMode} = useSidePanelActions();
    const {windowHeight} = useWindowDimensions();
    const isFloating = sidePanelMode === 'floating';

    // A floating panel sits beside the page like a chat popover, so only a docked panel on a smaller screen acts as a modal.
    const isModalPanel = !isExtraLargeScreenWidth && !isFloating;

    const [isRHPVisible = false] = useOnyx(ONYXKEYS.MODAL, {selector: isRHPVisibleSelector});
    const uniqueModalId = ComposerFocusManager.getId();

    const {wideRHPRouteKeys, isWideRHPFocused, superWideRHPRouteKeys, isSuperWideRHPFocused} = useWideRHPState();

    const floatingRight = useSidePanelFloatingRight(variables.sidePanelFloatingWidth);

    const shouldOverlayBeVisible = (!!wideRHPRouteKeys.length && isWideRHPFocused) || (!!superWideRHPRouteKeys.length && isSuperWideRHPFocused) || !isRHPVisible;

    const onCloseSidePanelOnSmallScreens = () => {
        if (!isModalPanel) {
            return;
        }

        closeSidePanel();
    };

    // Close Side Panel on escape key press. Stand down while any modal is open on top of it, otherwise the same Esc
    // that closes the modal (whose handler bubbles) would also close the panel underneath. The open-modal registry is
    // read when the key is pressed, so it stays correct for stacked modals and has no gap while Onyx writes are pending.
    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ESCAPE,
        () => {
            if (!areAllModalsHidden()) {
                return;
            }
            if (isFloating) {
                setSidePanelMode('minimized');
                return;
            }
            closeSidePanel();
        },
        {isActive: !isExtraLargeScreenWidth || isFloating, shouldBubble: false},
    );
    // Close Side Panel on debug key press i.e. opening the TestTools modal
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.DEBUG, () => closeSidePanel(), {shouldBubble: true});

    // Close Side Panel on small screens when navigation keyboard shortcuts are used
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.SEARCH, onCloseSidePanelOnSmallScreens, {shouldBubble: true});
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.NEW_CHAT, onCloseSidePanelOnSmallScreens, {shouldBubble: true});
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.SHORTCUTS, onCloseSidePanelOnSmallScreens, {shouldBubble: true});

    // Web back button: push history state and close Side Panel on popstate
    useEffect(() => {
        // Side Panel is not a normal modal when docked on ExtraLargeScreenWidth or floating.
        if (!isModalPanel) {
            return;
        }
        ComposerFocusManager.resetReadyToFocus(uniqueModalId);
        return () => {
            ComposerFocusManager.setReadyToFocus(uniqueModalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalPanel]);

    // The floating popover reuses the docked slide's progress, fading and rising into place instead of sliding in from the edge.
    const floatingProgress = sidePanelTranslateX.current.interpolate({inputRange: [0, sidePanelWidth], outputRange: [0, 1], extrapolate: 'clamp'});
    const contentStyle = isFloating
        ? [
              styles.sidePanelFloatingContent(windowHeight, floatingRight),
              {
                  opacity: floatingProgress.interpolate({inputRange: [0, 1], outputRange: [1, 0]}),
                  transform: [{translateY: floatingProgress.interpolate({inputRange: [0, 1], outputRange: [0, 24]})}],
              },
          ]
        : [
              styles.sidePanelContent,
              styles.sidePanelContentWidth(shouldUseNarrowLayout, sidePanelWidth),
              styles.sidePanelContentBorderWidth(isExtraLargeScreenWidth),
              {transform: [{translateX: sidePanelTranslateX.current}], paddingTop, paddingBottom, paddingLeft, paddingRight},
          ];

    return (
        <ModalPortal>
            <FocusTrapForModal active={isModalPanel}>
                <View style={styles.sidePanelContainer}>
                    <View>
                        {!shouldHideSidePanelBackdrop && (
                            <SidePanelOverlay
                                onBackdropPress={closeSidePanel}
                                shouldBeVisible={shouldOverlayBeVisible}
                            />
                        )}
                    </View>
                    <ColorSchemeWrapper>
                        <Animated.View style={contentStyle}>
                            {children}
                            {!isFloating && <SidePanelResizeHandle />}
                        </Animated.View>
                    </ColorSchemeWrapper>
                </View>
            </FocusTrapForModal>
        </ModalPortal>
    );
}

export default SidePanelModal;
