import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

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

function SearchEditMultipleAttendeesPage() {
    const {translate} = useLocalize();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`);
    const [attendees, setAttendees] = useState<Attendee[]>(() => draftTransaction?.comment?.attendees ?? []);

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
