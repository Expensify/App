import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import {getOriginalMessage} from '@libs/ReportActionsUtils';
import ReportActionItemMessage from '@pages/inbox/report/ReportActionItemMessage';
import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

type ReportMentionWhisperContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER>;
    reportID: string | undefined;
    report: OnyxEntry<Report>;
    originalReport: OnyxEntry<Report>;
    isReportArchived: boolean;
    resolveActionableReportMentionWhisper: (
        report: OnyxEntry<Report>,
        reportAction: OnyxEntry<ReportAction>,
        resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION>,
        isReportArchived?: boolean,
    ) => void;
};

function ReportMentionWhisperContent({action, reportID, report, originalReport, isReportArchived, resolveActionableReportMentionWhisper}: ReportMentionWhisperContentProps) {
    const reportActionReport = originalReport ?? report;
    const resolution = getOriginalMessage(action)?.resolution;
    const mentionReportContextValue = {currentReportID: report?.reportID, exactlyMatch: true};

    const buttons: ActionableItem[] = resolution
        ? []
        : [
              {
                  text: 'common.yes',
                  key: `${action.reportActionID}-actionableReportMentionWhisper-${CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.CREATE}`,
                  onPress: () => resolveActionableReportMentionWhisper(reportActionReport, action, CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.CREATE, isReportArchived),
                  isPrimary: true,
              },
              {
                  text: 'common.no',
                  key: `${action.reportActionID}-actionableReportMentionWhisper-${CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.NOTHING}`,
                  onPress: () => resolveActionableReportMentionWhisper(reportActionReport, action, CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.NOTHING, isReportArchived),
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

ReportMentionWhisperContent.displayName = 'ReportMentionWhisperContent';

export default ReportMentionWhisperContent;
