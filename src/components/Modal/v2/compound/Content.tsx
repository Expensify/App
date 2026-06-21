import React, {useEffect, useRef} from 'react';
import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import type FocusTrapForModalProps from '@components/FocusTrap/FocusTrapForModal/FocusTrapForModalProps';
import DismissableLayer from '@components/Overlay/DismissableLayer';
import useHeadingState from '@components/Overlay/hooks/useHeadingState';
import useOverlayEntry from '@components/Overlay/hooks/useOverlayEntry';
import type {EscapeBehavior, ModalKind, ModalOverlayEntry} from '@components/Overlay/libs/overlayStore';
import Presence from '@components/Overlay/Presence';
import {PressableWithoutFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setCloseModal, setModalVisibility, willAlertModalBecomeVisible} from '@libs/actions/Modal';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import CONST from '@src/CONST';
import Backdrop from './Backdrop';
import {ModalContentStateContext} from './Heading';
import type {SheetKeyboardBehavior} from './resolveKeyboardBehavior/types';
import Sheet from './Sheet';
import {useModal} from './state';
import Surface from './Surface';
import type {AnimationIn, AnimationOut, SwipeDirection} from './types';
import useKindLayout from './useKindLayout';

type ContentProps = {
    escapeBehavior?: EscapeBehavior;
    style?: StyleProp<ViewStyle>;
    innerStyle?: StyleProp<ViewStyle>;
    onExitComplete?: () => void;
    onBackdropPress?: () => void;
    animationIn?: AnimationIn;
    animationOut?: AnimationOut;
    animationInTiming?: number;
    animationOutTiming?: number;
    role?: typeof CONST.ROLE.DIALOG | typeof CONST.ROLE.ALERTDIALOG;
    keyboardBehavior?: SheetKeyboardBehavior;
    swipeDirections?: readonly SwipeDirection[];
    initialFocus?: FocusTrapForModalProps['initialFocus'];
    accessibilityLabel?: string;
    children: ReactNode;
};

type RawContentProps = {
    kind: ModalKind;
    role: typeof CONST.ROLE.DIALOG | typeof CONST.ROLE.ALERTDIALOG;
    animationIn: AnimationIn;
    animationOut: AnimationOut;
    animationInTiming: number;
    animationOutTiming: number;
    topTapToDismiss?: boolean;
    escapeBehavior?: EscapeBehavior;
    style?: StyleProp<ViewStyle>;
    innerStyle?: StyleProp<ViewStyle>;
    onExitComplete?: () => void;
    onBackdropPress?: () => void;
    keyboardBehavior?: SheetKeyboardBehavior;
    swipeDirections?: readonly SwipeDirection[];
    initialFocus?: FocusTrapForModalProps['initialFocus'];
    accessibilityLabel?: string;
    children: ReactNode;
};

