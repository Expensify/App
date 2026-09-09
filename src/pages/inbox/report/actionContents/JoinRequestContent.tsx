import Button from '@components/ButtonComposed';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getJoinRequestMessage, getOriginalMessage} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import {acceptJoinRequest, declineJoinRequest} from '@userActions/Policy/Member';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsSelector} from '@src/selectors/PersonalDetails';
import {policyNameSelector} from '@src/selectors/Policy';
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
    const [policyName = ''] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: policyNameSelector});

    const originalMessage = getOriginalMessage(action);
    const [requesterDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsSelector(originalMessage?.accountID)});

    const isJoinRequestUnresolved = originalMessage?.choice === ('' as JoinWorkspaceResolution);

    return (
        <View>
            <ReportActionItemBasicMessage message={getJoinRequestMessage(translate, policyName, action, requesterDetails)} />
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
