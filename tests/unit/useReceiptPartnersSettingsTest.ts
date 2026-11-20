import {renderHook} from '@testing-library/react-native';

import useReceiptPartnersSettings from '@pages/workspace/receiptPartners/useReceiptPartnersSettings';

import {openExternalLink} from '@userActions/Link';
import {removePolicyReceiptPartnersConnection} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';

let mockPolicy: Policy;
const mockShowConfirmModal = jest.fn(() => Promise.resolve({action: 'CONFIRM'}));

jest.mock('@hooks/usePolicy', () => () => mockPolicy);
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: mockShowConfirmModal}));
jest.mock('@hooks/useGetReceiptPartnersIntegrationData', () => () => ({
    getReceiptPartnersIntegrationData: () => undefined,
    shouldShowEnterCredentialsError: false,
    isUberConnected: true,
}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: true, showReadOnlyModal: jest.fn(), withReadOnlyFallback: jest.fn()}));
jest.mock('@components/Modal/Global/ModalContext', () => ({ModalActions: {CONFIRM: 'CONFIRM'}}));
jest.mock('@userActions/Link', () => ({openExternalLink: jest.fn()}));
jest.mock('@userActions/Policy/Policy', () => ({
    openPolicyReceiptPartnersPage: jest.fn(),
    removePolicyReceiptPartnersConnection: jest.fn(),
    togglePolicyUberAutoInvite: jest.fn(),
    togglePolicyUberAutoRemove: jest.fn(),
}));

const buildPolicy = (uber: NonNullable<Policy['receiptPartners']>['uber']): Policy => ({
    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
    id: 'policy-1',
    receiptPartners: {enabled: true, uber},
});

describe('useReceiptPartnersSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should open the Uber revoke page instead of disconnecting when the workspace is linked to an Uber organization', () => {
        // Given a workspace linked to an Uber organization, with the revoke page query the server sends when the page opens
        mockPolicy = buildPolicy({organizationID: 'org-1', revokeFormData: 'client_id=client&app_name=Expensify'});
        const onRevokePageOpened = jest.fn();
        const {result} = renderHook(() => useReceiptPartnersSettings('policy-1', {onRevokePageOpened}));

        // When the admin selects Disconnect
        result.current.getOverflowMenu(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER).at(0)?.onSelected?.();

        // Then Uber's revoke page opens for that organization without disconnecting yet, since we only disconnect once Uber confirms the revoke with its webhook
        expect(openExternalLink).toHaveBeenCalledWith(`${CONST.UBER_REVOKE_URL}?client_id=client&app_name=Expensify&org_uuid=org-1`);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(removePolicyReceiptPartnersConnection).not.toHaveBeenCalled();

        // And the panel is told to close only after the page opens, since Safari blocks new tabs opened after navigating away
        expect(onRevokePageOpened).toHaveBeenCalledTimes(1);
        expect(jest.mocked(openExternalLink).mock.invocationCallOrder.at(0)).toBeLessThan(onRevokePageOpened.mock.invocationCallOrder.at(0) ?? 0);
    });

    it('should disable Disconnect until the revoke page query arrives when the workspace is linked to an Uber organization', () => {
        // Given a workspace linked to an Uber organization before the server sent the revoke page query
        mockPolicy = buildPolicy({organizationID: 'org-1'});
        const {result} = renderHook(() => useReceiptPartnersSettings('policy-1'));

        // When the overflow menu is built
        const disconnectItem = result.current.getOverflowMenu(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER).at(0);

        // Then Disconnect is disabled instead of removing the connection only on our side, since that would leave Expensify authorized in Uber
        expect(disconnectItem?.disabled).toBe(true);
        expect(removePolicyReceiptPartnersConnection).not.toHaveBeenCalled();
    });

    it('should disconnect right away when the workspace is not linked to an Uber organization', async () => {
        // Given a workspace with Uber data but no Uber organization, so there is nothing to revoke on Uber's side
        mockPolicy = buildPolicy({enabled: true, revokeFormData: 'client_id=client&app_name=Expensify'});
        const {result} = renderHook(() => useReceiptPartnersSettings('policy-1'));

        // When the admin selects Disconnect and confirms
        result.current.getOverflowMenu(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER).at(0)?.onSelected?.();
        await Promise.resolve();

        // Then the connection is removed on our side only
        expect(openExternalLink).not.toHaveBeenCalled();
        expect(removePolicyReceiptPartnersConnection).toHaveBeenCalledWith('policy-1', CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER, mockPolicy.receiptPartners?.uber);
    });
});
