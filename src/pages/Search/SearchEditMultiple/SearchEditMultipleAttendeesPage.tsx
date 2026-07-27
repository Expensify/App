import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';
import Navigation from '@libs/Navigation/Navigation';
import {getReportOwnerAsAttendee} from '@libs/TransactionUtils';

import MoneyRequestAttendeeSelector from '@pages/iou/request/MoneyRequestAttendeeSelector';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';

import {deepEqual} from 'fast-equals';
import React, {useRef, useState} from 'react';

function SearchEditMultipleAttendeesPage() {
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`);

    // Seed with current user when draft is empty.
    const [attendees, setAttendees] = useState<Attendee[]>(() => {
        const draftAttendees = draftTransaction?.comment?.attendees ?? [];
        if (draftAttendees.length > 0) {
            return draftAttendees;
        }
        const currentUserAsAttendee = getReportOwnerAsAttendee(currentUserPersonalDetails);
        return currentUserAsAttendee ? [currentUserAsAttendee] : [];
    });
    const attendeesOnOpen = useRef(attendees);
    const hadDraftAttendeesOnOpen = useRef((draftTransaction?.comment?.attendees?.length ?? 0) > 0);

    const saveAttendees = () => {
        if (attendees.length <= 0) {
            return;
        }

        const currentAttendees = draftTransaction?.comment?.attendees ?? [];
        if (deepEqual(currentAttendees, attendees)) {
            updateBulkEditDraftTransaction({comment: {attendees: null}});
            Navigation.goBack();
            return;
        }

        if (!hadDraftAttendeesOnOpen.current && deepEqual(attendeesOnOpen.current, attendees)) {
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
            />
        </ScreenWrapper>
    );
}

export default SearchEditMultipleAttendeesPage;
