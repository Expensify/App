import Button from '@components/ButtonComposed';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import FollowupListSkeleton from '@components/ReportActionItem/FollowupListSkeleton';

import useActivePolicy from '@hooks/useActivePolicy';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import {resolveSuggestedFollowup} from '@libs/actions/Report/SuggestedFollowup';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import type {Followup} from '@libs/ReportActionFollowupUtils';
import {parseFollowupsFromHtml} from '@libs/ReportActionFollowupUtils';
import {
    getOriginalMessage,
    getReportActionMessage,
    isActionableAddPaymentCard,
    isActionableTrackExpense,
    isConciergeCategoryOptions,
    isConciergeDescriptionOptions,
    isResolvedConciergeCategoryOptions,
    isResolvedConciergeDescriptionOptions,
} from '@libs/ReportActionsUtils';
import shouldRenderAddPaymentCard from '@libs/shouldRenderAppPaymentCard';
import {doesUserHavePaymentCardAdded} from '@libs/SubscriptionUtils';
import {isSplitChildTransaction} from '@libs/TransactionUtils';

import {createDraftTransactionAndNavigateToParticipantSelector} from '@userActions/IOU/StartExpenseFlows';
import {dismissTrackExpenseActionableWhisper, resolveConciergeCategoryOptions, resolveConciergeDescriptionOptions} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import {createFilteredPoliciesInfoSelector, createHasWorkspaceToSubmitToSelector} from '@selectors/Policy';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React from 'react';

type ConciergeOptionsActionName = typeof CONST.REPORT.ACTIONS.TYPE.CONCIERGE_CATEGORY_OPTIONS | typeof CONST.REPORT.ACTIONS.TYPE.CONCIERGE_DESCRIPTION_OPTIONS;

/** Sends the user to the subscription page to add a payment card. */
function AddPaymentCardButton() {
    const {translate} = useLocalize();

    return (
        <ActionableItemButtons layout="horizontal">
            <Button
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                onPress={() => {
                    Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
                }}
            >
                <Button.Text>{translate('subscription.cardSection.addCardButton')}</Button.Text>
            </Button>
        </ActionableItemButtons>
    );
}

type ConciergeOptionsButtonsProps = {
    /** All the data of the action item */
    action: OnyxTypes.ReportAction<ConciergeOptionsActionName>;

    /** Report that owns this action for mutations (thread / merged-list cases use the original report) */
    actionOwnerReport: OnyxTypes.Report;

    /** ID of the report the resolution is announced in */
    reportID: string | undefined;

    /** The unresolved options to render, one button each */
    options: string[];
};

/** The category or description options Concierge offers, one button per option. */
function ConciergeOptionsButtons({action, actionOwnerReport, reportID, options}: ConciergeOptionsButtonsProps) {
    const styles = useThemeStyles();
    const personalDetail = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const resolveOptions = isConciergeCategoryOptions(action) ? resolveConciergeCategoryOptions : resolveConciergeDescriptionOptions;

    return (
        <ActionableItemButtons
            layout="vertical"
            style={styles.mt4}
        >
            {options.map((option, index) => (
                <Button
                    key={`${action.reportActionID}-conciergeOptions-${option}`}
                    innerStyles={styles.actionableItemButton}
                    onPress={() => {
                        resolveOptions(
                            actionOwnerReport,
                            reportID,
                            action.reportActionID,
                            option,
                            personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE,
                            personalDetail.accountID,
                            delegateAccountID,
                            conciergeReportID,
                        );
                    }}
                >
                    <Button.Text
                        numberOfLines={3}
                        style={styles.actionableItemButtonText}
                    >{`${index + 1} - ${option}`}</Button.Text>
                </Button>
            ))}
        </ActionableItemButtons>
    );
}

type SuggestedFollowupButtonsProps = {
    /** All the data of the action item */
    action: OnyxTypes.ReportAction;

    /** Report that owns this action for mutations (thread / merged-list cases use the original report) */
    actionOwnerReport: OnyxTypes.Report;

    /** ID of the report the followup is sent to */
    reportID: string | undefined;

    /** Unresolved followups parsed out of the action's message HTML */
    followups: Followup[];
};

