import {createFilteredPoliciesInfoSelector} from '@selectors/Policy';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React from 'react';
import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import FollowupListSkeleton from '@components/ReportActionItem/FollowupListSkeleton';
import useActivePolicy from '@hooks/useActivePolicy';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {resolveSuggestedFollowup} from '@libs/actions/Report/SuggestedFollowup';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import {containsActionableFollowUps, parseFollowupsFromHtml} from '@libs/ReportActionFollowupUtils';
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
import type {CreateDraftTransactionParams} from '@libs/ReportUtils';
import {createDraftTransactionAndNavigateToParticipantSelector} from '@libs/ReportUtils';
import shouldRenderAddPaymentCard from '@libs/shouldRenderAppPaymentCard';
import {doesUserHavePaymentCardAdded} from '@libs/SubscriptionUtils';
import {dismissTrackExpenseActionableWhisper, resolveConciergeCategoryOptions, resolveConciergeDescriptionOptions} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type ChatActionableButtonsProps = {
    action: OnyxTypes.ReportAction;
    originalReportID: string | undefined;
    reportID: string | undefined;
    hasPendingFollowupListSkeleton: boolean;
};

function ChatActionableButtons({action, originalReportID, reportID, hasPendingFollowupListSkeleton}: ChatActionableButtonsProps) {
    const styles = useThemeStyles();
    const actionOwnerReportID = originalReportID ?? reportID;
    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(originalReportID)}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const actionOwnerReport = originalReport ?? report;
    const personalDetail = useCurrentUserPersonalDetails();
    const {isRestrictedToPreferredPolicy, preferredPolicyID} = usePreferredPolicy();
    const activePolicy = useActivePolicy();

    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [filteredPoliciesInfo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createFilteredPoliciesInfoSelector(personalDetail.email)}, [personalDetail.email]);
    const filteredPoliciesCount = filteredPoliciesInfo?.filteredPoliciesCount ?? 0;
    const firstPolicyID = filteredPoliciesInfo?.firstPolicyID;
    const trackExpenseTransactionID = isActionableTrackExpense(action) ? getOriginalMessage(action)?.transactionID : undefined;
    const [trackExpenseTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(trackExpenseTransactionID)}`);
    const delegateAccountID = useDelegateAccountID();

    const actionableItemButtons = ((): ActionableItem[] => {
        if (isActionableAddPaymentCard(action) && !doesUserHavePaymentCardAdded(userBillingFundID) && shouldRenderAddPaymentCard()) {
            return [
                {
                    text: 'subscription.cardSection.addCardButton',
                    key: `${action.reportActionID}-actionableAddPaymentCard-submit`,
                    onPress: () => {
                        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
                    },
                    isPrimary: true,
                },
            ];
        }

        if (isConciergeCategoryOptions(action)) {
            const options = getOriginalMessage(action)?.options;
            if (!options) {
                return [];
            }

            if (isResolvedConciergeCategoryOptions(action)) {
                return [];
            }

            if (!actionOwnerReport) {
                return [];
            }

            return options.map((option, i) => ({
                text: `${i + 1} - ${option}`,
                key: `${action.reportActionID}-conciergeCategoryOptions-${option}`,
                onPress: () => {
                    resolveConciergeCategoryOptions(
                        actionOwnerReport,
                        reportID,
                        action.reportActionID,
                        option,
                        personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE,
                        personalDetail.accountID,
                        delegateAccountID,
                    );
                },
            }));
        }

        if (isConciergeDescriptionOptions(action)) {
            const options = getOriginalMessage(action)?.options;
            if (!options) {
                return [];
            }

            if (isResolvedConciergeDescriptionOptions(action)) {
                return [];
            }

            if (!actionOwnerReport) {
                return [];
            }

            return options.map((option, i) => ({
                text: `${i + 1} - ${option}`,
                key: `${action.reportActionID}-conciergeDescriptionOptions-${option}`,
                onPress: () => {
                    resolveConciergeDescriptionOptions(
                        actionOwnerReport,
                        reportID,
                        action.reportActionID,
                        option,
                        personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE,
                        personalDetail.accountID,
                        delegateAccountID,
                    );
                },
            }));
        }
        const messageHtml = getReportActionMessage(action)?.html;
        if (messageHtml && actionOwnerReport) {
            const followups = parseFollowupsFromHtml(messageHtml);
            if (followups && followups.length > 0) {
                return followups.map((followup) => ({
                    text: followup.text,
                    shouldUseLocalization: false,
                    key: `${action.reportActionID}-followup-${followup.text}`,
                    onPress: () => {
                        resolveSuggestedFollowup(
                            actionOwnerReport,
                            reportID,
                            action,
                            followup,
                            personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE,
                            personalDetail.accountID,
                            personalDetail.email,
                            delegateAccountID,
                        );
                    },
                }));
            }
        }

        if (isActionableTrackExpense(action)) {
            const baseDraftTransactionParams = {
                reportID: actionOwnerReportID,
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
                filteredPoliciesCount,
                firstPolicyID,
            };
            const TRACK_EXPENSE_ACTIONS = {
                submit: CONST.IOU.ACTION.SUBMIT,
                categorize: CONST.IOU.ACTION.CATEGORIZE,
                share: CONST.IOU.ACTION.SHARE,
            } as const;
            const prepareTrackExpenseButton = (actionKey: keyof typeof TRACK_EXPENSE_ACTIONS, extraParams?: Partial<CreateDraftTransactionParams>) => ({
                text: `actionableMentionTrackExpense.${actionKey}`,
                key: `${action.reportActionID}-actionableMentionTrackExpense-${actionKey}`,
                onPress: () => {
                    createDraftTransactionAndNavigateToParticipantSelector({
                        ...baseDraftTransactionParams,
                        ...extraParams,
                        actionName: TRACK_EXPENSE_ACTIONS[actionKey],
                    });
                },
            });
            const options = [prepareTrackExpenseButton('submit', {isRestrictedToPreferredPolicy, preferredPolicyID})];

            if (Permissions.canUseTrackFlows()) {
                options.push(prepareTrackExpenseButton('categorize'), prepareTrackExpenseButton('share'));
            }
            options.push({
                text: 'actionableMentionTrackExpense.nothing',
                key: `${action.reportActionID}-actionableMentionTrackExpense-nothing`,
                onPress: () => {
                    dismissTrackExpenseActionableWhisper(actionOwnerReportID, action);
                },
            });
            return options;
        }

        return [];
    })();

    if (actionableItemButtons.length === 0) {
        if (hasPendingFollowupListSkeleton) {
            return <FollowupListSkeleton />;
        }
        return null;
    }

    const isConciergeOptions = isConciergeCategoryOptions(action) || isConciergeDescriptionOptions(action);
    const actionContainsFollowUps = containsActionableFollowUps(action);
    const isPhrasalConciergeOptions = isConciergeOptions || actionContainsFollowUps;
    const actionableButtonsNoLines = isPhrasalConciergeOptions ? 3 : 1;

    return (
        <ActionableItemButtons
            items={actionableItemButtons}
            layout={isActionableTrackExpense(action) || isPhrasalConciergeOptions ? 'vertical' : 'horizontal'}
            shouldUseLocalization={!isPhrasalConciergeOptions}
            primaryTextNumberOfLines={actionableButtonsNoLines}
            styles={{
                text: isPhrasalConciergeOptions ? styles.actionableItemButtonText : undefined,
                button: isPhrasalConciergeOptions ? styles.actionableItemButton : undefined,
            }}
            wrapperStyle={isPhrasalConciergeOptions ? styles.mt4 : undefined}
        />
    );
}

export default ChatActionableButtons;
