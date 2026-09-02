import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import isTeachersUnitePolicyID from '@libs/isTeachersUnitePolicyID';
import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import {shouldShowPolicy} from '@libs/PolicyUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getPolicyExpenseChat, getReportOrDraftReport, getTransactionCommentObject, getTransactionDetails} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {isInvalidMerchantValue} from '@libs/ValidationUtils';

import {createDraftWorkspace} from '@userActions/Policy/Policy';
import {openUnreportedExpense} from '@userActions/Report';
import {removeDraftTransactionsByIDs} from '@userActions/TransactionEdit';

import CONST from '@src/CONST';
import type {IOUAction, IOURequestType} from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {BillingGraceEndPeriod, IntroSelected, Policy, Transaction} from '@src/types/onyx';
import type {CreatableWorkspaceType} from '@src/types/onyx/Policy';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import type IconAsset from '@src/types/utils/IconAsset';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {createDraftTransaction, setMoneyRequestParticipants, setMoneyRequestParticipantsFromReport, setMoneyRequestReportID, startDistanceRequest, startMoneyRequest} from './MoneyRequest';

/**
 * Returns the dropdown options for the add expense button
 * @param iouReport - The IOU report to add an expense to
 * @param policy - The policy of the IOU report
 * @param backToReport - The report to return to after adding an expense
 * @returns The dropdown options for the add expense button
 */
type GetAddExpenseDropdownOptionsParams = {
    translate: LocalizedTranslate;
    icons: Record<'Location' | 'ReceiptPlus' | 'Plus', IconAsset>;
    iouReportID: string | undefined;
    policy: OnyxEntry<Policy>;
    userBillingGracePeriodEnds: OnyxCollection<BillingGraceEndPeriod>;
    draftTransactionIDs: string[] | undefined;
    amountOwed: OnyxEntry<number>;
    ownerBillingGracePeriodEnd: OnyxEntry<number>;
    iouRequestBackToReport?: string;
    unreportedExpenseBackToReport?: string;
    lastDistanceExpenseType?: IOURequestType;
    currentUserAccountID: number;
    blockDistanceRequestIfNeeded?: () => boolean;
};

