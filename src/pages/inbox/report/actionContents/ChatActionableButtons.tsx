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
    isActionableTrackExpense,
    isConciergeCategoryOptions,
    isConciergeDescriptionOptions,
    isResolvedConciergeCategoryOptions,
    isResolvedConciergeDescriptionOptions,
} from '@libs/ReportActionsUtils';
import type {CreateDraftTransactionParams} from '@libs/ReportUtils';
import {createDraftTransactionAndNavigateToParticipantSelector} from '@libs/ReportUtils';
import shouldRenderAddPaymentCard from '@libs/shouldRenderAppPaymentCard';
import {dismissTrackExpenseActionableWhisper, resolveConciergeCategoryOptions, resolveConciergeDescriptionOptions} from '@userActions/Report';
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
};

function ChatActionableButtons({action, report, originalReport, reportID, originalReportID, userBillingFundID, introSelected}: ChatActionableButtonsProps) {
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
                    resolveConciergeCategoryOptions(
                        reportActionReport,
                        reportID,
                        action.reportActionID,
                        option,
                        personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE,
                        personalDetail.accountID,
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

            if (!reportActionReport) {
                return [];
            }

            return options.map((option, i) => ({
                text: `${i + 1} - ${option}`,
                key: `${action.reportActionID}-conciergeDescriptionOptions-${option}`,
                onPress: () => {
                    resolveConciergeDescriptionOptions(
                        reportActionReport,
                        reportID,
                        action.reportActionID,
                        option,
                        personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE,
                        personalDetail.accountID,
                    );
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
                            personalDetail.accountID,
                            personalDetail.email,
                        );
                    },
                }));
            }
        }

        if (isActionableTrackExpense(action)) {
            const reportActionReportID = originalReportID ?? reportID;
            const baseDraftTransactionParams = {
                reportID: reportActionReportID,
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
                    dismissTrackExpenseActionableWhisper(reportActionReportID, action);
                },
            });
            return options;
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
