import type {ReactNode} from 'react';
import React, {useLayoutEffect, useRef} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import NavigationFocusManager from '@libs/NavigationFocusManager';
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

    /** A callback to call when backdrop is pressed */
    onBackdropPress?: () => void;

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

    /** Styles for the image */
    imageStyles?: StyleProp<ViewStyle>;

    /**
     * Whether the modal should enable the new focus manager.
     * We are attempting to migrate to a new refocus manager, adding this property for gradual migration.
     * */
    shouldEnableNewFocusManagement?: boolean;

    /** How to re-focus after the modal is dismissed */
    restoreFocusType?: BaseModalProps['restoreFocusType'];

    /** Whether the confirm button is loading */
    isConfirmLoading?: boolean;

    /** Whether to handle navigation back when modal show. */
    shouldHandleNavigationBack?: boolean;

    /** Whether to ignore the back handler during transition */
    shouldIgnoreBackHandlerDuringTransition?: boolean;
};

function ConfirmModal({
    confirmText = '',
    cancelText = '',
    prompt = '',
    success = true,
    danger = false,
    onCancel = () => {},
    onBackdropPress,
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
    imageStyles,
    iconWidth,
    iconHeight,
    iconFill,
    shouldCenterIcon,
    shouldShowDismissIcon,
    titleContainerStyles,
    shouldReverseStackedButtons,
    shouldEnableNewFocusManagement,
    restoreFocusType,
    isConfirmLoading,
    shouldHandleNavigationBack,
    shouldIgnoreBackHandlerDuringTransition,
}: ConfirmModalProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();

    // Previous state needed for exiting animation to play correctly.
    const prevVisible = usePrevious(isVisible);

    // Use undefined as initial value to distinguish "not yet captured" from "captured as false"
    // This is critical for StrictMode double-invocation protection
    const wasOpenedViaKeyboardRef = useRef<boolean | undefined>(undefined);

    // Ref for scoping DOM queries to this modal's container
    // CRITICAL: Prevents finding buttons from other modals in nested scenarios
    const modalContainerRef = useRef<View>(null);

    // Ref for storing the captured anchor element for focus restoration
    // Captured when modal opens, used when modal closes
    const capturedAnchorRef = useRef<HTMLElement | null>(null);

    // Capture keyboard state and anchor element when modal opens
    // useLayoutEffect ensures this runs synchronously before FocusTrap activates
    useLayoutEffect(() => {
        if (isVisible && !prevVisible) {
            // STRICTMODE GUARD: Only capture if we haven't already
            // In StrictMode, effects run twice. Without this guard:
            //   1st run: reads true, clears flag, stores true in ref
            //   2nd run: reads false (already cleared!), overwrites ref with false ← BUG!
            if (wasOpenedViaKeyboardRef.current === undefined) {
                const wasKeyboard = NavigationFocusManager.wasRecentKeyboardInteraction();
                wasOpenedViaKeyboardRef.current = wasKeyboard;
                if (wasKeyboard) {
                    NavigationFocusManager.clearKeyboardInteractionFlag();
                }
                Log.info('[ConfirmModal] Keyboard state captured on open', false, {
                    wasKeyboard,
                });
            }

            // Capture the anchor element for focus restoration
            // This must happen NOW, before user clicks within the modal (which would overwrite it)
            if (capturedAnchorRef.current === null) {
                capturedAnchorRef.current = NavigationFocusManager.getCapturedAnchorElement();
                Log.info('[ConfirmModal] Captured anchor for focus restoration', false, {
                    hasAnchor: !!capturedAnchorRef.current,
                    anchorLabel: capturedAnchorRef.current?.getAttribute('aria-label'),
                });
            }
        } else if (!isVisible && prevVisible) {
            // Reset keyboard ref when modal closes (allows next open to capture)
            // NOTE: capturedAnchorRef is reset in onModalHide AFTER focus restoration
            wasOpenedViaKeyboardRef.current = undefined;
        }
    }, [isVisible, prevVisible]);

    /**
     * Compute initialFocus for Modal's FocusTrap.
     *
     * IMPORTANT: This must be a function (not an IIFE) so the keyboard check
     * happens at trap ACTIVATION time, not render time. The useLayoutEffect
     * that sets wasOpenedViaKeyboardRef runs after render but before trap
     * activation, so a lazy check will see the correct value.
     *
     * Returns false for mouse opens (no auto-focus) or non-web platforms.
     * Returns HTMLElement (first button) for keyboard opens.
     */
    const computeInitialFocus = (): HTMLElement | false => {
        const platform = getPlatform();

        // Check ref LAZILY - this runs when FocusTrap activates (after useLayoutEffect)
        if (!wasOpenedViaKeyboardRef.current || platform !== CONST.PLATFORM.WEB) {
            return false;
        }

        // CRITICAL: Scope query to this modal's container
        // This prevents focusing buttons from OTHER open modals
        // in nested scenarios (e.g., ThreeDotsMenu → PopoverMenu → ConfirmModal)
        const container = modalContainerRef.current as unknown as HTMLElement;
        if (!container) {
            // Fallback: If container ref not set, use last dialog (legacy behavior)
            Log.warn('[ConfirmModal] modalContainerRef is null, falling back to last dialog');
            const dialogs = document.querySelectorAll('[role="dialog"]');
            const lastDialog = dialogs[dialogs.length - 1];
            const firstButton = lastDialog?.querySelector('button');
            return firstButton instanceof HTMLElement ? firstButton : false;
        }

        const firstButton = container.querySelector('button');

        Log.info('[ConfirmModal] initialFocus activated via keyboard', false, {
            foundButton: !!firstButton,
            buttonText: firstButton?.textContent?.slice(0, 30),
        });

        return firstButton instanceof HTMLElement ? firstButton : false;
    };

    // Perf: Prevents from rendering whole confirm modal on initial render.
    if (!isVisible && !prevVisible) {
        return null;
    }

    return (
        <Modal
            onClose={onCancel}
            onBackdropPress={onBackdropPress}
            isVisible={isVisible}
            shouldSetModalVisibility={shouldSetModalVisibility}
            onModalHide={() => {
                // Restore focus to captured anchor (web only)
                // This improves accessibility by returning focus to the trigger element
                if (getPlatform() === CONST.PLATFORM.WEB && capturedAnchorRef.current && document.body.contains(capturedAnchorRef.current)) {
                    capturedAnchorRef.current.focus();
                    Log.info('[ConfirmModal] Restored focus to captured anchor', false, {
                        anchorLabel: capturedAnchorRef.current.getAttribute('aria-label'),
                    });
                }
                // Reset the ref AFTER focus restoration (not in useLayoutEffect)
                capturedAnchorRef.current = null;
                onModalHide();
            }}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
            shouldEnableNewFocusManagement={shouldEnableNewFocusManagement}
            restoreFocusType={restoreFocusType}
            shouldHandleNavigationBack={shouldHandleNavigationBack}
            shouldIgnoreBackHandlerDuringTransition={shouldIgnoreBackHandlerDuringTransition}
            initialFocus={computeInitialFocus}
        >
            <View
                ref={modalContainerRef}
                testID="confirm-modal-container"
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
                    isVisible={isVisible}
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
                    imageStyles={imageStyles}
                    isConfirmLoading={isConfirmLoading}
                />
            </View>
        </Modal>
    );
}

export default ConfirmModal;
export type {ConfirmModalProps};
