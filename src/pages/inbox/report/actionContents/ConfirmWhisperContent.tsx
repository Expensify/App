import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {resolveActionableMentionConfirmWhisper} from '@libs/actions/Report';
import ReportActionItemMessage from '@pages/inbox/report/ReportActionItemMessage';
import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

type ConfirmWhisperContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER>;
    reportID: string | undefined;
    originalReportID: string | undefined;
    actionReport: OnyxEntry<Report>;
};

function ConfirmWhisperContent({action, reportID, originalReportID, actionReport}: ConfirmWhisperContentProps) {
    const isOriginalReportArchived = useReportIsArchived(originalReportID);
    const mentionReportContextValue = {currentReportID: reportID, exactlyMatch: true};

    const buttons: ActionableItem[] = [
        {
            text: 'common.buttonConfirm',
            key: `${action.reportActionID}-actionableReportMentionConfirmWhisper-${CONST.REPORT.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER.DONE}`,
            onPress: () =>
                resolveActionableMentionConfirmWhisper(actionReport, action, CONST.REPORT.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER.DONE, isOriginalReportArchived),
            isPrimary: true,
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
                <ActionableItemButtons
                    items={buttons}
                    shouldUseLocalization
                    layout="horizontal"
                />
            </View>
        </MentionReportContext.Provider>
    );
}

export default ConfirmWhisperContent;
