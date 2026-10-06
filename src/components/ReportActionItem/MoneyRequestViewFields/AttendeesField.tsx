// Displays expense attendees and their per-person amount.
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import UserPills from '@components/UserPills';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {AttendeeWithAccountID} from '@libs/AttendeeUtils';

import CONST from '@src/CONST';

import React from 'react';

type AttendeesFieldProps = Pick<OfflineWithFeedbackProps, 'pendingAction'> &
    Pick<MenuItemProps, 'onPress' | 'errorText' | 'copyValue'> & {
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
        <OfflineWithFeedback pendingAction={pendingAction}>
            <MenuItemWithTopDescription
                accessibilityLabel={`${translate('iou.attendees')}, ${title}`}
                description={`${translate('iou.attendees')} ${
                    Array.isArray(attendees) && attendees.length > 1 && formattedPerAttendeeAmount
                        ? `${CONST.DOT_SEPARATOR} ${formattedPerAttendeeAmount} ${translate('common.perPerson')}`
                        : ''
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
        </OfflineWithFeedback>
    );
}

export default AttendeesField;