function RawContent({
    kind,
    role,
    animationIn,
    animationOut,
    animationInTiming,
    animationOutTiming,
    topTapToDismiss = false,
    escapeBehavior,
    style,
    innerStyle,
    onExitComplete,
    onBackdropPress,
    keyboardBehavior,
    swipeDirections,
    initialFocus,
    accessibilityLabel,
    children,
}: RawContentProps) {
    const modal = useModal('<Modal.Content>');
    const {isOpen} = modal.state;
    const {close} = modal.actions;
    const {contentID} = modal.meta;
    const contentState = useHeadingState();
    const {titleId, descriptionId, hasTitle, hasDescription} = contentState;
    const resolvedLabelledBy = hasTitle ? titleId : undefined;
    const resolvedDescribedBy = hasDescription ? descriptionId : undefined;
    const resolvedAccessibilityLabel = hasTitle ? undefined : accessibilityLabel;

    const resolvedEscapeBehavior = escapeBehavior ?? 'dismiss';

    const dismissedByOutsidePressRef = useRef(false);
    useEffect(() => {
        if (!isOpen) {
            return;
        }
        dismissedByOutsidePressRef.current = false;
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }
        const composerModalId = ComposerFocusManager.getId();
        const isPopover = kind === CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED;
        willAlertModalBecomeVisible(true, isPopover);
        setModalVisibility(true, kind);
        ComposerFocusManager.saveFocusState(composerModalId);
        ComposerFocusManager.resetReadyToFocus(composerModalId);
        const removeCloseModal = setCloseModal(close);
        return () => {
            removeCloseModal();
            setModalVisibility(false, kind);
            willAlertModalBecomeVisible(false, isPopover);
            ComposerFocusManager.setReadyToFocus(composerModalId);
            ComposerFocusManager.refocusAfterModalFullyClosed(composerModalId, CONST.MODAL.RESTORE_FOCUS_TYPE.DEFAULT);
        };
    }, [isOpen, kind, close]);

    useOverlayEntry(
        isOpen
            ? ({
                  kind,
                  id: contentID,
                  close,
                  escapeBehavior: resolvedEscapeBehavior,
              } satisfies ModalOverlayEntry)
            : null,
    );

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {outerStyle: kindOuterStyle, innerStyle: kindInnerStyle, paddingStyles: modalPaddingStyles} = useKindLayout(kind, {style, innerStyle});

    const onAccidentalDismiss = onBackdropPress ?? (resolvedEscapeBehavior === 'ignore' ? undefined : close);
    const onSheetRequestClose = resolvedEscapeBehavior === 'ignore' ? undefined : close;
    const shouldRenderTopTapToDismiss = topTapToDismiss && onAccidentalDismiss !== undefined;

    return (
        <Presence
            present={isOpen}
            onExitComplete={onExitComplete}
        >
            <Sheet
                kind={kind}
                onRequestClose={onSheetRequestClose}
                keyboardBehavior={keyboardBehavior}
            >
                <Backdrop
                    kind={kind}
                    animationInTiming={animationInTiming}
                    animationOutTiming={animationOutTiming}
                    onPress={onAccidentalDismiss}
                />
                <DismissableLayer.Modal
                    onDismiss={close}
                    onPointerDownOutside={() => {
                        dismissedByOutsidePressRef.current = true;
                    }}
                    escapeBehavior={resolvedEscapeBehavior}
                >
                    <FocusTrapForModal
                        active
                        initialFocus={initialFocus}
                        shouldReturnFocus={() => !dismissedByOutsidePressRef.current}
                    >
                        <View style={styles.flex1}>
                            <ModalContentStateContext value={contentState}>
                                <Surface
                                    role={role}
                                    labelledBy={resolvedLabelledBy}
                                    describedBy={resolvedDescribedBy}
                                    accessibilityLabel={resolvedAccessibilityLabel}
                                    nativeID={contentID}
                                    animationIn={animationIn}
                                    animationOut={animationOut}
                                    animationInTiming={animationInTiming}
                                    animationOutTiming={animationOutTiming}
                                    style={kindOuterStyle}
                                    innerStyle={[styles.defaultModalContainer, kindInnerStyle, modalPaddingStyles]}
                                    swipeDirections={swipeDirections}
                                    onSwipeDismiss={onAccidentalDismiss}
                                >
                                    {shouldRenderTopTapToDismiss && (
                                        <PressableWithoutFeedback
                                            onPress={onAccidentalDismiss}
                                            role={CONST.ROLE.BUTTON}
                                            accessibilityLabel={translate('common.dismiss')}
                                            sentryLabel={CONST.SENTRY_LABEL.MODAL.DISMISS_DIALOG}
                                            style={styles.bottomDockedModalDismissButton}
                                        >
                                            <View />
                                        </PressableWithoutFeedback>
                                    )}
                                    <ColorSchemeWrapper>{children}</ColorSchemeWrapper>
                                </Surface>
                            </ModalContentStateContext>
                        </View>
                    </FocusTrapForModal>
                </DismissableLayer.Modal>
            </Sheet>
        </Presence>
    );
}

export default RawContent;
export type {ContentProps as ModalContentProps};
