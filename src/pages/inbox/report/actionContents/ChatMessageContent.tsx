import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React, {useMemo} from 'react';
import type {TextInput} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {AttachmentContext} from '@components/AttachmentContext';
import Button from '@components/Button';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import {useBlockedFromConcierge} from '@components/OnyxListItemProvider';
import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import {ShowContextMenuActionsContext, ShowContextMenuStateContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useActivePolicy from '@hooks/useActivePolicy';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
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
    isPendingRemove,
    isResolvedConciergeCategoryOptions,
    isResolvedConciergeDescriptionOptions,
} from '@libs/ReportActionsUtils';
import {chatIncludesConcierge, createDraftTransactionAndNavigateToParticipantSelector, isArchivedNonExpenseReport} from '@libs/ReportUtils';
import shouldRenderAddPaymentCard from '@libs/shouldRenderAppPaymentCard';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import ReportActionItemMessage from '@pages/inbox/report/ReportActionItemMessage';
import ReportActionItemMessageEdit from '@pages/inbox/report/ReportActionItemMessageEdit';
import {dismissTrackExpenseActionableWhisper, resolveActionableMentionConfirmWhisper, resolveConciergeCategoryOptions, resolveConciergeDescriptionOptions} from '@userActions/Report';
import {isBlockedFromConcierge} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type ChatMessageContentProps = {
    action: OnyxTypes.ReportAction;
    report: OnyxEntry<OnyxTypes.Report>;
    originalReport: OnyxEntry<OnyxTypes.Report>;
    reportID: string | undefined;
    originalReportID: string;
    displayAsGroup: boolean;
    draftMessage: string | undefined;
    index: number;
    isHidden: boolean;
    moderationDecision: OnyxTypes.DecisionName;
    updateHiddenState: (isHiddenValue: boolean) => void;
    isArchivedRoom?: boolean;
    composerTextInputRef: React.RefObject<TextInput | HTMLTextAreaElement | null>;
    isOnSearch: boolean;
    currentSearchHash: number | undefined;
    contextMenuStateValue: {
        anchor: ContextMenuAnchor | null;
        report: OnyxEntry<OnyxTypes.Report>;
        isReportArchived: boolean;
        action: OnyxTypes.ReportAction;
        transactionThreadReport?: OnyxEntry<OnyxTypes.Report>;
        isDisabled: boolean;
        shouldDisplayContextMenu: boolean;
        originalReportID: string | undefined;
    };
    contextMenuActionsValue: {
        checkIfContextMenuActive: () => void;
        onShowContextMenu: (callback: () => void) => void;
    };
    userBillingFundID: number | undefined;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    currentUserAccountID: number;
};

function ChatMessageContent({
    action,
    report,
    originalReport,
    reportID,
    originalReportID,
    displayAsGroup,
    draftMessage,
    index,
    isHidden,
    moderationDecision,
    updateHiddenState,
    isArchivedRoom,
    composerTextInputRef,
    isOnSearch,
    currentSearchHash,
    contextMenuStateValue,
    contextMenuActionsValue,
    userBillingFundID,
    introSelected,
    currentUserAccountID,
}: ChatMessageContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const personalDetail = useCurrentUserPersonalDetails();
    const {isRestrictedToPreferredPolicy, preferredPolicyID} = usePreferredPolicy();
    const activePolicy = useActivePolicy();
    const isOriginalReportArchived = useReportIsArchived(originalReportID);

    const blockedFromConcierge = useBlockedFromConcierge();
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const trackExpenseTransactionID = isActionableTrackExpense(action) ? getOriginalMessage(action)?.transactionID : undefined;
    const [trackExpenseTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(trackExpenseTransactionID)}`);

    const mentionReportContextValue = useMemo(() => ({currentReportID: report?.reportID, exactlyMatch: true}), [report?.reportID]);

    const attachmentContextValue = useMemo(() => {
        if (isOnSearch) {
            return {type: CONST.ATTACHMENT_TYPE.SEARCH, currentSearchHash};
        }
        return {reportID, type: CONST.ATTACHMENT_TYPE.REPORT};
    }, [reportID, isOnSearch, currentSearchHash]);

    const actionableItemButtons: ActionableItem[] = useMemo(() => {
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
    }, [
        action,
        userBillingFundID,
        originalReportID,
        reportID,
        currentUserAccountID,
        personalDetail.timezone,
        personalDetail.accountID,
        personalDetail.email,
        isRestrictedToPreferredPolicy,
        preferredPolicyID,
        isOriginalReportArchived,
        introSelected,
        draftTransactionIDs,
        activePolicy,
        report,
        originalReport,
        userBillingGracePeriodEnds,
        amountOwed,
        ownerBillingGracePeriodEnd,
        trackExpenseTransaction,
    ]);

    const hasBeenFlagged =
        ![CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING].some((item) => item === moderationDecision) && !isPendingRemove(action);

    const isConciergeOptions = isConciergeCategoryOptions(action) || isConciergeDescriptionOptions(action);
    const actionContainsFollowUps = containsActionableFollowUps(action);
    const isPhrasalConciergeOptions = isConciergeOptions || actionContainsFollowUps;
    const actionableButtonsNoLines = isPhrasalConciergeOptions ? 3 : 1;

    return (
        <MentionReportContext.Provider value={mentionReportContextValue}>
            <ShowContextMenuStateContext.Provider value={contextMenuStateValue}>
                <ShowContextMenuActionsContext.Provider value={contextMenuActionsValue}>
                    <AttachmentContext.Provider value={attachmentContextValue}>
                        {draftMessage === undefined ? (
                            <View style={displayAsGroup && hasBeenFlagged ? styles.blockquote : {}}>
                                <ReportActionItemMessage
                                    reportID={reportID}
                                    action={action}
                                    displayAsGroup={displayAsGroup}
                                    isHidden={isHidden}
                                />
                                {hasBeenFlagged && (
                                    <Button
                                        small
                                        style={[styles.mt2, styles.alignSelfStart]}
                                        onPress={() => updateHiddenState(!isHidden)}
                                        sentryLabel={CONST.SENTRY_LABEL.REPORT.MODERATION_BUTTON}
                                    >
                                        <Text
                                            style={[styles.buttonSmallText, styles.userSelectNone]}
                                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                                        >
                                            {isHidden ? translate('moderation.revealMessage') : translate('moderation.hideMessage')}
                                        </Text>
                                    </Button>
                                )}
                                {actionableItemButtons.length > 0 && (
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
                                )}
                            </View>
                        ) : (
                            <ReportActionItemMessageEdit
                                action={action}
                                draftMessage={draftMessage}
                                reportID={reportID}
                                originalReportID={originalReportID}
                                policyID={report?.policyID}
                                index={index}
                                ref={composerTextInputRef}
                                shouldDisableEmojiPicker={
                                    (chatIncludesConcierge(report) && isBlockedFromConcierge(blockedFromConcierge)) || isArchivedNonExpenseReport(report, isArchivedRoom)
                                }
                                isGroupPolicyReport={!!report?.policyID && report.policyID !== CONST.POLICY.ID_FAKE}
                            />
                        )}
                    </AttachmentContext.Provider>
                </ShowContextMenuActionsContext.Provider>
            </ShowContextMenuStateContext.Provider>
        </MentionReportContext.Provider>
    );
}

ChatMessageContent.displayName = 'ChatMessageContent';

export default ChatMessageContent;
