import {act, renderHook} from '@testing-library/react-native';

import {ModalActions} from '@components/Modal/Global/ModalContext';

import {removePolicyConnection} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';

import useMergeConnectionListings from '@pages/workspace/connections/useMergeConnectionListings';
import type {MergeProviderCardDescriptor} from '@pages/workspace/merge/types';

import {enablePolicyFeatureForConnection} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockShowConfirmModal = jest.fn();
let mockIsControlPolicy = true;
let mockHRCards: Array<Partial<MergeProviderCardDescriptor>> = [];

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
    getLocalDateFromDatetime: jest.fn(),
    datetimeToRelative: () => '',
    formatPhoneNumber: (phone: string) => phone,
}));
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => false}));
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: mockShowConfirmModal}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: true, showReadOnlyModal: jest.fn()}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@libs/actions/connections', () => ({removePolicyConnection: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));
jest.mock('@libs/PolicyUtils', () => ({isControlPolicy: () => mockIsControlPolicy}));
jest.mock('@pages/workspace/hr/utils', () => ({getHRCards: () => mockHRCards}));
jest.mock('@pages/workspace/recruiting/utils', () => ({getRecruitingCards: () => []}));
jest.mock('@userActions/Policy/Policy', () => ({enablePolicyFeatureForConnection: jest.fn()}));

const policy: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), id: 'policy-1'};

function buildCard(connectionName: MergeProviderCardDescriptor['connectionName'], isConnected: boolean): Partial<MergeProviderCardDescriptor> {
    return {connectionName, displayName: connectionName, category: CONST.POLICY.CONNECTIONS.CATEGORY.HR, isConnected, setupLink: `https://merge.dev/${connectionName}`};
}

function renderListings() {
    const onStartSetup = jest.fn();
    const {result} = renderHook(() => useMergeConnectionListings(policy, onStartSetup));
    return {listings: result.current, onStartSetup};
}

describe('useMergeConnectionListings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsControlPolicy = true;
        mockHRCards = [buildCard(CONST.POLICY.CONNECTIONS.NAME.GUSTO, false), buildCard(CONST.POLICY.CONNECTIONS.NAME.ZENEFITS, false)];
    });

    it('should send a workspace that is not on Control to the upgrade page', () => {
        // Given a workspace that is not on the Control plan, which HR requires
        mockIsControlPolicy = false;
        const {listings, onStartSetup} = renderListings();

        // When the admin connects an HR provider
        listings.at(0)?.onConnect();

        // Then the upgrade page opens instead of the provider's setup
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(onStartSetup).not.toHaveBeenCalled();
    });

    it('should turn HR on and start the setup when no provider is connected yet', () => {
        // Given a Control workspace with no HR provider connected
        const {listings, onStartSetup} = renderListings();

        // When the admin connects Gusto
        listings.find((listing) => listing.title === CONST.POLICY.CONNECTIONS.NAME.GUSTO)?.onConnect();

        // Then HR is turned on and Gusto's setup starts, with nothing to replace
        expect(enablePolicyFeatureForConnection).toHaveBeenCalledWith(policy, CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED);
        expect(onStartSetup).toHaveBeenCalledWith(`https://merge.dev/${CONST.POLICY.CONNECTIONS.NAME.GUSTO}`, CONST.POLICY.CONNECTIONS.CATEGORY.HR);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('should ask before replacing the connected provider, and leave it alone when the admin cancels', async () => {
        // Given a workspace with Gusto connected, since only one HR provider can be connected at a time
        mockHRCards = [buildCard(CONST.POLICY.CONNECTIONS.NAME.GUSTO, true), buildCard(CONST.POLICY.CONNECTIONS.NAME.ZENEFITS, false)];
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CLOSE});
        const {listings, onStartSetup} = renderListings();

        // When the admin connects another provider and cancels the Replace prompt
        await act(async () => {
            listings.find((listing) => listing.title === CONST.POLICY.CONNECTIONS.NAME.ZENEFITS)?.onConnect();
            await waitForBatchedUpdates();
        });

        // Then Gusto stays connected and no setup starts
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(removePolicyConnection).not.toHaveBeenCalled();
        expect(onStartSetup).not.toHaveBeenCalled();
    });

    it('should mark a provider that needs reconnecting as broken', () => {
        // Given a connected provider whose authentication expired
        mockHRCards = [{...buildCard(CONST.POLICY.CONNECTIONS.NAME.GUSTO, true), needsReconnect: true}];

        // When the listings are built
        const {listings} = renderListings();

        // Then the card reads as broken, so the admin sees a Fix button
        expect(listings.at(0)?.status?.isBroken).toBe(true);
    });
});
