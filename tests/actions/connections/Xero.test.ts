import {updateXeroTravelInvoicingPayableAccount} from '@libs/actions/connections/Xero';
import * as API from '@libs/API';
import type {WriteCommand} from '@libs/API/types';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxData} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

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

describe('actions/connections/Xero', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateXeroTravelInvoicingPayableAccount', () => {
        it('writes the UpdateXeroTravelInvoicingPayableAccount command with travelInvoicingPayableAccountID', () => {
            updateXeroTravelInvoicingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const {command} = getFirstWriteCall();
            expect(command).toBe(WRITE_COMMANDS.UPDATE_XERO_TRAVEL_INVOICING_PAYABLE_ACCOUNT);

            const call = writeSpy.mock.calls.at(0);
            const params = call?.[1] as {idempotencyKey: string; policyID: string; settingValue: string};
            expect(params.policyID).toBe(MOCK_POLICY_ID);
            expect(params.settingValue).toBe('account-123');
            expect(params.idempotencyKey).toBe(CONST.XERO_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT);
        });

        it('merges travelInvoicingPayableAccountID optimistically onto the Xero config', () => {
            updateXeroTravelInvoicingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const {onyxData} = getFirstWriteCall();
            const optimisticUpdate = onyxData?.optimisticData?.at(0);
            expect(optimisticUpdate?.key).toBe(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`);

            const value = optimisticUpdate?.value as {connections: {xero: {config: {export: Record<string, unknown>; pendingFields: Record<string, unknown>}}}};
            expect(value.connections.xero.config.export[CONST.XERO_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT]).toBe('account-123');
            expect(value.connections.xero.config.pendingFields).toEqual({[CONST.XERO_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE});
        });
    });
});
