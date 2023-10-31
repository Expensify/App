import PropTypes from 'prop-types';
import React from 'react';
import ConfirmContent from './ConfirmContent';
import Popover from './Popover';
import withWindowDimensions from './withWindowDimensions';

type ConfirmPopoverProps = {
    title: string;
    onConfirm: () => void;
    onCancel?: () => void;
    isVisible: boolean;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    shouldShowCancelButton?: boolean;
    prompt?: string | React.ReactNode;
    anchorPosition: {
        top: number;
        left: number;
    };
    contentStyles?: any[];
    // TODO: add props from withWindowDimensions
};
function ConfirmPopover({
    title,
    onConfirm,
    onCancel = () => {},
    isVisible,
    confirmText = '',
    cancelText = '',
    danger = false,
    anchorPosition,
    prompt = '',
    shouldShowCancelButton = true,
    contentStyles = [],
}: ConfirmPopoverProps) {
    return (
        <Popover
            onSubmit={onConfirm}
            onClose={onCancel}
            isVisible={isVisible}
            anchorPosition={anchorPosition}
        >
            <ConfirmContent
                contentStyles={contentStyles}
                title={title}
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

ConfirmPopover.propTypes = propTypes;
ConfirmPopover.defaultProps = defaultProps;
ConfirmPopover.displayName = 'ConfirmPopover';
export default withWindowDimensions(ConfirmPopover);
