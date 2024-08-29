import React, {useCallback, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import MoneyRequestAttendeeSelector from '@pages/iou/request/MoneyRequestAttendeeSelector';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Attendee} from '@src/types/onyx/IOU';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

// type IOURequestStartPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.ATTENDEE>;

type AttendeeSelectionPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.ATTENDEE>;

function AttendeeSelectionPage({
    route,
    route: {
        params: {iouType, backTo, action},
    },
}: AttendeeSelectionPageProps) {
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${route?.params.transactionID || -1}`);
    const [attendees, setAttendees] = useState<Attendee[]>(transaction?.attendees ?? []);
    const {translate} = useLocalize();

    const saveAttendees = useCallback(() => {}, []);

    const navigateBack = () => {
        if (attendees.length > 0) {
            saveAttendees();
        }
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
                onFinish={saveAttendees}
                onAttendeesAdded={(v) => setAttendees(v)}
                attendees={attendees}
                iouType={iouType}
                action={action}
            />
        </StepScreenWrapper>
    );
}

AttendeeSelectionPage.displayName = 'AttendeeSelectionPage';

export default withWritableReportOrNotFound(AttendeeSelectionPage);
