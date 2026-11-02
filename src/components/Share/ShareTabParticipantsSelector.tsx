import {prepareConfirmationFocusRestore} from '@components/MoneyRequestConfirmationList/focusManager';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';

import {clearMoneyRequest, clearMoneyRequestPolicyFields} from '@libs/actions/IOU/MoneyRequest';
import {clearUnknownUserDetails, saveUnknownUserDetails} from '@libs/actions/Share';
import Navigation from '@libs/Navigation/Navigation';
import {getPolicyExpenseChat} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';
import {cancelSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';

import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';

import {getOptimisticChatReport, saveReportDraft} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type {Report, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useRef, useState} from 'react';

const hasReportsSelector = (reports: OnyxCollection<Report>) => Object.keys(reports ?? {}).length > 0;
const transactionAmountSelector = (transaction: OnyxEntry<Transaction>) => transaction?.amount;

type ShareTabParticipantsSelectorProps = {
    detailsPageRouteObject: typeof ROUTES.SHARE_SUBMIT_DETAILS | typeof ROUTES.SHARE_DETAILS;
};

function ShareTabParticipantsSelectorComponent({detailsPageRouteObject}: ShareTabParticipantsSelectorProps) {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [draftTransactionAmount] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {selector: transactionAmountSelector});
    const [selectedReportID, setSelectedReportID] = useState<string | number | undefined>();
    const [selectedPolicyID, setSelectedPolicyID] = useState<string | undefined>();

    const isSubmitFlow = detailsPageRouteObject === ROUTES.SHARE_SUBMIT_DETAILS;

    const {isRestrictedToPreferredPolicy, preferredPolicyID, isLoadingPreferredPolicy} = usePreferredPolicy();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);

    const canUseDefaultPolicy =
        isSubmitFlow &&
        !isRestrictedToPreferredPolicy &&
        // Use CREATE because shouldUseDefaultExpensePolicy is the existing eligibility predicate for automatically selecting
        // a default expense policy; passing SUBMIT would always return false.
        shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.CREATE, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, currentUserAccountID);

    // A domain restriction always wins over the unrestricted default-workspace optimization.
    const lockedPolicyID = isSubmitFlow && isRestrictedToPreferredPolicy ? preferredPolicyID : undefined;
    const defaultPolicyID = canUseDefaultPolicy ? defaultExpensePolicy?.id : undefined;
    const autoNavigatePolicyID = lockedPolicyID ?? defaultPolicyID;

    // Subscribe to the matching expense chat instead of reading it only from ReportUtils' cache. On a cold start the
    // policy can resolve before its report hydrates; this selector rerenders when that specific destination arrives.
    const [autoNavigateReportID] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) => getPolicyExpenseChat(currentUserAccountID, autoNavigatePolicyID, reports)?.reportID,
    });
    const [hasHydratedReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: hasReportsSelector});

    const isPersonalDetailsReady = !!currentUserAccountID && currentUserAccountID !== CONST.DEFAULT_NUMBER_ID;
    // An empty report collection can still be streaming from storage. Once reports have hydrated, a missing candidate is
    // treated as terminal so the user can use the picker instead of remaining on a blank loading state indefinitely.
    const isAwaitingExpenseChat = !!autoNavigatePolicyID && !autoNavigateReportID && !hasHydratedReports;
    const shouldWaitForDestination = isSubmitFlow && (isLoadingPreferredPolicy || !isPersonalDetailsReady || isAwaitingExpenseChat);

    // Synchronous one-shot guard for the auto-navigation effect. A ref (rather than the render state below) is used so
    // the guard flips immediately: clearing the draft transaction mutates draftTransactionIDs, which re-runs the effect
    // before a state update could commit, so a state-based guard would navigate twice.
    const hasNavigatedRef = useRef(false);

    // Drives rendering: track whether we committed to the participant picker so that late-arriving Onyx data
    // (policies/reports arriving after initial cache resolution) does not trigger a blank null render or unexpected navigation.
    const [hasCommittedToPicker, setHasCommittedToPicker] = useState(false);
    const [hasAutoNavigatedToReport, setHasAutoNavigatedToReport] = useState(false);

    // This span belongs to the submit flow, so the share flow instance must not cancel a span it never started. For the submit flow this cancels an attempt that closes before SubmitDetailsPage mounts to end the span, so it is
    useEffect(
        () => () => {
            if (!isSubmitFlow) {
                return;
            }
            cancelSpan(CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW);
        },
        [isSubmitFlow],
    );

    // Commit to the participant picker once the destination inputs resolve without a valid destination. This keeps
    // later Onyx updates from redirecting the user after they begin selecting a participant.
    useEffect(() => {
        if (!isSubmitFlow || shouldWaitForDestination || autoNavigateReportID || hasCommittedToPicker || hasNavigatedRef.current) {
            return;
        }
        setHasCommittedToPicker(true);
    }, [autoNavigateReportID, hasCommittedToPicker, isSubmitFlow, shouldWaitForDestination]);

    // One-shot: auto-navigate the user straight to the resolved workspace's confirmation.
    useEffect(() => {
        if (!autoNavigateReportID || hasCommittedToPicker || hasNavigatedRef.current || shouldWaitForDestination) {
            return;
        }
        hasNavigatedRef.current = true;

        // clear the existing draft transaction from the previous flow to prevent the old data from being displayed
        clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, draftTransactionIDs);
        clearUnknownUserDetails();

        startSpan(CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW, {
            name: CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW,
            op: CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW,
            forceTransaction: true,
            attributes: {
                [CONST.TELEMETRY.ATTRIBUTE_REPORT_ID]: autoNavigateReportID.toString(),
                [CONST.TELEMETRY.ATTRIBUTE_ROUTE_FROM]: Navigation.getActiveRoute() || 'unknown',
            },
        });

        // Update the picker state only after navigation completes so the destination remains selected if the user
        // returns from the confirmation page.
        Navigation.navigate(detailsPageRouteObject.getRoute(autoNavigateReportID.toString()), {
            afterTransition: () => {
                setSelectedReportID(autoNavigateReportID);
                setSelectedPolicyID(autoNavigatePolicyID);
                setHasAutoNavigatedToReport(true);
            },
        });
    }, [autoNavigatePolicyID, autoNavigateReportID, detailsPageRouteObject, draftTransactionIDs, hasCommittedToPicker, shouldWaitForDestination]);

    // Render null while waiting for initial destination resolution, or while actively auto-navigating to the details page.
    // Afterwards we fall through to the picker so backing out of the details page lands on a usable screen rather than a blank tab.
    if ((isSubmitFlow && shouldWaitForDestination) || (!hasCommittedToPicker && autoNavigateReportID && !hasAutoNavigatedToReport)) {
        return null;
    }

    return (
        <MoneyRequestParticipantsSelector
            iouType={CONST.IOU.TYPE.SUBMIT}
            initiallySelectedReportID={typeof selectedReportID === 'string' ? selectedReportID : undefined}
            shouldExcludeP2P={(draftTransactionAmount ?? 0) < 0}
            onParticipantsAdded={(value) => {
                const participant = value.at(0);
                if (!participant) {
                    return;
                }
                let reportID = participant?.reportID ?? CONST.DEFAULT_NUMBER_ID;
                const accountID = participant?.accountID;
                let optimisticReport: ReturnType<typeof getOptimisticChatReport> | undefined;

                // Resolve new-email recipients before comparing destinations so the stable optimistic report ID is used.
                if (accountID && !reportID) {
                    optimisticReport = getOptimisticChatReport(accountID, currentUserAccountID);
                    reportID = optimisticReport.reportID;
                }

                const hasSelectedDestination = hasAutoNavigatedToReport || selectedReportID !== undefined;
                const isSameDestination = selectedReportID !== undefined && selectedReportID.toString() === reportID.toString();
                const isSamePolicy = !!selectedPolicyID && selectedPolicyID !== CONST.POLICY.ID_FAKE && selectedPolicyID === participant?.policyID;

                // Start fresh on the initial pick. When the destination changes, clear workspace-owned fields only if
                // the underlying policy changed; selecting the same destination must preserve every draft edit.
                if (!hasSelectedDestination) {
                    clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, draftTransactionIDs);
                } else if (!isSameDestination && !isSamePolicy) {
                    clearMoneyRequestPolicyFields(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
                }

                if (isSubmitFlow) {
                    prepareConfirmationFocusRestore(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
                    startSpan(CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW, {
                        name: CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW,
                        op: CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW,
                        forceTransaction: true,
                        attributes: {
                            [CONST.TELEMETRY.ATTRIBUTE_REPORT_ID]: reportID.toString(),
                            [CONST.TELEMETRY.ATTRIBUTE_ROUTE_FROM]: Navigation.getActiveRoute() || 'unknown',
                        },
                    });
                }

                if (optimisticReport) {
                    const optimisticReportID = optimisticReport.reportID;
                    saveUnknownUserDetails(participant);

                    if (isSubmitFlow) {
                        getSpan(CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_REPORT_ID, optimisticReportID);
                    }

                    setSelectedReportID(optimisticReportID);
                    setSelectedPolicyID(participant.policyID);
                    saveReportDraft(optimisticReportID, optimisticReport).then(() => {
                        Navigation.navigate(detailsPageRouteObject.getRoute(optimisticReportID));
                    });
                } else {
                    clearUnknownUserDetails();
                    setSelectedReportID(reportID);
                    setSelectedPolicyID(participant.policyID);
                    Navigation.navigate(detailsPageRouteObject.getRoute(reportID.toString()));
                }
            }}
            action="create"
        />
    );
}

export default ShareTabParticipantsSelectorComponent;
