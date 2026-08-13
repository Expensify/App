import Button from '@components/ButtonComposed';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getJoinRequestMessage, getOriginalMessage} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import {acceptJoinRequest, declineJoinRequest} from '@userActions/Policy/Member';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {JoinWorkspaceResolution} from '@src/types/onyx/OriginalMessage';

import React from 'react';
import {View} from 'react-native';

type JoinRequestContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST>;
    actionOwnerReportID: string | undefined;
    policyID: string | undefined;
};

function JoinRequestContent({action, actionOwnerReportID, policyID}: JoinRequestContentProps) {
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const isJoinRequestUnresolved = getOriginalMessage(action)?.choice === ('' as JoinWorkspaceResolution);

    return (
        <View>
            <ReportActionItemBasicMessage message={getJoinRequestMessage(translate, policy, action)} />
            {isJoinRequestUnresolved && (
                <ActionableItemButtons layout="horizontal">
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        onPress={() => acceptJoinRequest(actionOwnerReportID, action)}
                    >
                        <Button.Text>{translate('actionableMentionJoinWorkspaceOptions.accept')}</Button.Text>
                    </Button>
                    <Button onPress={() => declineJoinRequest(actionOwnerReportID, action)}>
                        <Button.Text>{translate('actionableMentionJoinWorkspaceOptions.decline')}</Button.Text>
                    </Button>
                </ActionableItemButtons>
            )}
        </View>
    );
}

export default JoinRequestContent;
