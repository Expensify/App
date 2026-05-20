import React from 'react';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';

type FieldRowOfflineProps = Omit<OfflineWithFeedbackProps, 'children'>;

type FieldRowProps = MenuItemProps & {
    /** Forwarded to MenuItemWithTopDescription for tag-row dependent-level highlighting; mirrors HighlightableMenuItem. */
    highlighted?: boolean;
} & FieldRowOfflineProps;

function FieldRow({
    pendingAction,
    errors,
    onClose,
    errorRowStyles,
    errorRowTextStyles,
    contentContainerStyle,
    shouldDisplayErrorAbove,
    shouldHideOnDelete,
    dismissError,
    ...menuItemProps
}: FieldRowProps) {
    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            errors={errors}
            onClose={onClose}
            errorRowStyles={errorRowStyles}
            errorRowTextStyles={errorRowTextStyles}
            contentContainerStyle={contentContainerStyle}
            shouldDisplayErrorAbove={shouldDisplayErrorAbove}
            shouldHideOnDelete={shouldHideOnDelete}
            dismissError={dismissError}
        >
            <MenuItemWithTopDescription
                 
                {...menuItemProps}
            />
        </OfflineWithFeedback>
    );
}

export default FieldRow;
export type {FieldRowProps};
