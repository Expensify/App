import {renderHook} from '@testing-library/react-native';

import type {AgentRowData} from '@components/Tables/AgentsTable';

import useWorkspaceAgentsTable from '@hooks/useWorkspaceAgentsTable';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import createMock from '../utils/createMock';

const mockTemporaryAccountID = 7392018465730291;
const mockRealAccountID = 12348;

const mockAgentRows: AgentRowData[] = [];
jest.mock('@hooks/useAgentsTable', () => () => ({agents: mockAgentRows}));
jest.mock('@hooks/useWorkspaceAgents', () => () => ({
    manageableWorkspaceAgents: {[`agent_${mockTemporaryAccountID}`]: {prompt: 'Pending prompt'}},
    nonManageableWorkspaceAgentsIDs: [mockRealAccountID],
}));
jest.mock('@hooks/useWorkspaceMembers', () => () => [
    {accountID: mockRealAccountID, details: {accountID: mockRealAccountID, displayName: 'Created agent', isCustomAgent: true}, policyEmployee: {role: 'user'}},
]);
// The only Onyx key this hook reads itself is the optimistic-to-real mapping.
jest.mock('@hooks/useOnyx', () => (key: string) => [key === 'optimisticAgentAccountIDMapping' ? {[mockTemporaryAccountID]: mockRealAccountID} : undefined, {status: 'loaded'}]);

describe('useWorkspaceAgentsTable', () => {
    it('does not add the real accountID as a second row while the temporary record shows the real details', () => {
        // Given a second tab whose agents list shows a new agent's temporary record with the real agent's details, while the
        // workspace already lists the real accountID as a member the user can't manage from this record yet
        mockAgentRows.splice(0, mockAgentRows.length, {
            keyForList: String(mockTemporaryAccountID),
            accountID: mockRealAccountID,
            displayName: 'Created agent',
            login: '',
            canManage: true,
            isSelectionDisabled: true,
            action: () => {},
            onChatPress: () => {},
            onCopilotPress: () => {},
            dismissError: () => {},
        });

        // When the workspace's agent rows are built
        const {result} = renderHook(() => useWorkspaceAgentsTable(createMock<Policy>({id: 'policy1'})));

        // Then the workspace table keeps the one row it got from the agents list (the temporary record's) and gives it the
        // role of its real accountID, instead of adding the real accountID as a second, unmanageable row
        expect(result.current.agents).toHaveLength(1);
        expect(result.current.agents.at(0)?.keyForList).toBe(String(mockTemporaryAccountID));
        expect(result.current.agents.at(0)?.role).toBe(CONST.POLICY.ROLE.USER);
    });
});
