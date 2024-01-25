import type {ReactNode} from 'react';
import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import ConfirmContent from './ConfirmContent';
import Modal from './Modal';

type ConfirmModalProps = {
    /** Title of the modal */
    title?: string;

    /** A callback to call when the form has been submitted */
    onConfirm: () => void;

    /** A callback to call when the form has been closed */
    onCancel?: () => void;

    /** Modal visibility */
    isVisible: boolean;

    /** Confirm button text */
    confirmText?: string;

    /** Cancel button text */
    cancelText?: string;

    /** Modal content text/element */
    prompt?: string | ReactNode;

    /** Whether we should use the success button color */
    success?: boolean;

    /** Is the action destructive */
    danger?: boolean;

    /** Whether we should disable the confirm button when offline */
    shouldDisableConfirmButtonWhenOffline?: boolean;

    /** Whether we should show the cancel button */
    shouldShowCancelButton?: boolean;

    /** Callback method fired when the modal is hidden */
    onModalHide?: () => void;

    /** Should we announce the Modal visibility changes? */
    shouldSetModalVisibility?: boolean;

    /** Icon to display above the title */
    iconSource?: IconAsset;

    /** Styles for title */
    titleStyles?: StyleProp<TextStyle>;

    /** Styles for prompt */
    promptStyles?: StyleProp<TextStyle>;

    /** Styles for icon */
    iconAdditionalStyles?: StyleProp<ViewStyle>;

    /** Whether to center the icon / text content */
    shouldCenterContent?: boolean;

    /** Whether to stack the buttons */
    shouldStackButtons?: boolean;

    /** How to re-focus after the modal is dismissed */
    restoreFocusType?: ValueOf<typeof CONST.MODAL.RESTORE_FOCUS_TYPE>;
};

function ConfirmModal({
    confirmText = '',
    cancelText = '',
    prompt = '',
    success = true,
    danger = false,
    onCancel = () => {},
    shouldDisableConfirmButtonWhenOffline = false,
    shouldShowCancelButton = true,
    shouldSetModalVisibility = true,
    title = '',
    iconSource,
    onModalHide = () => {},
    titleStyles,
    iconAdditionalStyles,
    promptStyles,
    shouldCenterContent = false,
    shouldStackButtons = true,
    isVisible,
    onConfirm,
    restoreFocusType,
}: ConfirmModalProps) {
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <Modal
            onSubmit={onConfirm}
            onClose={onCancel}
            isVisible={isVisible}
            shouldSetModalVisibility={shouldSetModalVisibility}
            onModalHide={onModalHide}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            restoreFocusType={restoreFocusType}
        >
            <ConfirmContent
                title={title}
                /* Disable onConfirm function if the modal is being dismissed, otherwise the confirmation
            function can be triggered multiple times if the user clicks on the button multiple times. */
                onConfirm={() => (isVisible ? onConfirm() : null)}
                onCancel={onCancel}
                confirmText={confirmText}
                cancelText={cancelText}
                prompt={prompt}
                success={success}
                danger={danger}
                shouldDisableConfirmButtonWhenOffline={shouldDisableConfirmButtonWhenOffline}
                shouldShowCancelButton={shouldShowCancelButton}
                shouldCenterContent={shouldCenterContent}
                iconSource={iconSource}
                iconAdditionalStyles={iconAdditionalStyles}
                titleStyles={titleStyles}
                promptStyles={promptStyles}
                shouldStackButtons={shouldStackButtons}
            />
        </Modal>
    );
}

ConfirmModal.displayName = 'ConfirmModal';

export default ConfirmModal;
