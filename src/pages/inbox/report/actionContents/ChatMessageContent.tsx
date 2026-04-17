import React from 'react';
import type {TextInput} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {AttachmentContext} from '@components/AttachmentContext';
import Button from '@components/Button';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import {useBlockedFromConcierge} from '@components/OnyxListItemProvider';
import {ShowContextMenuActionsContext, ShowContextMenuStateContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {parseFollowupsFromHtml} from '@libs/ReportActionFollowupUtils';
import {
    getReportActionMessage,
    isActionableAddPaymentCard,
    isActionableTrackExpense,
    isConciergeCategoryOptions,
    isConciergeDescriptionOptions,
    isPendingRemove,
} from '@libs/ReportActionsUtils';
import {chatIncludesConcierge, isArchivedNonExpenseReport} from '@libs/ReportUtils';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import ReportActionItemMessage from '@pages/inbox/report/ReportActionItemMessage';
import ReportActionItemMessageEdit from '@pages/inbox/report/ReportActionItemMessageEdit';
import {isBlockedFromConcierge} from '@userActions/User';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import ChatActionableButtons from './ChatActionableButtons';

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
}: ChatMessageContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const blockedFromConcierge = useBlockedFromConcierge();

    const mentionReportContextValue = {currentReportID: report?.reportID, exactlyMatch: true};

    const attachmentContextValue = isOnSearch ? {type: CONST.ATTACHMENT_TYPE.SEARCH, currentSearchHash} : {reportID, type: CONST.ATTACHMENT_TYPE.REPORT};

    const hasBeenFlagged =
        ![CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING].some((item) => item === moderationDecision) && !isPendingRemove(action);

    const messageHtml = getReportActionMessage(action)?.html;
    const mayHaveActionableButtons =
        isActionableAddPaymentCard(action) ||
        isConciergeCategoryOptions(action) ||
        isConciergeDescriptionOptions(action) ||
        isActionableTrackExpense(action) ||
        !!(messageHtml && parseFollowupsFromHtml(messageHtml)?.length);

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
                                {mayHaveActionableButtons && (
                                    <ChatActionableButtons
                                        action={action}
                                        report={report}
                                        originalReport={originalReport}
                                        reportID={reportID}
                                        originalReportID={originalReportID}
                                        userBillingFundID={userBillingFundID}
                                        introSelected={introSelected}
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
