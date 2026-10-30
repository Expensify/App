import type PolicyData from '@hooks/usePolicyData/types';

import {clearVendorErrors, openPolicyVendorsPage, setPolicyVendorsEnabled} from '@libs/actions/Policy/Vendor';
import {read, write} from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyVendors} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';

jest.mock('@libs/API');
jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: () => false},
}));

const mockRead = jest.mocked(read);
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
                vendor1: {
                    externalID: 'vendor1',
                    name: 'Acme Corp',
                    enabled: false,
                    origin: CONST.POLICY.CONNECTIONS.NAME.QBO,
                },
                vendor2: {
                    externalID: 'vendor2',
                    name: 'Beta LLC',
                    enabled: false,
                    origin: CONST.POLICY.CONNECTIONS.NAME.QBO,
                },
            };

            setPolicyVendorsEnabled({
                policyID,
                vendorIDs: ['vendor1', 'vendor2'],
                enabled: true,
                policyVendors: initialPolicyVendors,
            });

            expect(mockWrite).toHaveBeenCalledTimes(1);
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.SET_POLICY_VENDORS_ENABLED,
                {
                    policyID,
                    vendorIDs: JSON.stringify(['vendor1', 'vendor2']),
                    enabled: true,
                },
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyVendorsKey,
                            value: {
                                vendor1: expect.objectContaining({
                                    enabled: true,
                                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                    pendingFields: {
                                        enabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                    },
                                    errors: null,
                                }),
                                vendor2: expect.objectContaining({
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
                                vendor1: expect.objectContaining({
                                    enabled: true,
                                    pendingAction: null,
                                    pendingFields: {
                                        enabled: null,
                                    },
                                    errors: null,
                                }),
                                vendor2: expect.objectContaining({
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
                                vendor1: expect.objectContaining({
                                    pendingAction: null,
                                    pendingFields: {
                                        enabled: null,
                                    },
                                    errors: expect.anything() as unknown,
                                }),
                                vendor2: expect.objectContaining({
                                    pendingAction: null,
                                    pendingFields: {
                                        enabled: null,
                                    },
                                    errors: expect.anything() as unknown,
                                }),
                            },
                        },
                    ],
                },
            );
        });

        it('includes optimistic transaction errors when policyData is provided', () => {
            const initialPolicyVendors: PolicyVendors = {
                vendor1: {
                    externalID: 'vendor1',
                    name: 'Acme Corp',
                    enabled: true,
                    origin: CONST.POLICY.CONNECTIONS.NAME.QBO,
                },
            };

            const fakePolicyData = createMock<PolicyData>({
                policy: {
                    id: policyID,
                    type: CONST.POLICY.TYPE.CORPORATE,
                    name: 'Test Policy',
                    role: CONST.POLICY.ROLE.ADMIN,
                    owner: 'test@expensify.com',
                    outputCurrency: CONST.CURRENCY.USD,
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD},
                            data: {
                                vendors: [{id: 'vendor1', name: 'Acme Corp', currency: 'USD'}],
                            },
                        },
                    },
                },
                categories: {},
                tags: {},
                vendors: initialPolicyVendors,
                reports: [
                    {
                        reportID: 'report1',
                        policyID,
                        type: CONST.REPORT.TYPE.EXPENSE,
                    },
                ],
                transactionsAndViolations: {
                    report1: {
                        transactions: {
                            trans1: {
                                transactionID: 'trans1',
                                reportID: 'report1',
                                amount: 100,
                                currency: CONST.CURRENCY.USD,
                                created: '2025-01-01',
                                comment: {
                                    vendor: {
                                        externalID: 'vendor1',
                                        wasManuallySet: true,
                                    },
                                },
                            },
                        },
                        violations: {},
                    },
                },
            });

            setPolicyVendorsEnabled({
                policyID,
                vendorIDs: ['vendor1'],
                enabled: false,
                policyVendors: initialPolicyVendors,
                policyData: fakePolicyData,
                isVendorMatchingBetaEnabled: true,
            });

            expect(mockWrite).toHaveBeenCalledTimes(1);
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.SET_POLICY_VENDORS_ENABLED,
                expect.anything(),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}trans1`,
                            value: [
                                expect.objectContaining({
                                    name: CONST.VIOLATIONS.INACTIVE_VENDOR,
                                    type: CONST.VIOLATION_TYPES.VIOLATION,
                                }),
                            ],
                        }),
                    ]),
                }),
            );
        });
    });

    describe('clearVendorErrors', () => {
        it('merges null errors and pending fields to Onyx', () => {
            const onyxMergeSpy = jest.spyOn(Onyx, 'merge');

            clearVendorErrors(policyID, 'vendor1');

            expect(onyxMergeSpy).toHaveBeenCalledWith(policyVendorsKey, {
                vendor1: {
                    errors: null,
                    pendingAction: null,
                    pendingFields: null,
                    errorFields: null,
                },
            });

            onyxMergeSpy.mockRestore();
        });
    });

    describe('openPolicyVendorsPage', () => {
        it('dispatches OpenPolicyVendorsPage read command with policyID', () => {
            openPolicyVendorsPage(policyID);

            expect(mockRead).toHaveBeenCalledTimes(1);
            expect(mockRead).toHaveBeenCalledWith(READ_COMMANDS.OPEN_POLICY_VENDORS_PAGE, {policyID});
        });

        it('logs a warning and does not call read when policyID is empty', () => {
            const logWarnSpy = jest.spyOn(Log, 'warn').mockImplementation(() => {});

            openPolicyVendorsPage('');

            expect(logWarnSpy).toHaveBeenCalledWith('openPolicyVendorsPage invalid params', {policyID: ''});
            expect(mockRead).not.toHaveBeenCalled();

            logWarnSpy.mockRestore();
        });
    });
});
