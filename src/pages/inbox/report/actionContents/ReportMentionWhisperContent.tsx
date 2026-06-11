import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {getOriginalMessage} from '@libs/ReportActionsUtils';
import ReportActionItemMessage from '@pages/inbox/report/ReportActionItemMessage';
import {resolveActionableReportMentionWhisper} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

type ReportMentionWhisperContentProps = {
    /** All the data of the action item */
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER>;

    /** Report ID for the current report */
    reportID: string | undefined;

    /** Report that owns this action for mutations (thread / merged-list cases use originalReport). This is a stable projection (heartbeat fields stripped). */
    actionOwnerReportStable: OnyxEntry<Report>;
};

function ReportMentionWhisperContent({action, reportID, actionOwnerReportStable}: ReportMentionWhisperContentProps) {
    const isReportArchived = useReportIsArchived(reportID);
    const resolution = getOriginalMessage(action)?.resolution;

    // Subscribe to the full report here — the resolve action needs heartbeat fields for its failure-revert payload.
    const [actionOwnerReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${actionOwnerReportStable?.reportID}`);

    const mentionReportContextValue = {currentReportID: reportID, exactlyMatch: true};

    const buttons: ActionableItem[] = resolution
        ? []
        : [
              {
                  text: 'common.yes',
                  key: `${action.reportActionID}-actionableReportMentionWhisper-${CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.CREATE}`,
                  onPress: () => resolveActionableReportMentionWhisper(actionOwnerReport, action, CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.CREATE, isReportArchived),
                  isPrimary: true,
              },
              {
                  text: 'common.no',
                  key: `${action.reportActionID}-actionableReportMentionWhisper-${CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.NOTHING}`,
                  onPress: () => resolveActionableReportMentionWhisper(actionOwnerReport, action, CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.NOTHING, isReportArchived),
              },
          ];

    return (
        <MentionReportContext.Provider value={mentionReportContextValue}>
            <View>
                <ReportActionItemMessage
                    action={action}
                    reportID={reportID}
                    displayAsGroup
                />
                {buttons.length > 0 && (
                    <ActionableItemButtons
                        items={buttons}
                        shouldUseLocalization
                        layout="horizontal"
                    />
                )}
            </View>
        </MentionReportContext.Provider>
    );
}

export default ReportMentionWhisperContent;
