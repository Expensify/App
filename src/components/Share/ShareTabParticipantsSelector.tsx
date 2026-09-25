import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useUserSecurityGroup from '@hooks/useUserSecurityGroup';

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
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect, useRef, useState} from 'react';

const emptySelector = () => null;

type ShareTabParticipantsSelectorProps = {
    detailsPageRouteObject: typeof ROUTES.SHARE_SUBMIT_DETAILS | typeof ROUTES.SHARE_DETAILS;
};

function ShareTabParticipantsSelectorComponent({detailsPageRouteObject}: ShareTabParticipantsSelectorProps) {
    const {accountID: currentUserAccountID, login: currentUserLogin} = useCurrentUserPersonalDetails();
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [selectedReportID, setSelectedReportID] = useState<string | number | undefined>();

    const isSubmitFlow = detailsPageRouteObject === ROUTES.SHARE_SUBMIT_DETAILS;

    const {isRestrictedToPreferredPolicy, preferredPolicyID} = usePreferredPolicy();
    const {isLoadingSecurityGroup} = useUserSecurityGroup();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [, activePolicyIDMetadata] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [, policiesMetadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: emptySelector});
    const [, reportsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: emptySelector});
    const [amountOwed, amountOwedMetadata] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds, userBillingGracePeriodEndsMetadata] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd, ownerBillingGracePeriodEndMetadata] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);

    const isPersonalDetailsReady = !!currentUserAccountID && currentUserAccountID !== CONST.DEFAULT_NUMBER_ID && !!currentUserLogin;
    const isDestinationReady =
        isPersonalDetailsReady &&
        !isLoadingOnyxValue(activePolicyIDMetadata, policiesMetadata, reportsMetadata, amountOwedMetadata, userBillingGracePeriodEndsMetadata, ownerBillingGracePeriodEndMetadata);

    const canUseDefaultPolicy =
        isSubmitFlow &&
        !isRestrictedToPreferredPolicy &&
        // Use CREATE because shouldUseDefaultExpensePolicy is the existing eligibility predicate for automatically selecting
        // a default expense policy; passing SUBMIT would always return false.
        shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.CREATE, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, currentUserAccountID);

    // When the user's domain security group restricts submission to a single workspace, skip the participant picker and
    // go straight to confirmation for the locked workspace's expense chat, matching the in-product submit flow. Falls back
    // to the picker if the locked policy's expense chat isn't in Onyx yet, so we never navigate to an empty report.
    const lockedExpenseChatReportID =
        isSubmitFlow && isRestrictedToPreferredPolicy && preferredPolicyID ? getPolicyExpenseChat(currentUserAccountID, preferredPolicyID)?.reportID : undefined;
    const defaultExpenseChatReportID =
        canUseDefaultPolicy && defaultExpensePolicy?.autoReporting ? getPolicyExpenseChat(currentUserAccountID, defaultExpensePolicy?.id)?.reportID : undefined;
    const autoNavigateReportID = lockedExpenseChatReportID ?? defaultExpenseChatReportID;
    const shouldWaitForDestination = isSubmitFlow && (isLoadingSecurityGroup || !isDestinationReady);

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

        startSpan(CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW, {
            name: CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW,
            op: CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW,
            forceTransaction: true,
            attributes: {
                [CONST.TELEMETRY.ATTRIBUTE_REPORT_ID]: autoNavigateReportID.toString(),
                [CONST.TELEMETRY.ATTRIBUTE_ROUTE_FROM]: Navigation.getActiveRoute() || 'unknown',
            },
        });

        // Update picker state once the transition completes so it remains selected on back navigation. Doing this in
        // the afterTransition callback (rather than calling setState synchronously in the effect body) avoids the
        // react-hooks/set-state-in-effect violation.
        Navigation.navigate(detailsPageRouteObject.getRoute(autoNavigateReportID.toString()), {
            afterTransition: () => {
                setSelectedReportID(autoNavigateReportID);
                setHasAutoNavigatedToReport(true);
            },
        });
    }, [autoNavigateReportID, detailsPageRouteObject, draftTransactionIDs, hasCommittedToPicker, shouldWaitForDestination]);

    // Render null while waiting for initial destination resolution, or while actively auto-navigating to the details page.
    // Afterwards we fall through to the picker so backing out of the details page lands on a usable screen rather than a blank tab.
    if ((isSubmitFlow && shouldWaitForDestination) || (!hasCommittedToPicker && autoNavigateReportID && !hasAutoNavigatedToReport)) {
        return null;
    }

    return (
        <MoneyRequestParticipantsSelector
            iouType={CONST.IOU.TYPE.SUBMIT}
            initiallySelectedReportID={typeof selectedReportID === 'string' ? selectedReportID : undefined}
            onParticipantsAdded={(value) => {
                // Start fresh on the initial pick. On a destination change retain the general draft while clearing fields
                // that belong to the previous workspace's policy, so they cannot be submitted to the new destination.
                if (!hasAutoNavigatedToReport && !selectedReportID) {
                    clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, draftTransactionIDs);
                } else {
                    clearMoneyRequestPolicyFields(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
                }

                const participant = value.at(0);
                let reportID = participant?.reportID ?? CONST.DEFAULT_NUMBER_ID;
                const accountID = participant?.accountID;

                if (isSubmitFlow) {
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

                if (accountID && !reportID) {
                    saveUnknownUserDetails(participant);
                    const optimisticReport = getOptimisticChatReport(accountID, currentUserAccountID);
                    reportID = optimisticReport.reportID;

                    if (isSubmitFlow) {
                        getSpan(CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_REPORT_ID, reportID.toString());
                    }

                    setSelectedReportID(reportID);
                    saveReportDraft(reportID, optimisticReport).then(() => {
                        Navigation.navigate(detailsPageRouteObject.getRoute(reportID.toString()));
                    });
                } else {
                    clearUnknownUserDetails();
                    setSelectedReportID(reportID);
                    Navigation.navigate(detailsPageRouteObject.getRoute(reportID.toString()));
                }
            }}
            action="create"
        />
    );
}

export default ShareTabParticipantsSelectorComponent;
