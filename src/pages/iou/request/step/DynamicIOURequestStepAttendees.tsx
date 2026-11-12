import useAllTransactionViolations from '@hooks/useAllTransactionViolations';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import usePrevious from '@hooks/usePrevious';
import useReportOwnerAsAttendee from '@hooks/useReportOwnerAsAttendee';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';

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
import type {Attendee} from '@src/types/onyx/IOU';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {loginSelector} from '@selectors/PersonalDetails';
import {deepEqual} from 'fast-equals';
import React, {useEffect, useRef, useState} from 'react';
import Onyx from 'react-native-onyx';

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
    const reportOwnerAsAttendee = useReportOwnerAsAttendee(transaction);
    const [attendees, setAttendees] = useState<Attendee[]>(() => getOriginalAttendees(transaction, reportOwnerAsAttendee));
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [iouReportOwnerLogin] = usePersonalDetail(parentReport?.ownerAccountID, loginSelector);
    const previousAttendees = usePrevious(attendees);
    const {translate} = useLocalize();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const allTransactionViolations = useAllTransactionViolations(transactionID);
    useRestartOnReceiptFailure(transaction, reportID, iouType, action);
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const delegateAccountID = useDelegateAccountID();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {isOffline} = useNetwork();

    // backPath briefly holds a transient redirect value before settling; MoneyRequestAttendeeSelector's
    // memo comparator ignores onFinish, so a stale closure can outlive the settle. Read via ref instead.
    const backPathRef = useRef(backPath);
    useEffect(() => {
        backPathRef.current = backPath;
    }, [backPath]);

    const saveAttendees = async () => {
        if (attendees.length <= 0) {
            return;
        }
        if (!deepEqual(previousAttendees, attendees)) {
            if (isEditing) {
                const [rules, policyCategories, policyTags, reportPolicyTags, introSelected] = await Onyx.multiGet([
                    ONYXKEYS.COLLECTION.RULE,
                    `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                    `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                    `${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`,
                    ONYXKEYS.NVP_INTRO_SELECTED,
                ]);
                updateMoneyRequestAttendees({
                    isVendorMatchingBetaEnabled,
                    transactionID,
                    transactionThreadReport: report,
                    parentReport,
                    iouReportOwnerLogin,
                    attendees,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    violations: allTransactionViolations,
                    currentUserAccountIDParam,
                    currentUserEmailParam,
                    isASAPSubmitBetaEnabled,
                    isOffline,
                    delegateAccountID,
                    reportPolicyTags,
                    isTrackIntentUser: isTrackIntentUserSelector(introSelected),
                    getCurrencyDecimals,
                    getCurrencySymbol,
                    rules,
                });
            } else {
                setMoneyRequestAttendees(transactionID, attendees, !isEditing);
            }
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
