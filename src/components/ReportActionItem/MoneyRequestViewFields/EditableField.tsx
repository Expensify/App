import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';

import CONST from '@src/CONST';

import type {ComponentProps} from 'react';

import React from 'react';

type EditableFieldProps = Pick<OfflineWithFeedbackProps, 'pendingAction'> &
    Pick<ComponentProps<typeof MenuItemField.Row>, 'name' | 'value'> &
    Pick<ComponentProps<typeof MenuItem.Root>, 'onPress'> & {
        /** Whether to show the chevron for the field's editor. */
        canEdit?: boolean;
        /** Validation or policy violation message to display below the field. */
        error?: string;
        /** Value available through the copy action. */
        copyValue?: string;
    };

function EditableField({pendingAction, name, value, onPress, canEdit = false, error, copyValue}: EditableFieldProps) {
    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <MenuItem.Root onPress={onPress}>
                <MenuItemField.Row
                    name={name}
                    value={value}
                    numberOfLinesValue={2}
                >
                    {!!error && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    {canEdit && <MenuItem.Chevron />}
                    {!!copyValue && <MenuItem.Copy value={copyValue} />}
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
