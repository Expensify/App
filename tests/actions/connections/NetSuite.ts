import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {shouldUseUpdateNetSuiteTokens} from '@libs/actions/connections';
import {connectPolicyToNetSuite, updateNetSuiteTokens, updateNetSuiteTravelInvoicingPayableAccount, updateNetSuiteTravelInvoicingVendor} from '@libs/actions/connections/NetSuiteCommands';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as API from '@libs/API';
import type {WriteCommand} from '@libs/API/types';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {AnyOnyxData} from '@src/types/onyx/Request';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/API');

const writeSpy = jest.spyOn(API, 'write');

const MOCK_POLICY_ID = 'MOCK_POLICY_ID';
const MOCK_CREDENTIALS = {
    netSuiteAccountID: 'account-123',
    netSuiteTokenID: 'token-123',
    netSuiteTokenSecret: 'secret-123',
};

function getFirstWriteCall(): {command: WriteCommand; onyxData?: AnyOnyxData} {
    const call = writeSpy.mock.calls.at(0);
    if (!call) {
        throw new Error('API.write was not called');
    }
    const [command, , onyxData] = call;
    return {command, onyxData};
}

function createPolicy(options: {isAuthError?: boolean; verified?: boolean}): OnyxEntry<Policy> {
    return {
        id: MOCK_POLICY_ID,
        connections: {
            netsuite: {
                verified: options.verified ?? false,
                lastSync: {
                    isAuthenticationError: options.isAuthError ?? false,
                },
            },
        },
    } as unknown as Policy;
}

