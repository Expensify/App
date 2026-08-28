import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {MoneyRequestViewData} from '@components/ReportActionItem/MoneyRequestView/useMoneyRequestViewData';
import UserPills from '@components/UserPills';

import CONST from '@src/CONST';

type AttendeesFieldProps = {
    data: MoneyRequestViewData;
};

function AttendeesField({data}: AttendeesFieldProps) {
    return (
        <OfflineWithFeedback pendingAction={data.getPendingFieldAction('attendees')}>
            <MenuItemWithTopDescription
                key="attendees"
                accessibilityLabel={`${data.translate('iou.attendees')}, ${data.getAttendeesTitle}`}
                description={`${data.translate('iou.attendees')} ${
                    Array.isArray(data.actualAttendees) && data.actualAttendees.length > 1 && data.formattedPerAttendeeAmount
                        ? `${CONST.DOT_SEPARATOR} ${data.formattedPerAttendeeAmount} ${data.translate('common.perPerson')}`
                        : ''
                }`}
                descriptionTextStyle={data.styles.textLabelSupportingNormal}
                titleComponent={
                    Array.isArray(data.actualAttendees) ? (
                        <UserPills
                            users={data.actualAttendees.map((a) => ({
                                avatar: a?.avatarUrl,
                                displayName: a?.displayName ?? a?.email ?? '',
                                accountID: a?.accountID,
                                email: a?.email,
                            }))}
                            maxVisible={data.canEdit ? undefined : data.actualAttendees.length}
                        />
                    ) : undefined
                }
                style={[data.styles.moneyRequestMenuItem]}
                titleStyle={data.styles.flex1}
                onPress={data.onAttendeesPress}
                brickRoadIndicator={data.getErrorForField('attendees') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={data.getErrorForField('attendees')}
                interactive={data.canEdit}
                shouldShowRightIcon={data.canEdit}
                copyValue={data.attendeesCopyValue}
                copyable={!!data.attendeesCopyValue}
            />
        </OfflineWithFeedback>
    );
}

AttendeesField.displayName = 'AttendeesField';

export default AttendeesField;
