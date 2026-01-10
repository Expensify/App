import {deepEqual} from 'fast-equals';
import React, {useCallback, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {setMoneyRequestAttendees, updateMoneyRequestAttendees} from '@libs/actions/IOU';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalAttendees} from '@libs/TransactionUtils';
import MoneyRequestAttendeeSelector from '@pages/iou/request/MoneyRequestAttendeeSelector';
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
    report,
    policy,
    policyTags,
    policyCategories,
}: IOURequestStepAttendeesProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    // eslint-disable-next-line rulesdir/no-default-id-values
    const [transaction] = useOnyx(`${isEditing ? ONYXKEYS.COLLECTION.TRANSACTION : ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID || CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});
    const [attendees, setAttendees] = useState<Attendee[]>(() => getOriginalAttendees(transaction, currentUserPersonalDetails));
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {canBeMissing: true});
    const previousAttendees = usePrevious(attendees);
    const {translate} = useLocalize();
    const transactionViolations = useTransactionViolations(transactionID);
    useRestartOnReceiptFailure(transaction, reportID, iouType, action);
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const saveAttendees = useCallback(() => {
        if (attendees.length <= 0) {
            return;
        }
        if (!deepEqual(previousAttendees, attendees)) {
            setMoneyRequestAttendees(transactionID, attendees, !isEditing);
            if (isEditing) {
                updateMoneyRequestAttendees({
                    transactionID,
                    transactionThreadReport: report,
                    parentReport,
                    attendees,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    violations: transactionViolations ?? undefined,
                    currentUserAccountIDParam,
                    currentUserEmailParam,
                    isASAPSubmitBetaEnabled,
                });
            }
        }

        Navigation.goBack(backTo);
    }, [
        attendees,
        previousAttendees,
        backTo,
        transactionID,
        isEditing,
        report,
        parentReport,
        policy,
        policyTags,
        policyCategories,
        transactionViolations,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
    ]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.attendees')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="IOURequestStepAttendees"
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

export default withWritableReportOrNotFound(IOURequestStepAttendees);
