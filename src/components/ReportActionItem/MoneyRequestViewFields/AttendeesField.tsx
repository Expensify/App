import UserPills from '@components/UserPills';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

type AttendeeWithAccountID = {
    accountID?: string;
    avatarUrl?: string | null;
    displayName?: string | null;
    email?: string | null;
};

import type {ComponentProps} from 'react';

import React from 'react';

import TextField from './TextField';

type AttendeesFieldProps = Pick<ComponentProps<typeof TextField>, 'pendingAction' | 'onPress' | 'errorText' | 'copyValue'> & {
    /** Attendees enriched with their personal details and sorted for display. */
    attendees: AttendeeWithAccountID[] | undefined;
    /** Plain text summary used by assistive technology. */
    title: string;
    /** Formatted expense amount per attendee. */
    formattedPerAttendeeAmount: string;
    /** Whether the attendees can be edited. */
    canEdit: boolean;
};

function AttendeesField({attendees, title, formattedPerAttendeeAmount, canEdit, errorText, copyValue, pendingAction, onPress}: AttendeesFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <TextField
            pendingAction={pendingAction}
            accessibilityLabel={`${translate('iou.attendees')}, ${title}`}
            description={`${translate('iou.attendees')} ${
                Array.isArray(attendees) && attendees.length > 1 && formattedPerAttendeeAmount ? `${CONST.DOT_SEPARATOR} ${formattedPerAttendeeAmount} ${translate('common.perPerson')}` : ''
            }`}
            descriptionTextStyle={styles.textLabelSupportingNormal}
            titleComponent={
                Array.isArray(attendees) ? (
                    <UserPills
                        users={attendees.map((attendee) => ({
                            avatar: attendee?.avatarUrl,
                            displayName: attendee?.displayName ?? attendee?.email ?? '',
                            accountID: attendee?.accountID,
                            email: attendee?.email,
                        }))}
                        maxVisible={canEdit ? undefined : attendees.length}
                    />
                ) : undefined
            }
            style={[styles.moneyRequestMenuItem]}
            titleStyle={styles.flex1}
            onPress={onPress}
            brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={errorText}
            interactive={canEdit}
            shouldShowRightIcon={canEdit}
            copyValue={copyValue}
            copyable={!!copyValue}
        />
    );
}

export default AttendeesField;
