import lodashIsEqual from 'lodash/isEqual';
import React, {useCallback, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import Navigation from '@libs/Navigation/Navigation';
import * as TransactionUtils from '@libs/TransactionUtils';
import MoneyRequestAttendeeSelector from '@pages/iou/request/MoneyRequestAttendeeSelector';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepAttendeesOnyxProps = {
    /** The policy of the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;
};

type IOURequestStepAttendeesProps = IOURequestStepAttendeesOnyxProps & WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_ATTENDEES>;

function IOURequestStepAttendees({
    route: {
        params: {transactionID, reportID, iouType, backTo, action},
    },
    policy,
    policyTags,
    policyCategories,
}: IOURequestStepAttendeesProps) {
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const [transaction] = useOnyx(`${isEditing ? ONYXKEYS.COLLECTION.TRANSACTION : ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID || -1}`);
    const [attendees, setAttendees] = useState<Attendee[]>(() => TransactionUtils.getAttendees(transaction));
    const previousAttendees = usePrevious(attendees);
    const {translate} = useLocalize();
    const [violations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);

    const saveAttendees = useCallback(() => {
        if (attendees.length <= 0) {
            return;
        }
        if (!lodashIsEqual(previousAttendees, attendees)) {
            IOU.setMoneyRequestAttendees(transactionID, attendees, !isEditing);
            if (isEditing) {
                IOU.updateMoneyRequestAttendees(transactionID, reportID, attendees, policy, policyTags, policyCategories, violations);
            }
        }

        Navigation.goBack(backTo);
    }, [attendees, backTo, isEditing, policy, policyCategories, policyTags, previousAttendees, reportID, transactionID, violations]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.attendees')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepAttendees.displayName}
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

IOURequestStepAttendees.displayName = 'IOURequestStepAttendees';

export default withWritableReportOrNotFound(IOURequestStepAttendees);
