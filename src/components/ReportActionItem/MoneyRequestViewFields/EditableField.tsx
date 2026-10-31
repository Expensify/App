/** Shares the field layout and offline feedback used by expense editors. */
import MenuItem from '@components/MenuItem';
import type {MenuItemRootProps} from '@components/MenuItem/layout/MenuItemRoot';
import {useMenuItemConfig} from '@components/MenuItem/MenuItemContext';
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

            value?: string;

            /** Allows native text selection independently of whether the editor is available. */
            isValueSelectable?: boolean;

            /** Maximum number of visible value lines. Use 0 to display the full value. */
            numberOfLinesValue?: number;

            /** Validation feedback for an invalid expense value. */
            error?: ReactNode;

            /** Additional context about the expense value. */
            hintText?: ReactNode;
        }
>;

type EditableFieldRootProps = PropsWithChildren<Pick<OfflineWithFeedbackProps, 'pendingAction'> & Pick<MenuItemRootProps, 'onPress' | 'accessibilityLabel' | 'shouldAllowTextSelection'>>;

function EditableFieldRoot({pendingAction, onPress, accessibilityLabel, shouldAllowTextSelection, children}: EditableFieldRootProps) {
    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <MenuItem.Root
                onPress={onPress}
                accessibilityLabel={accessibilityLabel}
                shouldAllowTextSelection={shouldAllowTextSelection}
            >
                {children}
            </MenuItem.Root>
        </OfflineWithFeedback>
    );
}

function EditableFieldActions({children}: PropsWithChildren) {
    const {isInteractive} = useMenuItemConfig();
    if (!isInteractive && !hasRenderableChildren(children)) {
        return null;
    }

    return (
        <MenuItem.Trailing>
            {children}
            {isInteractive && <MenuItem.Chevron />}
        </MenuItem.Trailing>
    );
}

function EditableFieldPreset({pendingAction, name, value, onPress, error, children, isValueSelectable, numberOfLinesValue = 2, accessibilityLabel, hintText}: EditableFieldProps) {
    return (
        <EditableFieldRoot
            pendingAction={pendingAction}
            onPress={onPress}
            accessibilityLabel={accessibilityLabel}
            shouldAllowTextSelection={isValueSelectable}
        >
            <MenuItem.Row>
                <MenuItemField.Content name={name}>
                    {value ? (
                        <MenuItem.FieldValue
                            numberOfLines={numberOfLinesValue}
                            isSelectable={isValueSelectable}
                        >
                            {value}
                        </MenuItem.FieldValue>
                    ) : undefined}
                </MenuItemField.Content>
                <EditableFieldActions>
                    {!!error && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    {children}
                </EditableFieldActions>
            </MenuItem.Row>
            {!!hintText && <MenuItem.HelpText message={hintText} />}
            {!!error && (
                <MenuItem.HelpText
                    isError
                    message={error}
                />
            )}
        </EditableFieldRoot>
    );
}

const EditableField = Object.assign(EditableFieldPreset, {Root: EditableFieldRoot, Actions: EditableFieldActions});

export default EditableField;
