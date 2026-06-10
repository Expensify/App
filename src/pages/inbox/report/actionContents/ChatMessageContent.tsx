import {hasPendingFollowupListSkeletonSelector} from '@selectors/AgentZeroChat';
import React from 'react';
import {View} from 'react-native';
import {AttachmentContext} from '@components/AttachmentContext';
import Button from '@components/Button';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {parseFollowupsFromHtml} from '@libs/ReportActionFollowupUtils';
import {
    getModerationFlagState,
    getReportActionMessage,
    isActionableAddPaymentCard,
    isActionableTrackExpense,
    isConciergeCategoryOptions,
    isConciergeDescriptionOptions,
} from '@libs/ReportActionsUtils';
import ReportActionItemMessage from '@pages/inbox/report/ReportActionItemMessage';
import ReportActionItemMessageEdit from '@pages/inbox/report/ReportActionItemMessageEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import ChatActionableButtons from './ChatActionableButtons';

type ChatMessageContentProps = {
    action: OnyxTypes.ReportAction;
    policyID: string | undefined;
    reportID: string | undefined;
    originalReportID: string;
    displayAsGroup: boolean;
    draftMessage: string | undefined;
    isHidden: boolean;
    updateHiddenState: (isHiddenValue: boolean) => void;
    isOnSearch: boolean;
};

function ChatMessageContent({action, policyID, reportID, originalReportID, displayAsGroup, draftMessage, isHidden, updateHiddenState, isOnSearch}: ChatMessageContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isEditingInline = !shouldUseNarrowLayout && draftMessage !== undefined;

    const mentionReportContextValue = {currentReportID: reportID, exactlyMatch: true};
    const attachmentContextValue = isOnSearch ? {type: CONST.ATTACHMENT_TYPE.SEARCH} : {reportID, type: CONST.ATTACHMENT_TYPE.REPORT};

    const {hasBeenFlagged} = getModerationFlagState(action);

    const [hasPendingFollowupListSkeleton = false] = useOnyx(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${reportID}`, {
        selector: hasPendingFollowupListSkeletonSelector(action.reportActionID),
    });

    const messageHtml = getReportActionMessage(action)?.html;
    const mayHaveActionableButtons =
        isActionableAddPaymentCard(action) ||
        isConciergeCategoryOptions(action) ||
        isConciergeDescriptionOptions(action) ||
        isActionableTrackExpense(action) ||
        !!(messageHtml && parseFollowupsFromHtml(messageHtml)?.length) ||
        hasPendingFollowupListSkeleton;

    return (
        <MentionReportContext.Provider value={mentionReportContextValue}>
            <AttachmentContext.Provider value={attachmentContextValue}>
                {isEditingInline ? (
                    <ReportActionItemMessageEdit
                        action={action}
                        reportID={reportID}
                        originalReportID={originalReportID}
                        policyID={policyID}
                    />
                ) : (
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
                                originalReportID={originalReportID}
                                reportID={reportID}
                                hasPendingFollowupListSkeleton={hasPendingFollowupListSkeleton}
                            />
                        )}
                    </View>
                )}
            </AttachmentContext.Provider>
        </MentionReportContext.Provider>
    );
}

export default ChatMessageContent;
