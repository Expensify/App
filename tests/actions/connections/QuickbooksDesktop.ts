import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {WriteCommand} from '@libs/API/types';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import {updateQuickbooksDesktopTravelInvoicingPayableAccount} from '@src/libs/actions/connections/QuickbooksDesktop';
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

    describe('updateQuickbooksDesktopTravelInvoicingPayableAccount', () => {
        it('writes the dedicated payable account command with the selected account', () => {
            updateQuickbooksDesktopTravelInvoicingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const {command} = getFirstWriteCall();
            expect(command).toBe(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_TRAVEL_INVOICING_PAYABLE_ACCOUNT);

            const call = writeSpy.mock.calls.at(0);
            const params = call?.[1] as {idempotencyKey: string; policyID: string; settingValue: string};
            expect(params.policyID).toBe(MOCK_POLICY_ID);
            expect(params.settingValue).toBe('account-123');
            expect(params.idempotencyKey).toBe(String(CONST.QUICKBOOKS_DESKTOP_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT));
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
