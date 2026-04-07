import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import RenderHTML from '@components/RenderHTML';
import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import useLocalize from '@hooks/useLocalize';
import {isPolicyAdmin, isPolicyMember, isPolicyOwner} from '@libs/PolicyUtils';
import {
    getActionableCardFraudAlertMessage,
    getActionableMentionWhisperMessage,
    getJoinRequestMessage,
    getOriginalMessage,
    getReportActionText,
    isActionableCardFraudAlert,
    isActionableJoinRequest,
    isActionableMentionWhisper,
    isActionableReportMentionWhisper,
    isSystemUserMentioned,
} from '@libs/ReportActionsUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import {resolveFraudAlert} from '@userActions/Card';
import {acceptJoinRequest, declineJoinRequest} from '@userActions/Policy/Member';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {JoinWorkspaceResolution} from '@src/types/onyx/OriginalMessage';

type ActionableWhisperContentProps = {
    action: OnyxTypes.ReportAction;
    report: OnyxEntry<OnyxTypes.Report>;
    originalReport: OnyxEntry<OnyxTypes.Report>;
    policy: OnyxEntry<OnyxTypes.Policy>;
    reportID: string | undefined;
    originalReportID: string;
    currentUserAccountID: number;
    personalPolicyID: string | undefined;
    isReportArchived: boolean;
    isOriginalReportArchived: boolean;
    resolveActionableReportMentionWhisper: (
        report: OnyxEntry<OnyxTypes.Report>,
        reportAction: OnyxEntry<OnyxTypes.ReportAction>,
        resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION>,
        isReportArchived?: boolean,
    ) => void;
    resolveActionableMentionWhisper: (
        report: OnyxEntry<OnyxTypes.Report>,
        reportAction: OnyxEntry<OnyxTypes.ReportAction>,
        resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION>,
        isReportArchived: boolean,
    ) => void;
};

/**
 * Type guard that returns true for action types handled by ActionableWhisperContent.
 */
function isActionableWhisperAction(action: OnyxTypes.ReportAction): boolean {
    if (isActionableCardFraudAlert(action)) {
        return true;
    }
    if (isActionableJoinRequest(action)) {
        return true;
    }
    if (isActionableMentionWhisper(action)) {
        return true;
    }
    if (isActionableReportMentionWhisper(action)) {
        return true;
    }
    return false;
}