function getAddExpenseDropdownOptions({
    translate,
    icons,
    iouReportID,
    policy,
    userBillingGracePeriodEnds,
    draftTransactionIDs,
    amountOwed,
    ownerBillingGracePeriodEnd,
    iouRequestBackToReport,
    unreportedExpenseBackToReport,
    lastDistanceExpenseType,
    currentUserAccountID,
    blockDistanceRequestIfNeeded,
}: GetAddExpenseDropdownOptionsParams): Array<DropdownOption<ValueOf<typeof CONST.REPORT.ADD_EXPENSE_OPTIONS>>> {
    const isReportTeachersUnite = isTeachersUnitePolicyID(getReportOrDraftReport(iouReportID)?.policyID ?? policy?.id);

    return [
        // Teachers Unite only supports expenses via split expense
        ...(isReportTeachersUnite
            ? []
            : [
                  {
                      value: CONST.REPORT.ADD_EXPENSE_OPTIONS.CREATE_NEW_EXPENSE,
                      text: translate('iou.createExpense'),
                      icon: icons.Plus,
                      sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.ADD_EXPENSE_CREATE,
                      onSelected: () => {
                          if (!iouReportID) {
                              return;
                          }
                          if (
                              policy &&
                              policy.type !== CONST.POLICY.TYPE.PERSONAL &&
                              shouldRestrictUserBillableActions(policy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, currentUserAccountID)
                          ) {
                              Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                              return;
                          }
                          startMoneyRequest(CONST.IOU.TYPE.SUBMIT, iouReportID, draftTransactionIDs, undefined, false, iouRequestBackToReport);
                      },
                  },
                  {
                      value: CONST.REPORT.ADD_EXPENSE_OPTIONS.TRACK_DISTANCE_EXPENSE,
                      text: translate('iou.trackDistance'),
                      icon: icons.Location,
                      sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.ADD_EXPENSE_TRACK_DISTANCE,
                      onSelected: () => {
                          if (!iouReportID) {
                              return;
                          }
                          if (policy && shouldRestrictUserBillableActions(policy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, currentUserAccountID)) {
                              Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                              return;
                          }
                          if (blockDistanceRequestIfNeeded?.()) {
                              return;
                          }
                          startDistanceRequest(CONST.IOU.TYPE.SUBMIT, iouReportID, draftTransactionIDs, lastDistanceExpenseType, false, iouRequestBackToReport);
                      },
                  },
              ]),
        {
            value: CONST.REPORT.ADD_EXPENSE_OPTIONS.ADD_EXISTING_EXPENSE,
            text: translate('iou.addExistingExpense'),
            icon: icons.ReceiptPlus,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.ADD_EXPENSE_EXISTING,
            onSelected: () => {
                if (policy && shouldRestrictUserBillableActions(policy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, currentUserAccountID)) {
                    Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                openUnreportedExpense(iouReportID, unreportedExpenseBackToReport);
            },
        },
    ];
}

function createDraftWorkspaceAndNavigateToConfirmationScreen(
    introSelected: OnyxEntry<IntroSelected>,
    transactionID: string,
    actionName: IOUAction,
    workspaceName: string,
    currentUserAccountID: number,
    currentUserEmail: string,
    currentUserLocalCurrency: string,
    policyType?: CreatableWorkspaceType,
    backToReportID?: string,
): void {
    const isCategorizing = actionName === CONST.IOU.ACTION.CATEGORIZE;
    const {expenseChatReportID, policyID, policyName} = createDraftWorkspace({
        introSelected,
        workspaceName,
        currentUserAccountID,
        currentUserEmail,
        currency: currentUserLocalCurrency,
        type: policyType,
    });
    setMoneyRequestParticipants(transactionID, [
        {
            selected: true,
            accountID: 0,
            isPolicyExpenseChat: true,
            reportID: expenseChatReportID,
            policyID,
            searchText: policyName,
        },
    ]);
    setMoneyRequestReportID(transactionID, expenseChatReportID);
    if (isCategorizing) {
        Navigation.navigate(
            createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute({action: actionName, iouType: CONST.IOU.TYPE.SUBMIT, transactionID, reportID: expenseChatReportID})),
        );
    } else {
        // The confirmation route needs a `:reportID`, so it points at the (draft) workspace expense chat to resolve the
        // draft policy/destination. That report only lives in REPORT_DRAFT. Send back to the origin report (e.g. the
        // self-DM the track expense came from) so navigateBack returns there instead of the draft report's start step.
        const backTo = backToReportID ? ROUTES.REPORT_WITH_ID.getRoute(backToReportID) : undefined;
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(actionName, CONST.IOU.TYPE.SUBMIT, transactionID, expenseChatReportID, undefined, true, backTo));
    }
}

type CreateDraftTransactionParams = {
    reportID: string | undefined;
    actionName: IOUAction;
    reportActionID: string | undefined;
    reportActions: OnyxEntry<ReportActions>;
    introSelected: OnyxEntry<IntroSelected>;
    draftTransactionIDs: string[] | undefined;
    activePolicy: OnyxEntry<Policy>;
    userBillingGracePeriodEnds: OnyxCollection<BillingGraceEndPeriod>;
    amountOwed: OnyxEntry<number>;
    ownerBillingGracePeriodEnd?: OnyxEntry<number>;
    isRestrictedToPreferredPolicy?: boolean;
    preferredPolicyID?: string;
    transaction: OnyxEntry<Transaction>;
    currentUserAccountID: number;
    currentUserEmail: string;
    currentUserLocalCurrency: string;
    /**
     * For the SUBMIT action, which destination the user picked from the track-expense whisper:
     * - 'friend' (default): show the existing recipient picker (individuals + workspaces).
     * - 'employer': route to a submit-enabled workspace, auto-selecting/creating one as needed.
     */
    submitDestination?: ValueOf<typeof CONST.IOU.SUBMIT_DESTINATION>;
    /** Localized default name for a workspace created on the fly (e.g. "Submit to my employer" with no existing workspace). */
    defaultWorkspaceName?: string;
    filteredPoliciesCount: number;
    firstPolicyID: string | undefined;
};

