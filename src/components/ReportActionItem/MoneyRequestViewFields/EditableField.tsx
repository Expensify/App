// Keeps an expense field's offline state and validation feedback together.
import MenuItem from '@components/MenuItem';
import type {MenuItemRootProps} from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';

import CONST from '@src/CONST';

import type {PropsWithChildren} from 'react';

import React from 'react';

type EditableFieldProps = PropsWithChildren<
    Pick<OfflineWithFeedbackProps, 'pendingAction'> &
        Pick<MenuItemRootProps, 'onPress'> & {
            name: string;
            value?: string;
            /** Validation or policy violation message to display below the field. */
            error?: string;
        }
>;

function EditableField({pendingAction, name, value, onPress, error, children}: EditableFieldProps) {
    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <MenuItem.Root onPress={onPress}>
                <MenuItemField.Row
                    name={name}
                    value={value}
                    numberOfLinesValue={2}
                >
                    {!!error && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    {!!onPress && <MenuItem.Chevron />}
                    {children}
                </MenuItemField.Row>
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