describe('actions/connections/NetSuite', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('connectPolicyToNetSuite', () => {
        it('writes the ConnectPolicyToNetSuite command', () => {
            connectPolicyToNetSuite(MOCK_POLICY_ID, MOCK_CREDENTIALS);

            const {command} = getFirstWriteCall();
            expect(command).toBe(WRITE_COMMANDS.CONNECT_POLICY_TO_NETSUITE);
        });

        it('passes the policyID and credentials as parameters', () => {
            connectPolicyToNetSuite(MOCK_POLICY_ID, MOCK_CREDENTIALS);

            const call = writeSpy.mock.calls.at(0);
            expect(call).toBeDefined();
            const params = call?.[1];
            expect(params).toEqual({
                policyID: MOCK_POLICY_ID,
                ...MOCK_CREDENTIALS,
            });
        });

        it('sets optimistic sync progress data', () => {
            connectPolicyToNetSuite(MOCK_POLICY_ID, MOCK_CREDENTIALS);

            const {onyxData} = getFirstWriteCall();
            const optimisticUpdate = onyxData?.optimisticData?.at(0);

            expect(optimisticUpdate?.onyxMethod).toBe(Onyx.METHOD.MERGE);
            expect(optimisticUpdate?.key).toBe(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${MOCK_POLICY_ID}`);
            expect(optimisticUpdate?.value).toEqual(
                expect.objectContaining({
                    stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.NETSUITE_SYNC_CONNECTION,
                    connectionName: CONST.POLICY.CONNECTIONS.NAME.NETSUITE,
                }),
            );
        });
    });

    describe('updateNetSuiteTokens', () => {
        it('writes the UpdateNetSuiteTokens command', () => {
            updateNetSuiteTokens(MOCK_POLICY_ID, MOCK_CREDENTIALS);

            const {command} = getFirstWriteCall();
            expect(command).toBe(WRITE_COMMANDS.UPDATE_NETSUITE_TOKENS);
        });

        it('passes the policyID and credentials as parameters', () => {
            updateNetSuiteTokens(MOCK_POLICY_ID, MOCK_CREDENTIALS);

            const call = writeSpy.mock.calls.at(0);
            expect(call).toBeDefined();
            const params = call?.[1];
            expect(params).toEqual({
                policyID: MOCK_POLICY_ID,
                ...MOCK_CREDENTIALS,
            });
        });

        it('sets optimistic sync progress data', () => {
            updateNetSuiteTokens(MOCK_POLICY_ID, MOCK_CREDENTIALS);

            const {onyxData} = getFirstWriteCall();
            const optimisticUpdate = onyxData?.optimisticData?.at(0);

            expect(optimisticUpdate?.onyxMethod).toBe(Onyx.METHOD.MERGE);
            expect(optimisticUpdate?.key).toBe(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${MOCK_POLICY_ID}`);
            expect(optimisticUpdate?.value).toEqual(
                expect.objectContaining({
                    stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.NETSUITE_SYNC_CONNECTION,
                    connectionName: CONST.POLICY.CONNECTIONS.NAME.NETSUITE,
                }),
            );
        });
    });

    describe('shouldUseUpdateNetSuiteTokens', () => {
        it('returns false for unverified connection with auth error (regression case)', () => {
            const policy = createPolicy({isAuthError: true, verified: false});
            expect(shouldUseUpdateNetSuiteTokens(policy)).toBe(false);
        });

        it('returns true for verified connection with auth error', () => {
            const policy = createPolicy({isAuthError: true, verified: true});
            expect(shouldUseUpdateNetSuiteTokens(policy)).toBe(true);
        });

        it('returns false when there is no auth error', () => {
            const policy = createPolicy({isAuthError: false, verified: true});
            expect(shouldUseUpdateNetSuiteTokens(policy)).toBe(false);
        });

        it('returns false when policy is undefined', () => {
            expect(shouldUseUpdateNetSuiteTokens(undefined)).toBe(false);
        });

        it('returns false for unverified connection without auth error', () => {
            const policy = createPolicy({isAuthError: false, verified: false});
            expect(shouldUseUpdateNetSuiteTokens(policy)).toBe(false);
        });
    });

    describe('updateNetSuiteTravelInvoicingVendor', () => {
        it('writes the UpdateManyPolicyConnectionConfigs command with travelInvoicingVendorID', () => {
            updateNetSuiteTravelInvoicingVendor(MOCK_POLICY_ID, 'vendor-123', 'old-vendor');

            const {command} = getFirstWriteCall();
            expect(command).toBe(WRITE_COMMANDS.UPDATE_MANY_POLICY_CONNECTION_CONFIGS);

            const call = writeSpy.mock.calls.at(0);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- API.write's params argument is typed as a broad union, so narrow to the shape this command sends
            const params = call?.[1] as {connectionName: string; configUpdate: string; policyID: string};
            expect(params.policyID).toBe(MOCK_POLICY_ID);
            expect(params.connectionName).toBe(CONST.POLICY.CONNECTIONS.NAME.NETSUITE);
            expect(JSON.parse(params.configUpdate)).toEqual({[CONST.NETSUITE_CONFIG.TRAVEL_INVOICING_VENDOR]: 'vendor-123'});
        });

        it('merges travelInvoicingVendorID optimistically onto the NetSuite options config', () => {
            updateNetSuiteTravelInvoicingVendor(MOCK_POLICY_ID, 'vendor-123', 'old-vendor');

            const {onyxData} = getFirstWriteCall();
            const optimisticUpdate = onyxData?.optimisticData?.at(0);
            expect(optimisticUpdate?.key).toBe(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- optimisticData values are typed as unknown; narrow to the partial Policy shape this update writes
            const value = optimisticUpdate?.value as {connections: {netsuite: {options: {config: Record<string, unknown>}}}};
            expect(value.connections.netsuite.options.config[CONST.NETSUITE_CONFIG.TRAVEL_INVOICING_VENDOR]).toBe('vendor-123');
        });
    });

    describe('updateNetSuiteTravelInvoicingPayableAccount', () => {
        it('writes the UpdateManyPolicyConnectionConfigs command with travelInvoicingPayableAccountID', () => {
            updateNetSuiteTravelInvoicingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const {command} = getFirstWriteCall();
            expect(command).toBe(WRITE_COMMANDS.UPDATE_MANY_POLICY_CONNECTION_CONFIGS);

            const call = writeSpy.mock.calls.at(0);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- API.write's params argument is typed as a broad union, so narrow to the shape this command sends
            const params = call?.[1] as {connectionName: string; configUpdate: string; policyID: string};
            expect(params.policyID).toBe(MOCK_POLICY_ID);
            expect(params.connectionName).toBe(CONST.POLICY.CONNECTIONS.NAME.NETSUITE);
            expect(JSON.parse(params.configUpdate)).toEqual({[CONST.NETSUITE_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT]: 'account-123'});
        });

        it('merges travelInvoicingPayableAccountID optimistically onto the NetSuite options config', () => {
            updateNetSuiteTravelInvoicingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const {onyxData} = getFirstWriteCall();
            const optimisticUpdate = onyxData?.optimisticData?.at(0);
            expect(optimisticUpdate?.key).toBe(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- optimisticData values are typed as unknown; narrow to the partial Policy shape this update writes
            const value = optimisticUpdate?.value as {connections: {netsuite: {options: {config: Record<string, unknown>}}}};
            expect(value.connections.netsuite.options.config[CONST.NETSUITE_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT]).toBe('account-123');
        });
    });
});
