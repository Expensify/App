import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {WriteCommand} from '@libs/API/types';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import {updateQuickbooksDesktopTravelInvoicingPayableAccount, updateQuickbooksDesktopTravelInvoicingVendor} from '@src/libs/actions/connections/QuickbooksDesktop';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxData} from '@src/types/onyx/Request';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {
        isHybridApp: jest.fn(),
    },
}));

const writeSpy = jest.spyOn(API, 'write');

const MOCK_POLICY_ID = 'MOCK_POLICY_ID';

function getFirstWriteCall(): {command: WriteCommand; onyxData?: AnyOnyxData} {
    const call = writeSpy.mock.calls.at(0);
    if (!call) {
        throw new Error('API.write was not called');
    }
    const [command, , onyxData] = call;
    return {command, onyxData};
}

describe('actions/connections/QuickbooksDesktop', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateQuickbooksDesktopTravelInvoicingVendor', () => {
        it('writes the UpdateManyPolicyConnectionConfigs command with the vendor nested under export', () => {
            updateQuickbooksDesktopTravelInvoicingVendor(MOCK_POLICY_ID, 'vendor-123', 'old-vendor');

            const {command} = getFirstWriteCall();
            expect(command).toBe(WRITE_COMMANDS.UPDATE_MANY_POLICY_CONNECTION_CONFIGS);

            const call = writeSpy.mock.calls.at(0);
            const params = call?.[1] as {connectionName: string; configUpdate: string; policyID: string};
            expect(params.policyID).toBe(MOCK_POLICY_ID);
            expect(params.connectionName).toBe(CONST.POLICY.CONNECTIONS.NAME.QBD);
            expect(JSON.parse(params.configUpdate)).toEqual({export: {[CONST.QUICKBOOKS_DESKTOP_CONFIG.TRAVEL_INVOICING_VENDOR]: 'vendor-123'}});
        });

        it('merges the vendor optimistically onto the QBD export config', () => {
            updateQuickbooksDesktopTravelInvoicingVendor(MOCK_POLICY_ID, 'vendor-123', 'old-vendor');

            const {onyxData} = getFirstWriteCall();
            const optimisticUpdate = onyxData?.optimisticData?.at(0);
            expect(optimisticUpdate?.key).toBe(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`);

            const value = optimisticUpdate?.value as {connections: {quickbooksDesktop: {config: {export: {travelInvoicingVendorID: string}}}}};
            expect(value.connections.quickbooksDesktop.config.export.travelInvoicingVendorID).toBe('vendor-123');
        });
    });

    describe('updateQuickbooksDesktopTravelInvoicingPayableAccount', () => {
        it('writes the UpdateManyPolicyConnectionConfigs command with the payable account nested under export', () => {
            updateQuickbooksDesktopTravelInvoicingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const {command} = getFirstWriteCall();
            expect(command).toBe(WRITE_COMMANDS.UPDATE_MANY_POLICY_CONNECTION_CONFIGS);

            const call = writeSpy.mock.calls.at(0);
            const params = call?.[1] as {connectionName: string; configUpdate: string; policyID: string};
            expect(params.policyID).toBe(MOCK_POLICY_ID);
            expect(params.connectionName).toBe(CONST.POLICY.CONNECTIONS.NAME.QBD);
            expect(JSON.parse(params.configUpdate)).toEqual({export: {[CONST.QUICKBOOKS_DESKTOP_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT]: 'account-123'}});
        });

        it('merges the payable account optimistically onto the QBD export config', () => {
            updateQuickbooksDesktopTravelInvoicingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const {onyxData} = getFirstWriteCall();
            const optimisticUpdate = onyxData?.optimisticData?.at(0);
            expect(optimisticUpdate?.key).toBe(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`);

            const value = optimisticUpdate?.value as {connections: {quickbooksDesktop: {config: {export: {travelInvoicingPayableAccountID: string}}}}};
            expect(value.connections.quickbooksDesktop.config.export.travelInvoicingPayableAccountID).toBe('account-123');
        });
    });
});