function createDraftTransactionAndNavigateToParticipantSelector({
    reportID,
    actionName,
    reportActionID,
    reportActions,
    introSelected,
    draftTransactionIDs,
    activePolicy,
    userBillingGracePeriodEnds,
    amountOwed,
    ownerBillingGracePeriodEnd,
    isRestrictedToPreferredPolicy = false,
    preferredPolicyID,
    transaction,
    currentUserAccountID,
    currentUserEmail,
    currentUserLocalCurrency,
    submitDestination = CONST.IOU.SUBMIT_DESTINATION.FRIEND,
    defaultWorkspaceName = '',
    filteredPoliciesCount,
    firstPolicyID,
}: CreateDraftTransactionParams): void {
    const transactionID = transaction?.transactionID;
    if (!transactionID || !reportID) {
        return;
    }

    const linkedTrackedExpenseReportAction = Object.values(reportActions ?? {})
        .filter(Boolean)
        .find((action) => isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUTransactionID === transactionID);

    const {created, amount, currency, merchant, mccGroup} = getTransactionDetails(transaction) ?? {};
    const isMerchantValid = !isInvalidMerchantValue(merchant);
    const baseComment = getTransactionCommentObject(transaction);
    // Use modifiedAttendees if present (for edited transactions), otherwise use the attendees from comment
    const comment = {
        ...baseComment,
        attendees: transaction?.modifiedAttendees ?? baseComment.attendees,
    };

    removeDraftTransactionsByIDs(draftTransactionIDs);

    // Moved verbatim from ReportUtils, where an eslint-seatbelt allowance covered this. `transaction` is an OnyxEntry, so the
    // spread widens to a partial and the assertion is the pre-existing behaviour rather than something introduced here.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see above
    createDraftTransaction({
        ...transaction,
        actionableWhisperReportActionID: reportActionID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID: reportID,
        created,
        modifiedCreated: undefined,
        modifiedAmount: undefined,
        modifiedCurrency: undefined,
        amount,
        isAmountSet: true,
        currency,
        comment,
        merchant,
        modifiedMerchant: '',
        isMerchantSet: !!isMerchantValid,
        modifiedAttendees: undefined,
        mccGroup,
        participants: [],
    } as Transaction);

    if (actionName === CONST.IOU.ACTION.CATEGORIZE) {
        if (activePolicy && shouldRestrictUserBillableActions(activePolicy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, currentUserAccountID)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(activePolicy.id));
            return;
        }

        if (activePolicy && shouldShowPolicy(activePolicy, false, currentUserEmail)) {
            const policyExpenseReportID = getPolicyExpenseChat(currentUserAccountID, activePolicy.id)?.reportID;
            setMoneyRequestParticipants(transactionID, [
                {
                    selected: true,
                    accountID: 0,
                    isPolicyExpenseChat: true,
                    reportID: policyExpenseReportID,
                    policyID: activePolicy.id,
                    searchText: activePolicy?.name,
                },
            ]);
            if (policyExpenseReportID) {
                Navigation.navigate(
                    createDynamicRoute(
                        DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute({action: actionName, iouType: CONST.IOU.TYPE.SUBMIT, transactionID, reportID: policyExpenseReportID}),
                        ROUTES.REPORT_WITH_ID.getRoute(reportID),
                    ),
                );
            } else {
                Log.warn('policyExpenseReportID is not valid during expense categorizing');
            }
            return;
        }
        if (filteredPoliciesCount === 0 || filteredPoliciesCount > 1) {
            Navigation.navigate(
                createDynamicRoute(
                    DYNAMIC_ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                        action: actionName,
                        iouType: CONST.IOU.TYPE.SUBMIT,
                        transactionID,
                        reportID,
                        upgradePath: actionName === CONST.IOU.ACTION.CATEGORIZE ? CONST.UPGRADE_PATHS.CATEGORIES : '',
                        shouldSubmitExpense: true,
                    }),
                    ROUTES.REPORT_WITH_ID.getRoute(reportID),
                ),
            );
            return;
        }

        const policyExpenseReportID = getPolicyExpenseChat(currentUserAccountID, firstPolicyID)?.reportID;
        setMoneyRequestParticipants(transactionID, [
            {
                selected: true,
                accountID: 0,
                isPolicyExpenseChat: true,
                reportID: policyExpenseReportID,
                policyID: firstPolicyID,
                searchText: activePolicy?.name,
            },
        ]);
        if (policyExpenseReportID) {
            Navigation.navigate(
                createDynamicRoute(
                    DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute({action: actionName, iouType: CONST.IOU.TYPE.SUBMIT, transactionID, reportID: policyExpenseReportID}),
                    ROUTES.REPORT_WITH_ID.getRoute(reportID),
                ),
            );
        } else {
            Log.warn('policyExpenseReportID is not valid during expense categorizing');
        }
        return;
    }

    if (actionName === CONST.IOU.ACTION.SHARE) {
        Navigation.navigate(
            createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_ACCOUNTANT.getRoute(actionName, CONST.IOU.TYPE.SUBMIT, transactionID, reportID), ROUTES.REPORT_WITH_ID.getRoute(reportID)),
        );
        return;
    }

    // "Submit to my employer" routes the expense into a workspace the user can submit to, based on how many they belong to.
    // Per issue #92704 the count spans every paid workspace the user is a member of (Collect/Control/Submit), so we reuse the
    // shared shouldShowPolicy-based count (filteredPoliciesCount/firstPolicyID) that also backs the workspaces-only picker.
    if (actionName === CONST.IOU.ACTION.SUBMIT && submitDestination === CONST.IOU.SUBMIT_DESTINATION.EMPLOYER) {
        // No accessible workspace: spin up a new Submit (submit2026) workspace and drop the expense into its draft report.
        if (filteredPoliciesCount === 0) {
            // `reportID` is where the expense lives (the self DM), which is not necessarily what the user is looking at:
            // they may have drilled into the expense thread first. Going back resolves the report route to a POP_TO on
            // the tab navigator, which rebuilds the central pane from the route, so returning to the self DM here would
            // swap the report out from under them.
            const visibleReportID = isReportTopmostSplitNavigator() ? Navigation.getTopmostReportId() : undefined;
            createDraftWorkspaceAndNavigateToConfirmationScreen(
                introSelected,
                transactionID,
                actionName,
                defaultWorkspaceName,
                currentUserAccountID,
                currentUserEmail,
                currentUserLocalCurrency,
                CONST.POLICY.TYPE.SUBMIT,
                visibleReportID ?? reportID,
            );
            return;
        }

        // Exactly one accessible workspace: skip the destination picker and submit straight to that workspace.
        if (filteredPoliciesCount === 1 && firstPolicyID) {
            const policyExpenseReport = getPolicyExpenseChat(currentUserAccountID, firstPolicyID);
            if (policyExpenseReport) {
                // The draft inherits the source expense's unreported ID from the self DM. The picker we skip here is what
                // normally rebinds it to the destination chat, so without this the confirmation page still reads the draft
                // as unreported: it renders "None" for the report and resolves the policy from the self DM instead of the
                // destination workspace.
                setMoneyRequestReportID(transactionID, policyExpenseReport.reportID);
                setMoneyRequestParticipantsFromReport(transactionID, policyExpenseReport, currentUserAccountID).then(() => {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.SUBMIT, CONST.IOU.TYPE.SUBMIT, transactionID, policyExpenseReport.reportID));
                });
                return;
            }
        }

        // Multiple accessible workspaces: show the destination picker limited to workspaces only (no individual recipients).
        Navigation.navigate(
            createDynamicRoute(
                DYNAMIC_ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute({
                    action: actionName,
                    iouType: CONST.IOU.TYPE.SUBMIT,
                    transactionID,
                    reportID,
                    isWorkspacesOnly: true,
                }),
                ROUTES.REPORT_WITH_ID.getRoute(reportID),
            ),
        );
        return;
    }

    if (actionName === CONST.IOU.ACTION.SUBMIT || filteredPoliciesCount > 0) {
        // Check if user is restricted to preferred workspace for submit tracked expenses
        if (isRestrictedToPreferredPolicy && preferredPolicyID) {
            const policyExpenseReport = getPolicyExpenseChat(currentUserAccountID, preferredPolicyID);

            if (policyExpenseReport) {
                // Same picker-skip as the single-workspace branch above, so the draft needs the same rebinding.
                setMoneyRequestReportID(transactionID, policyExpenseReport.reportID);
                setMoneyRequestParticipantsFromReport(transactionID, policyExpenseReport, currentUserAccountID).then(() => {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.SUBMIT, CONST.IOU.TYPE.SUBMIT, transactionID, policyExpenseReport.reportID));
                });
                return;
            }
        }

        Navigation.navigate(
            createDynamicRoute(
                DYNAMIC_ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute({action: actionName, iouType: CONST.IOU.TYPE.SUBMIT, transactionID, reportID}),
                ROUTES.REPORT_WITH_ID.getRoute(reportID),
            ),
        );
        return;
    }

    return createDraftWorkspaceAndNavigateToConfirmationScreen(introSelected, transactionID, actionName, '', currentUserAccountID, currentUserEmail, currentUserLocalCurrency);
}

export {createDraftTransactionAndNavigateToParticipantSelector, createDraftWorkspaceAndNavigateToConfirmationScreen, getAddExpenseDropdownOptions};
export type {CreateDraftTransactionParams, GetAddExpenseDropdownOptionsParams};
