import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import useActivePolicy from '@hooks/useActivePolicy';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
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
    isActionableMentionInviteToSubmitExpenseConfirmWhisper,
    isActionableTrackExpense,
    isConciergeCategoryOptions,
    isConciergeDescriptionOptions,
    isResolvedConciergeCategoryOptions,
    isResolvedConciergeDescriptionOptions,
} from '@libs/ReportActionsUtils';
import {createDraftTransactionAndNavigateToParticipantSelector} from '@libs/ReportUtils';
import shouldRenderAddPaymentCard from '@libs/shouldRenderAppPaymentCard';
import {dismissTrackExpenseActionableWhisper, resolveActionableMentionConfirmWhisper, resolveConciergeCategoryOptions, resolveConciergeDescriptionOptions} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type ChatActionableButtonsProps = {
    action: OnyxTypes.ReportAction;
    report: OnyxEntry<OnyxTypes.Report>;
    originalReport: OnyxEntry<OnyxTypes.Report>;
    reportID: string | undefined;
    originalReportID: string;
    userBillingFundID: number | undefined;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    currentUserAccountID: number;
    isOriginalReportArchived: boolean;
};

function ChatActionableButtons({
    action,
    report,
    originalReport,
    reportID,
    originalReportID,
    userBillingFundID,
    introSelected,
    currentUserAccountID,
    isOriginalReportArchived,
}: ChatActionableButtonsProps) {
    const styles = useThemeStyles();
    const personalDetail = useCurrentUserPersonalDetails();
    const {isRestrictedToPreferredPolicy, preferredPolicyID} = usePreferredPolicy();
    const activePolicy = useActivePolicy();

    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const trackExpenseTransactionID = isActionableTrackExpense(action) ? getOriginalMessage(action)?.transactionID : undefined;
    const [trackExpenseTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(trackExpenseTransactionID)}`);

    const actionableItemButtons = ((): ActionableItem[] => {
        if (isActionableAddPaymentCard(action) && userBillingFundID === undefined && shouldRenderAddPaymentCard()) {
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

        const reportActionReport = originalReport ?? report;
        if (isConciergeCategoryOptions(action)) {
            const options = getOriginalMessage(action)?.options;
            if (!options) {
                return [];
            }

            if (isResolvedConciergeCategoryOptions(action)) {
                return [];
            }

            if (!reportActionReport) {
                return [];
            }

            return options.map((option, i) => ({
                text: `${i + 1} - ${option}`,
                key: `${action.reportActionID}-conciergeCategoryOptions-${option}`,
                onPress: () => {
                    resolveConciergeCategoryOptions(reportActionReport, reportID, action.reportActionID, option, personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE, currentUserAccountID);
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

            if (!reportActionReport) {
                return [];
            }

            return options.map((option, i) => ({
                text: `${i + 1} - ${option}`,
                key: `${action.reportActionID}-conciergeDescriptionOptions-${option}`,
                onPress: () => {
                    resolveConciergeDescriptionOptions(reportActionReport, reportID, action.reportActionID, option, personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE, currentUserAccountID);
                },
            }));
        }
        const messageHtml = getReportActionMessage(action)?.html;
        if (messageHtml && reportActionReport) {
            const followups = parseFollowupsFromHtml(messageHtml);
            if (followups && followups.length > 0) {
                return followups.map((followup) => ({
                    text: followup.text,
                    shouldUseLocalization: false,
                    key: `${action.reportActionID}-followup-${followup.text}`,
                    onPress: () => {
                        resolveSuggestedFollowup(
                            reportActionReport,
                            reportID,
                            action,
                            followup,
                            personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE,
                            currentUserAccountID,
                            personalDetail.email,
                        );
                    },
                }));
            }
        }

        if (isActionableTrackExpense(action)) {
            const reportActionReportID = originalReportID ?? reportID;
            const options = [
                {
                    text: 'actionableMentionTrackExpense.submit',
                    key: `${action.reportActionID}-actionableMentionTrackExpense-submit`,
                    onPress: () => {
                        createDraftTransactionAndNavigateToParticipantSelector({
                            reportID: reportActionReportID,
                            actionName: CONST.IOU.ACTION.SUBMIT,
                            reportActionID: action.reportActionID,
                            introSelected,
                            draftTransactionIDs,
                            activePolicy,
                            userBillingGracePeriodEnds,
                            amountOwed,
                            ownerBillingGracePeriodEnd,
                            isRestrictedToPreferredPolicy,
                            preferredPolicyID,
                            transaction: trackExpenseTransaction,
                            currentUserAccountID: personalDetail.accountID,
                            currentUserEmail: personalDetail.email ?? '',
                        });
                    },
                },
            ];

            if (Permissions.canUseTrackFlows()) {
                options.push(
                    {
                        text: 'actionableMentionTrackExpense.categorize',
                        key: `${action.reportActionID}-actionableMentionTrackExpense-categorize`,
                        onPress: () => {
                            createDraftTransactionAndNavigateToParticipantSelector({
                                reportID: reportActionReportID,
                                actionName: CONST.IOU.ACTION.CATEGORIZE,
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
                            });
                        },
                    },
                    {
                        text: 'actionableMentionTrackExpense.share',
                        key: `${action.reportActionID}-actionableMentionTrackExpense-share`,
                        onPress: () => {
                            createDraftTransactionAndNavigateToParticipantSelector({
                                reportID: reportActionReportID,
                                actionName: CONST.IOU.ACTION.SHARE,
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
                            });
                        },
                    },
                );
            }
            options.push({
                text: 'actionableMentionTrackExpense.nothing',
                key: `${action.reportActionID}-actionableMentionTrackExpense-nothing`,
                onPress: () => {
                    dismissTrackExpenseActionableWhisper(reportActionReportID, action);
                },
            });
            return options;
        }

        if (isActionableMentionInviteToSubmitExpenseConfirmWhisper(action)) {
            return [
                {
                    text: 'common.buttonConfirm',
                    key: `${action.reportActionID}-actionableReportMentionConfirmWhisper-${CONST.REPORT.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER.DONE}`,
                    onPress: () =>
                        resolveActionableMentionConfirmWhisper(
                            reportActionReport,
                            action,
                            CONST.REPORT.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER.DONE,
                            isOriginalReportArchived,
                        ),
                    isPrimary: true,
                },
            ];
        }

        return [];
    })();

    if (actionableItemButtons.length === 0) {
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
        />
    );
}

ChatActionableButtons.displayName = 'ChatActionableButtons';

export default ChatActionableButtons;