function ActionableWhisperContent({
    action,
    report,
    originalReport,
    policy,
    reportID,
    originalReportID,
    currentUserAccountID,
    personalPolicyID,
    isReportArchived,
    isOriginalReportArchived,
    resolveActionableReportMentionWhisper,
    resolveActionableMentionWhisper,
}: ActionableWhisperContentProps) {
    const {translate, getLocalDateFromDatetime} = useLocalize();

    const reportActionReport = originalReport ?? report;
    const reportPolicyID = report?.policyID;

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const buttons: ActionableItem[] = useMemo(() => {
        if (isActionableCardFraudAlert(action)) {
            if (getOriginalMessage(action)?.resolution) {
                return [];
            }

            const cardID = getOriginalMessage(action)?.cardID;
            return [
                {
                    text: translate('cardPage.cardFraudAlert.confirmButtonText'),
                    key: `${action.reportActionID}-cardFraudAlert-confirm`,
                    onPress: () => {
                        resolveFraudAlert(cardID, false, reportID, action?.reportActionID);
                    },
                    isPrimary: true,
                },
                {
                    text: translate('cardPage.cardFraudAlert.reportFraudButtonText'),
                    key: `${action.reportActionID}-cardFraudAlert-reportFraud`,
                    onPress: () => {
                        resolveFraudAlert(cardID, true, reportID, action?.reportActionID);
                    },
                },
            ];
        }

        if (isActionableJoinRequest(action)) {
            if (getOriginalMessage(action)?.choice !== ('' as JoinWorkspaceResolution)) {
                return [];
            }
            const reportActionReportID = originalReportID ?? reportID;
            return [
                {
                    text: 'actionableMentionJoinWorkspaceOptions.accept',
                    key: `${action.reportActionID}-actionableMentionJoinWorkspace-${CONST.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.ACCEPT}`,
                    onPress: () => acceptJoinRequest(reportActionReportID, action),
                    isPrimary: true,
                },
                {
                    text: 'actionableMentionJoinWorkspaceOptions.decline',
                    key: `${action.reportActionID}-actionableMentionJoinWorkspace-${CONST.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.DECLINE}`,
                    onPress: () => declineJoinRequest(reportActionReportID, action),
                },
            ];
        }

        if (isActionableReportMentionWhisper(action)) {
            return [
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
        }

        // isActionableMentionWhisper — narrow action type to access inviteeEmails safely
        if (!isActionableMentionWhisper(action)) {
            return [];
        }
        const actionableMentionWhisperOptions: ActionableItem[] = [];
        const isReportInPolicy = !!reportPolicyID && reportPolicyID !== CONST.POLICY.ID_FAKE && personalPolicyID !== reportPolicyID;
        const hasMentionedPolicyMembers = getOriginalMessage(action)?.inviteeEmails?.every((login) => isPolicyMember(policy, login)) ?? false;

        if ((isPolicyAdmin(policy) || isPolicyOwner(policy, currentUserAccountID)) && isReportInPolicy && !isSystemUserMentioned(action) && !hasMentionedPolicyMembers) {
            actionableMentionWhisperOptions.push({
                text: 'actionableMentionWhisperOptions.inviteToSubmitExpense',
                key: `${action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE_TO_SUBMIT_EXPENSE}`,
                onPress: () =>
                    resolveActionableMentionWhisper(reportActionReport, action, CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE_TO_SUBMIT_EXPENSE, isOriginalReportArchived),
                isMediumSized: true,
            } as ActionableItem);
        }

        actionableMentionWhisperOptions.push(
            {
                text: 'actionableMentionWhisperOptions.inviteToChat',
                key: `${action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE}`,
                onPress: () => resolveActionableMentionWhisper(reportActionReport, action, CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE, isOriginalReportArchived),
                isMediumSized: true,
            } as ActionableItem,
            {
                text: 'actionableMentionWhisperOptions.nothing',
                key: `${action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.NOTHING}`,
                onPress: () => resolveActionableMentionWhisper(reportActionReport, action, CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.NOTHING, isOriginalReportArchived),
                isMediumSized: true,
            } as ActionableItem,
        );
        return actionableMentionWhisperOptions;
    }, [
        action,
        translate,
        reportID,
        originalReportID,
        reportActionReport,
        policy,
        currentUserAccountID,
        personalPolicyID,
        isReportArchived,
        isOriginalReportArchived,
        resolveActionableReportMentionWhisper,
        resolveActionableMentionWhisper,
        reportPolicyID,
    ]);

    if (isActionableCardFraudAlert(action)) {
        const message = getActionableCardFraudAlertMessage(translate, action, getLocalDateFromDatetime);
        return (
            <View
                accessibilityRole={CONST.ROLE.ALERT}
                accessibilityLabel={translate('reportFraudConfirmationPage.title')}
            >
                <ReportActionItemBasicMessage message={message} />
                {buttons.length > 0 && (
                    <ActionableItemButtons
                        items={buttons}
                        layout="horizontal"
                    />
                )}
            </View>
        );
    }

    if (isActionableJoinRequest(action)) {
        return (
            <View>
                <ReportActionItemBasicMessage message={getJoinRequestMessage(translate, policy, action)} />
                {buttons.length > 0 && (
                    <ActionableItemButtons
                        items={buttons}
                        shouldUseLocalization
                        layout="horizontal"
                    />
                )}
            </View>
        );
    }

    if (isActionableReportMentionWhisper(action)) {
        return (
            <ReportActionItemBasicMessage message={getReportActionText(action)}>
                {buttons.length > 0 && (
                    <ActionableItemButtons
                        items={buttons}
                        shouldUseLocalization
                        layout="horizontal"
                    />
                )}
            </ReportActionItemBasicMessage>
        );
    }

    // isActionableMentionWhisper — type guard verified in useMemo above; assert for render
    const mentionWhisperAction = isActionableMentionWhisper(action) ? action : undefined;
    return (
        <ReportActionItemBasicMessage>
            <RenderHTML html={getActionableMentionWhisperMessage(translate, mentionWhisperAction)} />
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

ActionableWhisperContent.displayName = 'ActionableWhisperContent';

export {isActionableWhisperAction};
export default ActionableWhisperContent;
