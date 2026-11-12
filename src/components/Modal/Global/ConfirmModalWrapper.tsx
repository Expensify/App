import type {ConfirmModalProps} from '@components/ConfirmModal';
import ConfirmModal from '@components/ConfirmModal';
import FormHelpMessage from '@components/FormHelpMessage';
import Text from '@components/Text';

import useActiveElementRole from '@hooks/useActiveElementRole';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

import Log from '@libs/Log';

import CONST from '@src/CONST';

import React, {useRef, useState} from 'react';

import type {ModalProps} from './ModalContext';

import {ModalActions} from './ModalContext';

type ConfirmModalWrapperProps = ModalProps &
    Omit<ConfirmModalProps, 'onConfirm' | 'onCancel' | 'isVisible'> & {
        /** Whether a backdrop tap should also hide the modal after running onBackdropPress. Leave it off when onBackdropPress is meant to keep the modal open */
        shouldHideOnBackdropPress?: boolean;

        /** Resolves without a value to close, or with a localized error to keep the modal open for retry. */
        onConfirm?: () => Promise<string | void>;
    };

// This wrapper bridges the ConfirmModal API with the global modal system, providing handlers for the onConfirm and onCancel callbacks to ConfirmModal.
// TODOS after migrating all ConfirmModal instances to use showConfirmModal:
// - handle closeModal inside ConfirmModal
// - remove ConfirmModalWrapper

function ConfirmModalWrapper({closeModal, onModalHide, resolveModal, onBackdropPress, shouldHideOnBackdropPress = false, onConfirm, ...props}: ConfirmModalWrapperProps) {
    const activeElementRole = useActiveElementRole();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isVisible, setIsVisible] = useState(true);
    const [closeAction, setCloseAction] = useState<typeof ModalActions.CONFIRM | typeof ModalActions.CLOSE>(ModalActions.CLOSE);
    const [isConfirmLoading, setIsConfirmLoading] = useState(false);
    const [confirmationError, setConfirmationError] = useState('');
    const isSubmittingRef = useRef(false);

    const isConfirmDisabledWhileOffline = !!props.shouldDisableConfirmButtonWhenOffline && isOffline;

    const submitConfirmation = () => {
        if (!onConfirm) {
            return;
        }
        isSubmittingRef.current = true;
        setIsConfirmLoading(true);
        setConfirmationError('');
        onConfirm()
            .then((error) => {
                if (error) {
                    setConfirmationError(error);
                    return;
                }
                setCloseAction(ModalActions.CONFIRM);
                setIsVisible(false);
            })
            .catch((error: unknown) => {
                Log.hmmm('Unable to complete confirmation', {error});
                setConfirmationError(translate('common.genericErrorMessage'));
            })
            .finally(() => {
                isSubmittingRef.current = false;
                setIsConfirmLoading(false);
            });
    };

    const handleConfirm = () => {
        if (isSubmittingRef.current || isConfirmLoading || props.isConfirmLoading || props.isConfirmDisabled || isConfirmDisabledWhileOffline) {
            return;
        }
        if (onConfirm) {
            submitConfirmation();
            return;
        }
        setCloseAction(ModalActions.CONFIRM);
        // If isConfirmLoading is passed, don't close immediately - show loading state instead
        // The caller should use closeModal() from useConfirmModal when the async operation completes
        if (props.isConfirmLoading !== undefined) {
            setIsConfirmLoading(true);
            // Resolve the promise so the caller's .then() handler can start the async operation
            // The modal stays visible with loading state until closeModal() is called
            resolveModal({action: ModalActions.CONFIRM});
        } else {
            setIsVisible(false);
        }
    };

    const handleCancel = () => {
        if (isSubmittingRef.current) {
            return;
        }
        setCloseAction(ModalActions.CLOSE);
        setIsVisible(false);
    };

    // Hide through isVisible so a backdrop close animates out like the cancel button, instead of leaving the stack mid-tap
    const handleBackdropPress =
        onBackdropPress && shouldHideOnBackdropPress
            ? () => {
                  onBackdropPress();
                  handleCancel();
              }
            : onBackdropPress;

    const handleModalHide = () => {
        if (isVisible) {
            return;
        }
        closeModal({action: closeAction});
        onModalHide?.();
    };

    // Mirror the confirm button's disabled state so the Enter shortcut can't bypass a button that is visually disabled.
    const shortcutConfig = {
        isActive: activeElementRole !== CONST.ROLE.BUTTON && !isConfirmLoading && !isConfirmDisabledWhileOffline && !props.isConfirmDisabled,
        shouldPreventDefault: false,
        shouldBubble: false,
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, handleConfirm, shortcutConfig);

    return (
        <ConfirmModal
            {...props}
            prompt={
                onConfirm ? (
                    <>
                        {typeof props.prompt === 'string' ? <Text style={props.promptStyles}>{props.prompt}</Text> : props.prompt}
                        <FormHelpMessage
                            message={isConfirmDisabledWhileOffline ? translate('common.youAppearToBeOffline') : confirmationError}
                            isError={!isConfirmDisabledWhileOffline}
                            style={styles.mt4}
                        />
                    </>
                ) : (
                    props.prompt
                )
            }
            isVisible={isVisible}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onBackdropPress={handleBackdropPress}
            onModalHide={handleModalHide}
            isConfirmLoading={isConfirmLoading || props.isConfirmLoading}
            shouldShowCancelButton={onConfirm && isConfirmLoading ? false : props.shouldShowCancelButton}
        />
    );
}

export default ConfirmModalWrapper;
