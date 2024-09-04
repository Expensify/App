import type {ReactNode} from 'react';
import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import ConfirmContent from './ConfirmContent';
import Modal from './Modal';
import type BaseModalProps from './Modal/types';

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

    /** Fill color for the Icon */
    iconFill?: string | false;

    /** Icon width */
    iconWidth?: number;

    /** Icon height */
    iconHeight?: number;

    /** Should the icon be centered */
    shouldCenterIcon?: boolean;

    /** Whether to show the dismiss icon */
    shouldShowDismissIcon?: boolean;

    /** Styles for title container */
    titleContainerStyles?: StyleProp<ViewStyle>;

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

    /** Whether to reverse the order of the stacked buttons */
    shouldReverseStackedButtons?: boolean;

    /** Image to display with content */
    image?: IconAsset;

    /**
     * Whether the modal should enable the new focus manager.
     * We are attempting to migrate to a new refocus manager, adding this property for gradual migration.
     * */
    shouldEnableNewFocusManagement?: boolean;

    /** How to re-focus after the modal is dismissed */
    restoreFocusType?: BaseModalProps['restoreFocusType'];
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
    image,
    iconWidth,
    iconHeight,
    iconFill,
    shouldCenterIcon,
    shouldShowDismissIcon,
    titleContainerStyles,
    shouldReverseStackedButtons,
    shouldEnableNewFocusManagement,
    restoreFocusType,
}: ConfirmModalProps) {
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();

    return (
        <Modal
            onSubmit={onConfirm}
            onClose={onCancel}
            isVisible={isVisible}
            shouldSetModalVisibility={shouldSetModalVisibility}
            onModalHide={onModalHide}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={image ? styles.pt0 : {}}
            shouldEnableNewFocusManagement={shouldEnableNewFocusManagement}
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
                contentStyles={isSmallScreenWidth && shouldShowDismissIcon ? styles.mt2 : undefined}
                iconFill={iconFill}
                iconHeight={iconHeight}
                iconWidth={iconWidth}
                shouldCenterIcon={shouldCenterIcon}
                shouldShowDismissIcon={shouldShowDismissIcon}
                titleContainerStyles={titleContainerStyles}
                iconAdditionalStyles={iconAdditionalStyles}
                titleStyles={titleStyles}
                promptStyles={promptStyles}
                shouldStackButtons={shouldStackButtons}
                shouldReverseStackedButtons={shouldReverseStackedButtons}
                image={image}
            />
        </Modal>
    );
}

ConfirmModal.displayName = 'ConfirmModal';

export default ConfirmModal;
