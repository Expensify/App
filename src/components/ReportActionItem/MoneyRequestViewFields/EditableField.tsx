import MenuItem from '@components/MenuItem';
import type {MenuItemRootProps} from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';

import hasRenderableChildren from '@libs/hasRenderableChildren';

import CONST from '@src/CONST';

import type {PropsWithChildren, ReactNode} from 'react';

import React from 'react';

type EditableFieldProps = PropsWithChildren<
    Pick<OfflineWithFeedbackProps, 'pendingAction'> &
        Pick<MenuItemRootProps, 'onPress' | 'accessibilityLabel'> & {
            /** Localized label that also acts as the placeholder when the expense value is empty. */
            name: string;

            /** Plain text value. Omitted when valueComponent supplies custom content. */
            value?: string;

            /** Allows native text selection independently of whether the editor is available. */
            isValueSelectable?: boolean;

            /** Maximum number of visible value lines. Use 0 to display the full value. */
            numberOfLinesValue?: number;

            /** Validation feedback for an invalid expense value. */
            error?: ReactNode;

            /** Replaces the plain text value with rich content such as attendee pills. */
            valueComponent?: ReactNode;

            /** Additional context about the expense value. */
            hintText?: ReactNode;

            /** Content displayed below the value, such as a merchant search link. */
            footer?: ReactNode;
        }
>;

function EditableField({
    pendingAction,
    name,
    value,
    onPress,
    error,
    children,
    isValueSelectable,
    numberOfLinesValue = 2,
    valueComponent,
    accessibilityLabel,
    hintText,
    footer,
}: EditableFieldProps) {
    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <MenuItem.Root
                onPress={onPress}
                accessibilityLabel={accessibilityLabel}
                shouldAllowTextSelection={isValueSelectable}
            >
                <MenuItem.Row>
                    <MenuItemField.Content name={name}>
                        {valueComponent ??
                            (value ? (
                                <MenuItem.FieldValue
                                    numberOfLines={numberOfLinesValue}
                                    isSelectable={isValueSelectable}
                                >
                                    {value}
                                </MenuItem.FieldValue>
                            ) : undefined)}
                    </MenuItemField.Content>
                    {(!!error || !!onPress || hasRenderableChildren(children)) && (
                        <MenuItem.Trailing>
                            {!!error && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                            {!!onPress && <MenuItem.Chevron />}
                            {children}
                        </MenuItem.Trailing>
                    )}
                </MenuItem.Row>
                {!!hintText && <MenuItem.HelpText message={hintText} />}
                {footer}
                {!!error && (
                    <MenuItem.HelpText
                        isError
                        message={error}
                    />
                )}
            </MenuItem.Root>
        </OfflineWithFeedback>
    );
}

export default EditableField;
