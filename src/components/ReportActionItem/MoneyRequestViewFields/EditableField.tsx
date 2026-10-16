// Keeps an expense field's offline state and validation feedback together.
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
            name: string;
            value?: string;
            isValueSelectable?: boolean;
            /** Defaults to 2; use 0 to display the full value. */
            numberOfLinesValue?: number;
            error?: ReactNode;
            valueComponent?: ReactNode;
            hintText?: ReactNode;
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
