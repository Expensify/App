/**
 * Builds the AI & MCP listings for the Connections page. These connect outside Expensify, so they never show as connected.
 */
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';

import {isMCPEnabled} from '@libs/PolicyUtils';

import {openExternalLink} from '@userActions/Link';
import {enablePolicyMCP} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import type {ConnectionListing} from './types';

import {MCP_CONNECTOR} from './utils';

function useMCPConnectionListings(policy: OnyxEntry<Policy>): ConnectionListing[] {
    const policyID = policy?.id;
    const {translate} = useLocalize();
    const {canWrite, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);
    const icons = useMemoizedLazyExpensifyIcons(['ChatGPTSquare', 'ClaudeSquare', 'CursorSquare']);

    if (!policyID) {
        return [];
    }

    const connectors = [
        {key: MCP_CONNECTOR.CLAUDE, icon: icons.ClaudeSquare, title: translate('workspace.mcp.claude.title'), url: CONST.CLAUDE_CONNECT_URL},
        {key: MCP_CONNECTOR.CHATGPT, icon: icons.ChatGPTSquare, title: translate('workspace.mcp.chatgpt.title'), url: CONST.CHATGPT_CONNECT_URL},
        {key: MCP_CONNECTOR.CURSOR, icon: icons.CursorSquare, title: translate('workspace.mcp.cursor.title'), url: CONST.CURSOR_MCP_HELP_URL},
    ];

    return connectors.map(({key, icon, title, url}) => ({
        key,
        category: CONST.TAB.CONNECTIONS.AI,
        title,
        icon,
        onConnect: () => {
            if (!canWrite) {
                showReadOnlyModal();
                return;
            }
            if (!isMCPEnabled(policy)) {
                enablePolicyMCP(policyID, true);
            }
            openExternalLink(url);
        },
    }));
}

export default useMCPConnectionListings;
