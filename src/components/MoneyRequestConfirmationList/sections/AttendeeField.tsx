import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {SELECTION_LIST_POPOVER_HEADER_HEIGHT} from '@components/SelectionListPopoverHeader';
import UserPills from '@components/UserPills';

import useAttendees from '@hooks/useAttendees';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {enrichAndSortAttendees} from '@libs/AttendeeUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getAttendeesListDisplayString} from '@libs/TransactionUtils';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';

import AttendeeFieldDropdown from './AttendeeFieldDropdown';
import ExpenseFieldDropdown from './ExpenseFieldDropdown';
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
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {shouldUseDropdownRows} = useExpenseFormLayout();
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const personalDetailsList = usePersonalDetails();
    const [loginToAccountIDMap] = useOnyx(ONYXKEYS.DERIVED.LOGIN_TO_ACCOUNT_ID_MAP);
    const {isBetaEnabled} = usePermissions();
    const {didConfirm} = useConfirmationFields();
    const shouldDisplayAttendeesError = formError === 'violations.missingAttendees';

    const attendeeSlice = useTransactionSelector(transactionID, attendeeSliceSelector);

    const rawIouAttendees = useAttendees(attendeeSlice as OnyxEntry<OnyxTypes.Transaction>);
    const iouAttendees = enrichAndSortAttendees(rawIouAttendees, loginToAccountIDMap, personalDetailsList, localeCompare);

    // The row uses this as its placeholder and as its accessibility label too, so it cannot carry a trailing space.
    const attendeesDescription =
        iouAttendees?.length && iouAttendees.length > 1 && formattedAmountPerAttendee
            ? `${translate('iou.attendees')} · ${formattedAmountPerAttendee} ${translate('common.perPerson')}`
            : translate('iou.attendees');
    const attendeesAccessibilityLabel = `${translate('iou.attendees')}, ${Array.isArray(iouAttendees) ? getAttendeesListDisplayString(iouAttendees, formatPhoneNumber) : ''}`;
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

    // The dropdown writes the applied selection to the draft, so it stays closed once the expense is submitted and the
    // draft is on its way out, as the category, tag and tax dropdowns do. A saved expense being edited keeps the full page,
    // which saves once through the API with the expense's report and policy in hand.
    const shouldOpenInDropdown = isBetaEnabled(CONST.BETAS.ANCHORED_FIELD_DROPDOWNS) && !!transactionID && !isReadOnly && !didConfirm && action !== CONST.IOU.ACTION.EDIT;

    if (shouldUseDropdownRows) {
        return (
            <ExpenseFieldDropdown
                name={attendeesDescription}
                valueComponent={attendeePills}
                // The creator is always an attendee, so the row reads as filled in from the start.
                hasValueComponent
                accessibilityLabel={attendeesAccessibilityLabel}
                errorText={shouldDisplayAttendeesError ? translate(formError as TranslationPaths) : ''}
                onPress={openAttendeePage}
                shouldOpenInDropdown={shouldOpenInDropdown}
                listHeaderHeight={SELECTION_LIST_POPOVER_HEADER_HEIGHT}
                renderDropdown={(dropdownProps) =>
                    !!transactionID && (
                        <AttendeeFieldDropdown
                            {...dropdownProps}
                            transactionID={transactionID}
                            iouType={iouType}
                        />
                    )
                }
                isInteractive={!isReadOnly}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.ATTENDEES_FIELD}
            />
        );
    }

    return (
        <MenuItem.Root
            onPress={isReadOnly ? undefined : callFunctionIfActionIsAllowed(openAttendeePage, false, session)}
            accessibilityLabel={attendeesAccessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.ATTENDEES_FIELD}
        >
            <MenuItem.Row>
                <MenuItemField.Content name={attendeesDescription}>{attendeePills}</MenuItemField.Content>
                {(shouldDisplayAttendeesError || !isReadOnly) && (
                    <MenuItem.Trailing>
                        {shouldDisplayAttendeesError && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                        {!isReadOnly && <MenuItem.Chevron />}
                    </MenuItem.Trailing>
                )}
            </MenuItem.Row>
            {shouldDisplayAttendeesError && (
                <MenuItem.HelpText
                    isError
                    message={translate(formError as TranslationPaths)}
                />
            )}
        </MenuItem.Root>
    );
}

export default AttendeeField;
