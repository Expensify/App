import Button from '@components/Button';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';

import {getOriginalMessage} from '@libs/ReportActionsUtils';

import ReportActionItemMessage from '@pages/inbox/report/ReportActionItemMessage';

import {resolveActionableReportMentionWhisper} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

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
    const {translate} = useLocalize();

    // Subscribe to the full report here — the resolve action needs heartbeat fields for its failure-revert payload.
    const [actionOwnerReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${actionOwnerReportStable?.reportID}`);

    const mentionReportContextValue = {currentReportID: reportID, exactlyMatch: true};

    return (
        <MentionReportContext.Provider value={mentionReportContextValue}>
            <View>
                <ReportActionItemMessage
                    action={action}
                    reportID={reportID}
                    displayAsGroup
                />
                {!resolution && (
                    <ActionableItemButtons layout="horizontal">
                        <Button
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            onPress={() =>
                                resolveActionableReportMentionWhisper(actionOwnerReport, action, CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.CREATE, isReportArchived)
                            }
                        >
                            <Button.Text>{translate('common.yes')}</Button.Text>
                        </Button>
                        <Button
                            onPress={() =>
                                resolveActionableReportMentionWhisper(actionOwnerReport, action, CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.NOTHING, isReportArchived)
                            }
                        >
                            <Button.Text>{translate('common.no')}</Button.Text>
                        </Button>
                    </ActionableItemButtons>
                )}
            </View>
        </MentionReportContext.Provider>
    );
}

export default ReportMentionWhisperContent;
