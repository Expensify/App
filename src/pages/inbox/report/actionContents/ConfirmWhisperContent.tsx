import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';

import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';

import {resolveActionableMentionConfirmWhisper} from '@libs/actions/Report';

import ReportActionItemMessage from '@pages/inbox/report/ReportActionItemMessage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type ConfirmWhisperContentProps = {
    /** All the data of the action item */
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER>;

    /** Report ID for the current report */
    reportID: string | undefined;

    /** ID of the original report from which the given reportAction is first created */
    originalReportID: string | undefined;

    /** Report that owns this action for mutations (thread / merged-list cases use originalReport). This is a stable projection (heartbeat fields stripped). */
    actionOwnerReportStable: OnyxEntry<Report>;
};

function ConfirmWhisperContent({action, reportID, originalReportID, actionOwnerReportStable}: ConfirmWhisperContentProps) {
    const isOriginalReportArchived = useReportIsArchived(originalReportID);
    const mentionReportContextValue = {currentReportID: reportID, exactlyMatch: true};

    // Subscribe to the full report here — the resolve action needs heartbeat fields for its failure-revert payload.
    const [actionOwnerReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${actionOwnerReportStable?.reportID}`);

    const buttons: ActionableItem[] = [
        {
            text: 'common.buttonConfirm',
            key: `${action.reportActionID}-actionableReportMentionConfirmWhisper-${CONST.REPORT.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER.DONE}`,
            onPress: () =>
                resolveActionableMentionConfirmWhisper(actionOwnerReport, action, CONST.REPORT.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER.DONE, isOriginalReportArchived),
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
