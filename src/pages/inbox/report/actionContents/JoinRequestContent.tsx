import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import useLocalize from '@hooks/useLocalize';
import {getJoinRequestMessage, getOriginalMessage} from '@libs/ReportActionsUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import {acceptJoinRequest, declineJoinRequest} from '@userActions/Policy/Member';
import CONST from '@src/CONST';
import type {Policy, ReportAction} from '@src/types/onyx';
import type {JoinWorkspaceResolution} from '@src/types/onyx/OriginalMessage';

type JoinRequestContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST>;
    reportID: string | undefined;
    originalReportID: string;
    policy: OnyxEntry<Policy>;
};

function JoinRequestContent({action, reportID, originalReportID, policy}: JoinRequestContentProps) {
    const {translate} = useLocalize();

    const reportActionReportID = originalReportID ?? reportID;
    const buttons: ActionableItem[] =
        getOriginalMessage(action)?.choice !== ('' as JoinWorkspaceResolution)
            ? []
            : [
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

JoinRequestContent.displayName = 'JoinRequestContent';

export default JoinRequestContent;
