import RenderHTML from '@components/RenderHTML';

import Navigation from '@libs/Navigation/Navigation';

import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

import useConfirmModal from './useConfirmModal';
import useEnvironment from './useEnvironment';
import useLocalize from './useLocalize';
import useThemeStyles from './useThemeStyles';

/** The action being blocked because RuleBot is still enforcing the workspace's Agent rules */
type RuleBotGuardAction = 'remove' | 'changeRole' | 'deleteAgent' | 'closeAccount';

const TRANSLATION_KEYS = {
    remove: {
        title: 'workspace.rules.agentRules.unableToRemoveTitle',
        prompt: 'workspace.rules.agentRules.unableToRemovePrompt',
    },
    changeRole: {
        title: 'workspace.rules.agentRules.unableToChangeRoleTitle',
        prompt: 'workspace.rules.agentRules.unableToChangeRolePrompt',
    },
    deleteAgent: {
        title: 'workspace.rules.agentRules.unableToDeleteAgentTitle',
        prompt: 'workspace.rules.agentRules.unableToDeleteAgentPrompt',
    },
    closeAccount: {
        title: 'workspace.rules.agentRules.unableToCloseAccountTitle',
        prompt: 'workspace.rules.agentRules.unableToCloseAccountPrompt',
    },
} as const satisfies Record<RuleBotGuardAction, {title: TranslationPaths; prompt: TranslationPaths}>;

/**
 * Shows the blocking "Unable to ..." modal used when an action (removing, demoting, deleting, or closing the account of
 * a RuleBot agent) can't proceed because the agent is still enforcing a workspace's Agent rules. The prompt links to
 * that workspace's Rules page so the admin can delete the rules first.
 */
function useRuleBotGuardModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal, closeModal} = useConfirmModal();
    const {environmentURL} = useEnvironment();

    const showRuleBotGuardModal = (action: RuleBotGuardAction, policyID: string) => {
        const workspaceRulesRoute = ROUTES.WORKSPACE_RULES.getRoute(policyID);
        return showConfirmModal({
            shouldShowCancelButton: false,
            title: translate(TRANSLATION_KEYS[action].title),
            prompt: (
                <View style={[styles.renderHTML, styles.flexRow]}>
                    <RenderHTML
                        onLinkPress={() => {
                            closeModal();
                            Navigation.navigate(workspaceRulesRoute);
                        }}
                        html={translate(TRANSLATION_KEYS[action].prompt, `${environmentURL}/${workspaceRulesRoute}`)}
                    />
                </View>
            ),
            confirmText: translate('common.buttonConfirm'),
        });
    };

    return showRuleBotGuardModal;
}

export default useRuleBotGuardModal;
