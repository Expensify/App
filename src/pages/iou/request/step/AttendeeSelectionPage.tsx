import React, {useRef, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as TransactionUtils from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {Attendee} from '@src/types/onyx/IOU';
import MoneyRequestAttendeeSelector from '../MoneyRequestAttendeeSelector';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStartPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.ATTENDEE>;

type AttendeeSelectionPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.ATTENDEE>;

function AttendeeSelectionPage({
    route,
    route: {
        params: {iouType, backTo, action},
    },
}: AttendeeSelectionPageProps) {
    // eslint-disable-next-line  @typescript-eslint/prefer-nullish-coalescing
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${route?.params.transactionID || -1}`);
    const [participants, setParticipants] = useState<Attendee[]>(transaction?.attendees || []);
    const {translate} = useLocalize();
    const transactionRequestType = useRef(TransactionUtils.getRequestType(transaction));

    const navigateBack = () => {
        // save if possible...
        Navigation.goBack(backTo);
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.attendees')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={AttendeeSelectionPage.displayName}
        >
            <MoneyRequestAttendeeSelector
                onFinish={() => {}}
                onParticipantsAdded={(v) => setParticipants(v)}
                participants={participants}
                iouType={iouType}
                iouRequestType={transactionRequestType.current}
                action={action}
            />
        </StepScreenWrapper>
    );
}

AttendeeSelectionPage.displayName = 'AttendeeSelectionPage';

export default withWritableReportOrNotFound(AttendeeSelectionPage);
