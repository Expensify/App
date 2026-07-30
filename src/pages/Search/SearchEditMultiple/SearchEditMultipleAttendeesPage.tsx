import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';
import Navigation from '@libs/Navigation/Navigation';

import MoneyRequestAttendeeSelector from '@pages/iou/request/MoneyRequestAttendeeSelector';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';

import {deepEqual} from 'fast-equals';
import React, {useState} from 'react';

import {getSharedSingleAttendeeForBulkEdit} from './SearchEditMultipleUtils';

function SearchEditMultipleAttendeesPage() {
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`);
    const selectedTransactionIDs = draftTransaction?.selectedTransactionIDs ?? [];
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const [attendees, setAttendees] = useState<Attendee[]>(() => {
        const draftAttendees = draftTransaction?.comment?.attendees ?? [];
        if (draftAttendees.length > 0) {
            return draftAttendees;
        }

        const selectedTransactions = selectedTransactionIDs.flatMap((transactionID) => {
            const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
            if (!transaction) {
                return [];
            }
            return [
                {
                    transaction,
                    report: allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`],
                },
            ];
        });

        const sharedAttendee = getSharedSingleAttendeeForBulkEdit(selectedTransactions, personalDetailsList, currentUserPersonalDetails);
        return sharedAttendee ? [sharedAttendee] : [];
    });

    const saveAttendees = () => {
        if (attendees.length <= 0) {
            return;
        }

        const currentAttendees = draftTransaction?.comment?.attendees ?? [];
        if (deepEqual(currentAttendees, attendees)) {
            Navigation.goBack();
            return;
        }

        updateBulkEditDraftTransaction({comment: {attendees}});
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="SearchEditMultipleAttendeesPage"
        >
            <HeaderWithBackButton
                title={translate('iou.attendees')}
                onBackButtonPress={Navigation.goBack}
            />
            <MoneyRequestAttendeeSelector
                onFinish={saveAttendees}
                onAttendeesAdded={setAttendees}
                attendees={attendees}
                iouType={CONST.IOU.TYPE.SUBMIT}
                shouldDeferEmptySelectionError
            />
        </ScreenWrapper>
    );
}

export default SearchEditMultipleAttendeesPage;
