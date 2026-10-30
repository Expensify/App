import type {MenuItemProps} from '@components/MenuItem';
import MenuItem from '@components/MenuItem';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import UserPills from '@components/UserPills';

import useLocalize from '@hooks/useLocalize';

import type {AttendeeWithAccountID} from '@libs/AttendeeUtils';

import CONST from '@src/CONST';

import React from 'react';

import EditableField from './EditableField';

type AttendeesFieldProps = Pick<OfflineWithFeedbackProps, 'pendingAction'> &
    Pick<MenuItemProps, 'onPress' | 'errorText' | 'copyValue'> & {
        /** Expense participants with the names and avatars to display. */
        attendees: AttendeeWithAccountID[] | undefined;

        /** Plain text summary used by assistive technology. */
        title: string;

        /** Localized amount per person. An empty string omits it from the field label. */
        formattedPerAttendeeAmount: string;

        /** All attendees remain visible for copying when editing is unavailable. */
        canEdit: boolean;
    };

function AttendeesField({attendees, title, formattedPerAttendeeAmount, canEdit, errorText, copyValue, pendingAction, onPress}: AttendeesFieldProps) {
    const {translate} = useLocalize();
    const description = `${translate('iou.attendees')} ${
        Array.isArray(attendees) && attendees.length > 1 && formattedPerAttendeeAmount ? `${CONST.DOT_SEPARATOR} ${formattedPerAttendeeAmount} ${translate('common.perPerson')}` : ''
    }`;

    return (
        <EditableField
            pendingAction={pendingAction}
            name={description}
            accessibilityLabel={`${translate('iou.attendees')}, ${title}`}
            onPress={canEdit ? onPress : undefined}
            isValueSelectable={!!copyValue}
            error={errorText}
            valueComponent={
                Array.isArray(attendees) && attendees.length > 0 ? (
                    <UserPills
                        users={attendees.map((attendee) => ({
                            avatar: attendee?.avatarUrl,
                            displayName: attendee?.displayName ?? attendee?.email ?? '',
                            accountID: attendee?.accountID,
                            email: attendee?.email,
                        }))}
                        maxVisible={canEdit ? undefined : attendees.length}
                        isSelectable={!!copyValue}
                    />
                ) : undefined
            }
        >
            {!canEdit && !!copyValue && <MenuItem.Copy value={copyValue} />}
        </EditableField>
    );
}

export default AttendeesField;
