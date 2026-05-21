import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import Button from '@components/Button';
import MenuItem from '@components/MenuItem';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {connect} from '@libs/actions/Delegate';
import {navigateToAndOpenReportWithAccountIDs} from '@libs/actions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type AgentActionsProps = {
    /** Account ID of the agent */
    accountID: number;

    /** Login email of the agent */
    login: string;

    /** Whether the actions are disabled */
    isDisabled?: boolean;
};

function useAgentActions({accountID, login}: Pick<AgentActionsProps, 'accountID' | 'login'>) {
    const personalDetails = usePersonalDetails();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);

    const currentUserAccountID = currentUserPersonalDetails.accountID ?? CONST.DEFAULT_NUMBER_ID;

    return {
        openChat: () => navigateToAndOpenReportWithAccountIDs([accountID], currentUserAccountID, introSelected, isSelfTourViewed, betas, personalDetails, true),
        copilotAsAgent: () => {
            if (!login) {
                return;
            }
            connect({email: login, delegatedAccess: account?.delegatedAccess, credentials, session, activePolicyID});
        },
    };
}

function AgentActionButtons({accountID, login, isDisabled = false}: AgentActionsProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbles', 'UserEye']);
    const {openChat, copilotAsAgent} = useAgentActions({accountID, login});

    return (
        <>
            <Button
                small
                text={translate('common.chat')}
                icon={icons.ChatBubbles}
                onPress={openChat}
                isDisabled={isDisabled}
                accessibilityLabel={translate('common.chat')}
            />
            <Button
                small
                text={translate('delegate.copilot')}
                icon={icons.UserEye}
                onPress={copilotAsAgent}
                isDisabled={isDisabled || !login}
                accessibilityLabel={translate('delegate.copilot')}
            />
        </>
    );
}

function AgentActionMenuItems({accountID, login, isDisabled = false}: AgentActionsProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbles', 'UserEye']);
    const {openChat, copilotAsAgent} = useAgentActions({accountID, login});

    return (
        <>
            <MenuItem
                title={translate('common.chat')}
                icon={icons.ChatBubbles}
                onPress={openChat}
                disabled={isDisabled}
            />
            <MenuItem
                title={translate('delegate.copilot')}
                icon={icons.UserEye}
                onPress={copilotAsAgent}
                disabled={isDisabled || !login}
            />
        </>
    );
}

export {AgentActionButtons, AgentActionMenuItems};
