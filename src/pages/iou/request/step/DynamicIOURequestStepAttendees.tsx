import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useReportOwnerAsAttendee from '@hooks/useReportOwnerAsAttendee';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useTransactionViolations from '@hooks/useTransactionViolations';

import {setMoneyRequestAttendees} from '@libs/actions/IOU/MoneyRequest';
import {updateMoneyRequestAttendees} from '@libs/actions/IOU/UpdateMoneyRequest';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalAttendees} from '@libs/TransactionUtils';

import MoneyRequestAttendeeSelector from '@pages/iou/request/MoneyRequestAttendeeSelector';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import type {Attendee} from '@src/types/onyx/IOU';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {deepEqual} from 'fast-equals';
import React, {useCallback, useState} from 'react';

import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import StepScreenWrapper from './StepScreenWrapper';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepAttendeesProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_ATTENDEES>;

function DynamicIOURequestStepAttendees({
    route: {
        params: {transactionID, reportID, iouType, action},
    },
}: DynamicIOURequestStepAttendeesProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_ATTENDEE.path);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    // eslint-disable-next-line rulesdir/no-default-id-values
    const [transaction] = useOnyx(`${isEditing ? ONYXKEYS.COLLECTION.TRANSACTION : ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID || CONST.DEFAULT_NUMBER_ID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const policyID = report?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const reportOwnerAsAttendee = useReportOwnerAsAttendee(transaction);
    const [attendees, setAttendees] = useState<Attendee[]>(() => getOriginalAttendees(transaction, reportOwnerAsAttendee));
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [iouReportOwnerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(parentReport?.ownerAccountID)});
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const previousAttendees = usePrevious(attendees);
    const {translate} = useLocalize();
    const transactionViolations = useTransactionViolations(transactionID);
    useRestartOnReceiptFailure(transaction, reportID, iouType, action);
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const delegateAccountID = useDelegateAccountID();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {isOffline} = useNetwork();

    const saveAttendees = useCallback(() => {
        if (attendees.length <= 0) {
            return;
        }
        if (!deepEqual(previousAttendees, attendees)) {
            if (isEditing) {
                updateMoneyRequestAttendees({
                    transactionID,
                    transactionThreadReport: report,
                    parentReport,
                    iouReportOwnerLogin,
                    attendees,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    violations: transactionViolations ?? undefined,
                    currentUserAccountIDParam,
                    currentUserEmailParam,
                    isASAPSubmitBetaEnabled,
                    parentReportNextStep,
                    isOffline,
                    delegateAccountID,
                    reportPolicyTags,
                    isTrackIntentUser,
                });
            } else {
                setMoneyRequestAttendees(transactionID, attendees, !isEditing);
            }
        }

        Navigation.goBack(backPath, {shouldSkipFocusRestore: true});
    }, [
        attendees,
        previousAttendees,
        backPath,
        transactionID,
        isEditing,
        report,
        parentReport,
        iouReportOwnerLogin,
        policy,
        policyTags,
        policyCategories,
        transactionViolations,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        parentReportNextStep,
        isOffline,
        delegateAccountID,
        reportPolicyTags,
        isTrackIntentUser,
    ]);

    const navigateBack = () => {
        Navigation.goBack(backPath);
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
