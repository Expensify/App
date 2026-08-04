import RenderHTML from '@components/RenderHTML';
import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';

import {isPolicyAdmin, isPolicyMember, isPolicyOwner} from '@libs/PolicyUtils';
import {getActionableMentionWhisperMessage, getOriginalMessage, isSystemUserMentioned} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import {resolveActionableMentionWhisper} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsListSelector} from '@src/selectors/PersonalDetails';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type MentionWhisperContentProps = {
    /** All the data of the action item */
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER>;

    /** ID of the original report from which the given reportAction is first created */
    originalReportID: string | undefined;

    /** Report that owns this action for mutations (thread / merged-list cases use originalReport). This is a stable projection (heartbeat fields stripped). */
    actionOwnerReportStable: OnyxEntry<Report>;

    /** Parent report from which the given reportAction is first created */
    parentReport?: OnyxEntry<Report>;

    /** Policy ID for the current report */
    policyID: string | undefined;
};

function MentionWhisperContent({action, actionOwnerReportStable, parentReport, originalReportID, policyID}: MentionWhisperContentProps) {
    const {translate} = useLocalize();
    const isOriginalReportArchived = useReportIsArchived(originalReportID);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    // Subscribe to the full report here — the resolve action needs heartbeat fields for its failure-revert payload.
    const [actionOwnerReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${actionOwnerReportStable?.reportID}`);
    const [targetAccountDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsListSelector(getOriginalMessage(action)?.inviteeAccountIDs)});

    const isReportInPolicy = !!policyID && policyID !== CONST.POLICY.ID_FAKE && personalPolicyID !== policyID;
    const hasMentionedPolicyMembers = getOriginalMessage(action)?.inviteeEmails?.every((login) => isPolicyMember(policy, login));

    const buttons: ActionableItem[] = [];
    if ((isPolicyAdmin(policy) || isPolicyOwner(policy, currentUserAccountID)) && isReportInPolicy && !isSystemUserMentioned(action) && !hasMentionedPolicyMembers) {
        buttons.push({
            text: 'actionableMentionWhisperOptions.inviteToSubmitExpense',
            key: `${action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE_TO_SUBMIT_EXPENSE}`,
            onPress: () =>
                resolveActionableMentionWhisper(
                    actionOwnerReport,
                    action,
                    CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE_TO_SUBMIT_EXPENSE,
                    isOriginalReportArchived,
                    parentReport,
                ),
        });
    }
    buttons.push(
        {
            text: 'actionableMentionWhisperOptions.inviteToChat',
            key: `${action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE}`,
            onPress: () => resolveActionableMentionWhisper(actionOwnerReport, action, CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE, isOriginalReportArchived, parentReport),
        },
        {
            text: 'actionableMentionWhisperOptions.nothing',
            key: `${action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.NOTHING}`,
            onPress: () => resolveActionableMentionWhisper(actionOwnerReport, action, CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.NOTHING, isOriginalReportArchived, parentReport),
        },
    );

    return (
        <ReportActionItemBasicMessage>
            <RenderHTML html={getActionableMentionWhisperMessage(translate, action, targetAccountDetails)} />
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

export default MentionWhisperContent;