/** The followups Concierge suggests as a reply to its own message, one button per followup. */
function SuggestedFollowupButtons({action, actionOwnerReport, reportID, followups}: SuggestedFollowupButtonsProps) {
    const styles = useThemeStyles();
    const personalDetail = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    return (
        <ActionableItemButtons
            layout="vertical"
            style={styles.mt4}
        >
            {followups.map((followup) => (
                <Button
                    key={`${action.reportActionID}-followup-${followup.text}`}
                    innerStyles={styles.actionableItemButton}
                    onPress={() => {
                        resolveSuggestedFollowup(
                            actionOwnerReport,
                            reportID,
                            action,
                            followup,
                            personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE,
                            personalDetail.accountID,
                            personalDetail.email,
                            delegateAccountID,
                            conciergeReportID,
                        );
                    }}
                >
                    <Button.Text
                        numberOfLines={3}
                        style={styles.actionableItemButtonText}
                    >
                        {followup.text}
                    </Button.Text>
                </Button>
            ))}
        </ActionableItemButtons>
    );
}

type TrackExpenseButtonsProps = {
    /** All the data of the action item */
    action: OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER>;

    /** ID of the report that owns this action */
    actionOwnerReportID: string | undefined;
};

/** What the user can do with an expense they tracked: submit it, categorize it, share it, or nothing. */
function TrackExpenseButtons({action, actionOwnerReportID}: TrackExpenseButtonsProps) {
    const {translate} = useLocalize();
    const lastWorkspaceNumber = useLastWorkspaceNumber();
    const personalDetail = useCurrentUserPersonalDetails();
    const activePolicy = useActivePolicy();
    const {isRestrictedToPreferredPolicy, preferredPolicyID} = usePreferredPolicy();

    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: validTransactionDraftIDsSelector,
    });
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [filteredPoliciesInfo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createFilteredPoliciesInfoSelector(personalDetail.email)});
    const [trackExpenseTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(getOriginalMessage(action)?.transactionID)}`);
    const [actionOwnerReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(actionOwnerReportID)}`);
    const [hasWorkspaceToSubmitTo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createHasWorkspaceToSubmitToSelector(personalDetail.login)});

    const baseDraftTransactionParams = {
        reportID: actionOwnerReportID,
        reportActions: actionOwnerReportActions,
        reportActionID: action.reportActionID,
        introSelected,
        draftTransactionIDs,
        activePolicy,
        userBillingGracePeriodEnds,
        amountOwed,
        ownerBillingGracePeriodEnd,
        transaction: trackExpenseTransaction,
        currentUserAccountID: personalDetail.accountID,
        currentUserEmail: personalDetail.email ?? '',
        currentUserLocalCurrency: personalDetail.localCurrencyCode ?? CONST.CURRENCY.USD,
        filteredPoliciesCount: filteredPoliciesInfo?.filteredPoliciesCount ?? 0,
        firstPolicyID: filteredPoliciesInfo?.firstPolicyID,
    };
    const isSplitExpense = isSplitChildTransaction(trackExpenseTransaction);
    const shouldShowSubmitButtons = !isSplitExpense || !!hasWorkspaceToSubmitTo;

    const submit = (submitDestination?: ValueOf<typeof CONST.IOU.SUBMIT_DESTINATION>) => {
        createDraftTransactionAndNavigateToParticipantSelector({
            ...baseDraftTransactionParams,
            isRestrictedToPreferredPolicy,
            preferredPolicyID,
            actionName: CONST.IOU.ACTION.SUBMIT,
            submitDestination,
            defaultWorkspaceName: submitDestination && generateDefaultWorkspaceName(personalDetail.email ?? '', lastWorkspaceNumber, translate, personalDetail.displayName),
        });
    };

    return (
        <ActionableItemButtons layout="vertical">
            {/* "Submit it to someone" is one button per destination. */}
            {shouldShowSubmitButtons && (
                <>
                    {!isSplitExpense && (
                        <Button onPress={() => submit(CONST.IOU.SUBMIT_DESTINATION.FRIEND)}>
                            <Button.Text>{translate('actionableMentionTrackExpense.submitToFriend')}</Button.Text>
                        </Button>
                    )}
                    <Button onPress={() => submit(CONST.IOU.SUBMIT_DESTINATION.EMPLOYER)}>
                        <Button.Text>{translate('actionableMentionTrackExpense.submitToEmployer')}</Button.Text>
                    </Button>
                </>
            )}

            {Permissions.canUseTrackFlows() && (
                <>
                    <Button
                        onPress={() => {
                            createDraftTransactionAndNavigateToParticipantSelector({...baseDraftTransactionParams, actionName: CONST.IOU.ACTION.CATEGORIZE});
                        }}
                    >
                        <Button.Text>{translate('actionableMentionTrackExpense.categorize')}</Button.Text>
                    </Button>
                    <Button
                        onPress={() => {
                            createDraftTransactionAndNavigateToParticipantSelector({...baseDraftTransactionParams, actionName: CONST.IOU.ACTION.SHARE});
                        }}
                    >
                        <Button.Text>{translate('actionableMentionTrackExpense.share')}</Button.Text>
                    </Button>
                </>
            )}

            <Button
                onPress={() => {
                    dismissTrackExpenseActionableWhisper(actionOwnerReportID, action);
                }}
            >
                <Button.Text>{translate('actionableMentionTrackExpense.nothing')}</Button.Text>
            </Button>
        </ActionableItemButtons>
    );
}

