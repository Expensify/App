import {clearVendorErrors, setPolicyVendorsEnabled} from '@libs/actions/Policy/Vendor';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyVendors} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

jest.mock('@libs/API');
jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: () => false},
}));

const mockWrite = jest.mocked(write);
const policyID = 'test_policy_1';
const policyVendorsKey = `${ONYXKEYS.COLLECTION.POLICY_VENDORS}${policyID}` as const;

describe('PolicyVendorAction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('setPolicyVendorsEnabled', () => {
        it('does nothing when vendorIDs is empty', () => {
            setPolicyVendorsEnabled({
                policyID,
                vendorIDs: [],
                enabled: true,
            });

            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('dispatches SetPolicyVendorsEnabled with optimistic, success, and failure data', () => {
            const initialPolicyVendors: PolicyVendors = {
                vendor_1: {
                    externalID: 'vendor_1',
                    name: 'Acme Corp',
                    enabled: false,
                    origin: CONST.POLICY.CONNECTIONS.NAME.QBO,
                },
                vendor_2: {
                    externalID: 'vendor_2',
                    name: 'Beta LLC',
                    enabled: false,
                    origin: CONST.POLICY.CONNECTIONS.NAME.QBO,
                },
            };

            setPolicyVendorsEnabled({
                policyID,
                vendorIDs: ['vendor_1', 'vendor_2'],
                enabled: true,
                policyVendors: initialPolicyVendors,
            });

            expect(mockWrite).toHaveBeenCalledTimes(1);
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.SET_POLICY_VENDORS_ENABLED,
                {
                    policyID,
                    vendorIDs: JSON.stringify(['vendor_1', 'vendor_2']),
                    enabled: true,
                },
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyVendorsKey,
                            value: {
                                vendor_1: expect.objectContaining({
                                    enabled: true,
                                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                    pendingFields: {
                                        enabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                    },
                                    errors: null,
                                }),
                                vendor_2: expect.objectContaining({
                                    enabled: true,
                                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                    pendingFields: {
                                        enabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                    },
                                    errors: null,
                                }),
                            },
                        },
                    ],
                    successData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyVendorsKey,
                            value: {
                                vendor_1: expect.objectContaining({
                                    enabled: true,
                                    pendingAction: null,
                                    pendingFields: {
                                        enabled: null,
                                    },
                                    errors: null,
                                }),
                                vendor_2: expect.objectContaining({
                                    enabled: true,
                                    pendingAction: null,
                                    pendingFields: {
                                        enabled: null,
                                    },
                                    errors: null,
                                }),
                            },
                        },
                    ],
                    failureData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyVendorsKey,
                            value: {
                                vendor_1: expect.objectContaining({
                                    pendingAction: null,
                                    pendingFields: {
                                        enabled: null,
                                    },
                                    errors: expect.any(Object),
                                }),
                                vendor_2: expect.objectContaining({
                                    pendingAction: null,
                                    pendingFields: {
                                        enabled: null,
                                    },
                                    errors: expect.any(Object),
                                }),
                            },
                        },
                    ],
                },
            );
        });
    });

    describe('clearVendorErrors', () => {
        it('merges null errors and pending fields to Onyx', () => {
            const onyxMergeSpy = jest.spyOn(Onyx, 'merge');

            clearVendorErrors(policyID, 'vendor_1');

            expect(onyxMergeSpy).toHaveBeenCalledWith(policyVendorsKey, {
                vendor_1: {
                    errors: null,
                    pendingAction: null,
                    pendingFields: null,
                    errorFields: null,
                },
            });

            onyxMergeSpy.mockRestore();
        });
    });
});
