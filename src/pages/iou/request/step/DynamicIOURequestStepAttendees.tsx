import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useReportOwnerAsAttendee from '@hooks/useReportOwnerAsAttendee';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useUpdateTransactionAttendees from '@hooks/useUpdateTransactionAttendees';

import Navigation from '@libs/Navigation/Navigation';
import {getOriginalAttendees} from '@libs/TransactionUtils';

import MoneyRequestAttendeeSelector from '@pages/iou/request/MoneyRequestAttendeeSelector';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Attendee} from '@src/types/onyx/IOU';

import {deepEqual} from 'fast-equals';
import React, {useEffect, useRef, useState} from 'react';

import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import StepScreenWrapper from './StepScreenWrapper';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepAttendeesProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_ATTENDEES>;

function DynamicIOURequestStepAttendees({
    route: {
        params: {transactionID, reportID, iouType, action},
    },
}: DynamicIOURequestStepAttendeesProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_ATTENDEE.path);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    // eslint-disable-next-line rulesdir/no-default-id-values
    const [transaction] = useOnyx(`${isEditing ? ONYXKEYS.COLLECTION.TRANSACTION : ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID || CONST.DEFAULT_NUMBER_ID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const {updateAttendees} = useUpdateTransactionAttendees({transactionID, report, isEditing});
    const reportOwnerAsAttendee = useReportOwnerAsAttendee(transaction);
    const [attendees, setAttendees] = useState<Attendee[]>(() => getOriginalAttendees(transaction, reportOwnerAsAttendee));
    const previousAttendees = usePrevious(attendees);
    const {translate} = useLocalize();
    useRestartOnReceiptFailure(transaction, reportID, iouType, action);

    // backPath briefly holds a transient redirect value before settling; MoneyRequestAttendeeSelector's
    // memo comparator ignores onFinish, so a stale closure can outlive the settle. Read via ref instead.
    const backPathRef = useRef(backPath);
    useEffect(() => {
        backPathRef.current = backPath;
    }, [backPath]);

    const saveAttendees = () => {
        if (attendees.length <= 0) {
            return;
        }
        if (!deepEqual(previousAttendees, attendees)) {
            updateAttendees(attendees);
        }

        Navigation.goBack(backPathRef.current, {shouldSkipFocusRestore: true});
    };

    const navigateBack = () => {
        Navigation.goBack(backPathRef.current);
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.attendees')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="DynamicIOURequestStepAttendees"
        >
            <MoneyRequestAttendeeSelector
                onFinish={saveAttendees}
                onAttendeesAdded={(v) => setAttendees(v)}
                attendees={attendees}
                iouType={iouType}
            />
        </StepScreenWrapper>
    );
}

export default withWritableReportOrNotFound(DynamicIOURequestStepAttendees);