type ChatActionableButtonsProps = {
    /** All the data of the action item */
    action: OnyxTypes.ReportAction;

    /** ID of the original report from which the given reportAction is first created */
    originalReportID: string | undefined;

    /** ID of the report currently being displayed */
    reportID: string | undefined;

    /** Whether Concierge is still composing the followup list for this action, so its placeholder should be shown */
    hasPendingFollowupListSkeleton: boolean;
};

function ChatActionableButtons({action, originalReportID, reportID, hasPendingFollowupListSkeleton}: ChatActionableButtonsProps) {
    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(originalReportID)}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const actionOwnerReport = originalReport ?? report;

    // Shown while Concierge is still composing a followup list, whenever the branches below have nothing to render.
    const skeletonFallback = hasPendingFollowupListSkeleton ? <FollowupListSkeleton /> : null;

    if (isActionableAddPaymentCard(action) && !doesUserHavePaymentCardAdded(userBillingFundID) && shouldRenderAddPaymentCard()) {
        return <AddPaymentCardButton />;
    }

    if (isConciergeCategoryOptions(action) || isConciergeDescriptionOptions(action)) {
        const conciergeOptions = getOriginalMessage<ConciergeOptionsActionName>(action)?.options;
        const isResolved = isConciergeCategoryOptions(action) ? isResolvedConciergeCategoryOptions(action) : isResolvedConciergeDescriptionOptions(action);
        if (!conciergeOptions?.length || isResolved || !actionOwnerReport) {
            return skeletonFallback;
        }

        return (
            <ConciergeOptionsButtons
                action={action}
                actionOwnerReport={actionOwnerReport}
                reportID={reportID}
                options={conciergeOptions}
            />
        );
    }

    const messageHtml = getReportActionMessage(action)?.html;
    const followups = messageHtml ? parseFollowupsFromHtml(messageHtml) : undefined;
    if (followups?.length && actionOwnerReport) {
        return (
            <SuggestedFollowupButtons
                action={action}
                actionOwnerReport={actionOwnerReport}
                reportID={reportID}
                followups={followups}
            />
        );
    }

    if (isActionableTrackExpense(action)) {
        return (
            <TrackExpenseButtons
                action={action}
                actionOwnerReportID={originalReportID ?? reportID}
            />
        );
    }

    return skeletonFallback;
}

export default ChatActionableButtons;
