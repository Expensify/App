import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import UserPills from '@components/UserPills';
import useAttendees from '@hooks/useAttendees';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {enrichAndSortAttendees} from '@libs/AttendeeUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAttendeesListDisplayString} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {attendeeSliceSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

type AttendeeFieldProps = {
    formattedAmountPerAttendee: string;
    isReadOnly: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    formError: string;
};

function AttendeeField({formattedAmountPerAttendee, isReadOnly, transactionID, action, iouType, reportID, formError}: AttendeeFieldProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const personalDetailsList = usePersonalDetails();
    const [loginToAccountIDMap] = useOnyx(ONYXKEYS.DERIVED.LOGIN_TO_ACCOUNT_ID_MAP);
    const shouldDisplayAttendeesError = formError === 'violations.missingAttendees';

    const attendeeSlice = useTransactionSelector(transactionID, attendeeSliceSelector);

    const rawIouAttendees = useAttendees(attendeeSlice as OnyxEntry<OnyxTypes.Transaction>);
    const iouAttendees = enrichAndSortAttendees(rawIouAttendees, loginToAccountIDMap, personalDetailsList, localeCompare);

    return (
        <MenuItemWithTopDescription
            key="attendees"
            shouldShowRightIcon={!isReadOnly}
            accessibilityLabel={`${translate('iou.attendees')}, ${Array.isArray(iouAttendees) ? getAttendeesListDisplayString(iouAttendees) : ''}`}
            description={`${translate('iou.attendees')} ${
                iouAttendees?.length && iouAttendees.length > 1 && formattedAmountPerAttendee ? `· ${formattedAmountPerAttendee} ${translate('common.perPerson')}` : ''
            }`}
            descriptionTextStyle={styles.textLabelSupportingNormal}
            titleComponent={
                Array.isArray(iouAttendees) ? (
                    <UserPills
                        users={iouAttendees.map((a) => ({
                            avatar: a?.avatarUrl,
                            displayName: a?.displayName ?? a?.email ?? '',
                            accountID: a?.accountID,
                            email: a?.email,
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
