import {renderHook} from '@testing-library/react-native';

import useMCPConnectionListings from '@pages/workspace/connections/useMCPConnectionListings';

import {openExternalLink} from '@userActions/Link';
import {enablePolicyFeatureForConnection} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';

const mockShowReadOnlyModal = jest.fn();
let mockCanWrite = true;

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: mockCanWrite, showReadOnlyModal: mockShowReadOnlyModal}));
jest.mock('@userActions/Link', () => ({openExternalLink: jest.fn()}));
jest.mock('@userActions/Policy/Policy', () => ({enablePolicyFeatureForConnection: jest.fn()}));

const policy: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), id: 'policy-1'};

describe('useMCPConnectionListings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCanWrite = true;
    });

    it('should turn MCP on and open the assistant when an admin connects one', () => {
        // Given an admin who can edit the workspace
        const {result} = renderHook(() => useMCPConnectionListings(policy));
        const claude = result.current.find((listing) => listing.key === 'claude');

        // When they connect Claude
        claude?.onConnect();

        // Then MCP is turned on and Claude's connect page opens, since Connections has no MCP toggle
        expect(enablePolicyFeatureForConnection).toHaveBeenCalledWith(policy, CONST.POLICY.MORE_FEATURES.IS_MCP_ENABLED);
        expect(openExternalLink).toHaveBeenCalledWith(CONST.CLAUDE_CONNECT_URL);
    });

    it('should only show the read-only modal to a member who cannot edit the workspace', () => {
        // Given a member without write access to the workspace features
        mockCanWrite = false;
        const {result} = renderHook(() => useMCPConnectionListings(policy));

        // When they try to connect an assistant
        result.current.at(0)?.onConnect();

        // Then they are told they can't, and nothing is turned on or opened
        expect(mockShowReadOnlyModal).toHaveBeenCalledTimes(1);
        expect(enablePolicyFeatureForConnection).not.toHaveBeenCalled();
        expect(openExternalLink).not.toHaveBeenCalled();
    });
});
