import React, {useCallback, useState} from 'react';
import Onyx from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import {getAttendees} from '@libs/TransactionUtils';
import MoneyRequestAttendeeSelector from '@pages/iou/request/MoneyRequestAttendeeSelector';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';

function SearchEditMultipleAttendeesPage() {
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {canBeMissing: true});

    const [attendees, setAttendees] = useState<Attendee[]>(() => getAttendees(draftTransaction, currentUserPersonalDetails));

    const saveAttendees = useCallback(() => {
        if (attendees.length <= 0) {
            Navigation.goBack();
            return;
        }
        Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {
            comment: {
                ...draftTransaction?.comment,
                attendees,
            },
        });
        Navigation.goBack();
    }, [attendees, draftTransaction?.comment]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={SearchEditMultipleAttendeesPage.displayName}
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
                action={CONST.IOU.ACTION.EDIT}
            />
        </ScreenWrapper>
    );
}

SearchEditMultipleAttendeesPage.displayName = 'SearchEditMultipleAttendeesPage';

export default SearchEditMultipleAttendeesPage;
