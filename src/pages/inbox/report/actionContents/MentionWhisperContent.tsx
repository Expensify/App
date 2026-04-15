import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import RenderHTML from '@components/RenderHTML';
import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import useLocalize from '@hooks/useLocalize';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {isPolicyAdmin, isPolicyMember, isPolicyOwner} from '@libs/PolicyUtils';
import {getActionableMentionWhisperMessage, getOriginalMessage, isSystemUserMentioned} from '@libs/ReportActionsUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import CONST from '@src/CONST';
import type {Policy, Report, ReportAction} from '@src/types/onyx';

type MentionWhisperContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER>;
    report: OnyxEntry<Report>;
    originalReport: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    currentUserAccountID: number;
    personalPolicyID: string | undefined;
    originalReportID: string | undefined;
    resolveActionableMentionWhisper: (
        report: OnyxEntry<Report>,
        reportAction: OnyxEntry<ReportAction>,
        resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION>,
        isReportArchived: boolean,
    ) => void;
};

function MentionWhisperContent({
    action,
    report,
    originalReport,
    policy,
    currentUserAccountID,
    personalPolicyID,
    originalReportID,
    resolveActionableMentionWhisper,
}: MentionWhisperContentProps) {
    const {translate} = useLocalize();
    const isOriginalReportArchived = useReportIsArchived(originalReportID);

    const reportActionReport = originalReport ?? report;
    const reportPolicyID = report?.policyID;

    const isReportInPolicy = !!reportPolicyID && reportPolicyID !== CONST.POLICY.ID_FAKE && personalPolicyID !== reportPolicyID;
    const hasMentionedPolicyMembers = getOriginalMessage(action)?.inviteeEmails?.every((login) => isPolicyMember(policy, login));

    const buttons: ActionableItem[] = [];
    if ((isPolicyAdmin(policy) || isPolicyOwner(policy, currentUserAccountID)) && isReportInPolicy && !isSystemUserMentioned(action) && !hasMentionedPolicyMembers) {
        buttons.push({
            text: 'actionableMentionWhisperOptions.inviteToSubmitExpense',
            key: `${action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE_TO_SUBMIT_EXPENSE}`,
            onPress: () => resolveActionableMentionWhisper(reportActionReport, action, CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE_TO_SUBMIT_EXPENSE, isOriginalReportArchived),
        });
    }
    buttons.push(
        {
            text: 'actionableMentionWhisperOptions.inviteToChat',
            key: `${action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE}`,
            onPress: () => resolveActionableMentionWhisper(reportActionReport, action, CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE, isOriginalReportArchived),
        },
        {
            text: 'actionableMentionWhisperOptions.nothing',
            key: `${action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.NOTHING}`,
            onPress: () => resolveActionableMentionWhisper(reportActionReport, action, CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.NOTHING, isOriginalReportArchived),
        },
    );

    return (
        <ReportActionItemBasicMessage>
            <RenderHTML html={getActionableMentionWhisperMessage(translate, action)} />
            {buttons.length > 0 && (
                <ActionableItemButtons
                    items={buttons}
                    shouldUseLocalization
                    layout="vertical"
                />
            )}
        </ReportActionItemBasicMessage>
    );
}

MentionWhisperContent.displayName = 'MentionWhisperContent';

export default MentionWhisperContent;
