import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import UserPills from '@components/UserPills';

import useAttendees from '@hooks/useAttendees';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {enrichAndSortAttendees} from '@libs/AttendeeUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getAttendeesListDisplayString} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import ExpenseFieldRow from './ExpenseFieldRow';
import {useExpenseFormLayout} from './ExpenseFormLayoutContext';
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
    const {shouldUseDropdownRows} = useExpenseFormLayout();
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const personalDetailsList = usePersonalDetails();
    const [loginToAccountIDMap] = useOnyx(ONYXKEYS.DERIVED.LOGIN_TO_ACCOUNT_ID_MAP);
    const shouldDisplayAttendeesError = formError === 'violations.missingAttendees';

    const attendeeSlice = useTransactionSelector(transactionID, attendeeSliceSelector);

    const rawIouAttendees = useAttendees(attendeeSlice as OnyxEntry<OnyxTypes.Transaction>);
    const iouAttendees = enrichAndSortAttendees(rawIouAttendees, loginToAccountIDMap, personalDetailsList, localeCompare);

    // The row uses this as its placeholder and as its accessibility label too, so it cannot carry a trailing space.
    const attendeesDescription =
        iouAttendees?.length && iouAttendees.length > 1 && formattedAmountPerAttendee
            ? `${translate('iou.attendees')} · ${formattedAmountPerAttendee} ${translate('common.perPerson')}`
            : translate('iou.attendees');
    const attendeesAccessibilityLabel = `${translate('iou.attendees')}, ${Array.isArray(iouAttendees) ? getAttendeesListDisplayString(iouAttendees) : ''}`;
    const attendeePills = Array.isArray(iouAttendees) ? (
        <UserPills
            users={iouAttendees.map((a) => ({
                avatar: a?.avatarUrl,
                displayName: a?.displayName ?? a?.email ?? '',
                accountID: a?.accountID,
                email: a?.email,
            }))}
            maxVisible={isReadOnly ? iouAttendees.length : undefined}
        />
    ) : undefined;

    const openAttendeePage = () => {
        if (!transactionID) {
            return;
        }

        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_ATTENDEE.getRoute(action, iouType, transactionID, reportID)));
    };

    if (shouldUseDropdownRows) {
        return (
            <ExpenseFieldRow
                name={attendeesDescription}
                valueComponent={attendeePills}
                // The creator is always an attendee, so the row reads as filled in from the start.
                hasValueComponent
                accessibilityLabel={attendeesAccessibilityLabel}
                errorText={shouldDisplayAttendeesError ? translate(formError as TranslationPaths) : ''}
                onPress={openAttendeePage}
                isInteractive={!isReadOnly}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.ATTENDEES_FIELD}
            />
        );
    }

    return (
        <MenuItemWithTopDescription
            key="attendees"
            shouldShowRightIcon={!isReadOnly}
            accessibilityLabel={attendeesAccessibilityLabel}
            description={attendeesDescription}
            descriptionTextStyle={styles.textLabelSupportingNormal}
            titleComponent={attendeePills}
            style={[styles.moneyRequestMenuItem]}
            titleStyle={styles.flex1}
            onPress={openAttendeePage}
            interactive={!isReadOnly}
            brickRoadIndicator={shouldDisplayAttendeesError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={shouldDisplayAttendeesError ? translate(formError as TranslationPaths) : ''}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.ATTENDEES_FIELD}
        />
    );
}

export default AttendeeField;
