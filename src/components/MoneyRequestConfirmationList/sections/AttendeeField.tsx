import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import UserPills from '@components/UserPills';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {enrichAndSortAttendees} from '@libs/AttendeeUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAttendees, getAttendeesListDisplayString} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type AttendeeFieldProps = {
    formattedAmountPerAttendee: string;
    isReadOnly: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    formError: string;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
};

function AttendeeField({formattedAmountPerAttendee, isReadOnly, transactionID, action, iouType, reportID, formError, transaction}: AttendeeFieldProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetailsList = usePersonalDetails();
    const shouldDisplayAttendeesError = formError === 'violations.missingAttendees';

    const rawIouAttendees = getAttendees(transaction, currentUserPersonalDetails);
    const iouAttendees = enrichAndSortAttendees(rawIouAttendees, personalDetailsList, localeCompare);

    return (
        <MenuItemWithTopDescription
            key="attendees"
            shouldShowRightIcon={!isReadOnly}
            accessibilityLabel={`${translate('iou.attendees')}, ${Array.isArray(iouAttendees) ? getAttendeesListDisplayString(iouAttendees) : ''}`}
            description={`${translate('iou.attendees')} ${
                iouAttendees?.length && iouAttendees.length > 1 && formattedAmountPerAttendee ? `\u00B7 ${formattedAmountPerAttendee} ${translate('common.perPerson')}` : ''
            }`}
            descriptionTextStyle={styles.textLabelSupportingNormal}
            titleComponent={
                Array.isArray(iouAttendees) ? (
                    <UserPills
                        users={iouAttendees.map((a) => ({
                            avatar: a?.avatarUrl,
                            displayName: a?.displayName ?? a?.login ?? a?.email ?? '',
                            accountID: a?.accountID,
                            email: a?.email ?? a?.login,
                        }))}
                        maxVisible={isReadOnly ? iouAttendees.length : undefined}
                    />
                ) : undefined
            }
            style={[styles.moneyRequestMenuItem]}
            titleStyle={styles.flex1}
            onPress={() => {
                if (!transactionID) {
                    return;
                }

                Navigation.navigate(ROUTES.MONEY_REQUEST_ATTENDEE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute()));
            }}
            interactive={!isReadOnly}
            brickRoadIndicator={shouldDisplayAttendeesError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={shouldDisplayAttendeesError ? translate(formError as TranslationPaths) : ''}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.ATTENDEES_FIELD}
        />
    );
}

export default AttendeeField;
