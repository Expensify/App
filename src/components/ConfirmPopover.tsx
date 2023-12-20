import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import ConfirmContent from './ConfirmContent';
import {PopoverAnchorPosition} from './Modal/types';
import Popover from './Popover';

type ConfirmPopoverProps = {
    /** Title of the modal */
    title: string;

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

    /** Is the action destructive */
    danger?: boolean;

    /** Whether we should show the cancel button */
    shouldShowCancelButton?: boolean;

    /** Modal content text/element */
    prompt?: string | React.ReactNode;

    /** Where the popover should be positioned */
    anchorPosition?: PopoverAnchorPosition;

    /** Styles for view */
    contentStyles?: StyleProp<ViewStyle>;
};

function ConfirmPopover({
    onConfirm,
    onCancel = () => {},
    isVisible,
    anchorPosition,
    contentStyles,
    title,
    prompt = '',
    confirmText = '',
    cancelText = '',
    danger = false,
    shouldShowCancelButton = true,
}: ConfirmPopoverProps) {
    return (
        <Popover
            onSubmit={onConfirm}
            onClose={onCancel}
            isVisible={isVisible}
            anchorPosition={anchorPosition}
        >
            <ConfirmContent
                // @ts-expect-error TODO: Remove this once ConfirmContent (https://github.com/Expensify/App/issues/25047) is migrated to TypeScript.
                contentStyles={contentStyles}
                title={title}
                // @ts-expect-error TODO: Remove this once ConfirmContent (https://github.com/Expensify/App/issues/25047) is migrated to TypeScript.
                prompt={prompt}
                confirmText={confirmText}
                cancelText={cancelText}
                danger={danger}
                shouldShowCancelButton={shouldShowCancelButton}
                onConfirm={onConfirm}
                onCancel={onCancel}
                onClose={onCancel}
            />
        </Popover>
    );
}

ConfirmPopover.displayName = 'ConfirmPopover';

export default ConfirmPopover;
