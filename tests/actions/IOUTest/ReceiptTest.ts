/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {waitFor} from '@testing-library/react-native';

import type {SearchQueryJSON} from '@components/Search/types';

import {detachReceipt, replaceReceipt, setMoneyRequestReceipt} from '@libs/actions/IOU/Receipt';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {WRITE_COMMANDS} from '@libs/API/types';
import type * as PolicyUtils from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as API from '@src/libs/API';
import * as SearchQueryUtils from '@src/libs/SearchQueryUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, SearchResults} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import createRandomPolicyTags from '../../utils/collections/policyTags';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import createMock from '../../utils/createMock';
import getOnyxValue from '../../utils/getOnyxValue';
import {getGlobalFetchMock, getRequiredOnyxUpdate, getRequiredOnyxUpdates, getRequiredWriteCall} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissModalWithReport: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => '23423423'),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    removeScreenByKey: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRouteByID: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(),
    getActiveRoute: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(),
    },
}));

jest.mock('@react-navigation/native');

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
    isPolicyOwner: jest.fn().mockImplementation((policy?: OnyxEntry<Policy>, currentUserAccountID?: number) => !!currentUserAccountID && policy?.ownerAccountID === currentUserAccountID),
}));

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

type ReceiptAuditAction = {
    reportActionID: string;
    created: string;
    originalMessage: {receiptAdded?: boolean; receiptRemoved?: boolean};
};

/** Narrows the untyped values of an Onyx report actions update, so the audit actions can be inspected field by field. */
function isReceiptAuditAction(action: unknown): action is ReceiptAuditAction {
    return typeof action === 'object' && action !== null && 'originalMessage' in action;
}

OnyxUpdateManager();

describe('actions/IOU/Receipt', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
            },
        });
        initOnyxDerivedValues();
    });

    beforeEach(() => {
        global.fetch = getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.mocked(global.fetch).mockClear();
    });

    describe('replaceReceipt', () => {
        const snapshotHash = 918273645;
        const source = 'test';
        const policyID = 'replaceReceiptPolicyID';

        let transactionID: string;
        const OLD_RECEIPT = {source: 'old.jpg', state: CONST.IOU.RECEIPT_STATE.OPEN, filename: 'old.jpg'};

        const createFile = () => {
            const file = new File([new Blob(['test'])], 'test.jpg', {type: 'image/jpeg'});
            file.source = 'test';
            return file;
        };

        const setupTransactionWithSnapshot = async (id: string, transactionData: Record<string, unknown> = {}) => {
            const transaction = {...createRandomTransaction(Number(id)), ...transactionData};
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`, {
                // @ts-expect-error: Allow partial record in snapshot update
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]: transaction,
                },
            });
            await waitForBatchedUpdates();
            return transaction;
        };

        const getUpdatedTransaction = async (id: string) => {
            return new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    callback: (transactions) => {
                        Onyx.disconnect(connection);
                        resolve(transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]);
                    },
                });
            });
        };

        const getSearchSnapshot = async (hash: number): Promise<OnyxEntry<SearchResults>> => {
            const snapshots = await getOnyxValue(ONYXKEYS.COLLECTION.SNAPSHOT);
            return snapshots?.[`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`];
        };

        let getCurrentSearchQueryJSONSpy: jest.SpyInstance;

        const mockApiWrite = () => {
            return jest.spyOn(API, 'write').mockImplementation(jest.fn());
        };

        beforeEach(() => {
            // Transaction IDs are converted to numbers by the test fixture. Keep this value
            // within JavaScript's safe integer range so the transaction data and its Onyx key
            // continue to refer to the same ID.
            transactionID = Date.now().toString();
            getCurrentSearchQueryJSONSpy = jest.spyOn(SearchQueryUtils, 'getCurrentSearchQueryJSON').mockReturnValue(createMock<SearchQueryJSON>({hash: snapshotHash}));
        });

        afterEach(() => {
            getCurrentSearchQueryJSONSpy.mockRestore();
        });

        it('should do nothing when file is undefined', async () => {
            // Given a transaction with an existing receipt
            const transaction = await setupTransactionWithSnapshot(transactionID, {receipt: {source: 'original.jpg'}});

            // When replaceReceipt is called without a file
            replaceReceipt({
                transaction,
                file: undefined,
                source,
                transactionPolicy: undefined,
                transactionPolicyTagList: undefined,
                transactionReport: undefined,
                isVendorMatchingBetaEnabled: false,
                delegateAccountID: undefined,
                currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                transactionThreadReport: undefined,
            });
            await waitForBatchedUpdates();

            // Then the receipt source remains unchanged
            const updatedTransaction = await getUpdatedTransaction(transactionID);
            expect(updatedTransaction?.receipt?.source).toBe('original.jpg');
        });

        it('should replace the receipt of the transaction', async () => {
            // Given a transaction with an existing receipt
            const transaction = await setupTransactionWithSnapshot(transactionID, {receipt: {source: 'test1'}});

            // When replaceReceipt is called with a new file
            replaceReceipt({
                transaction,
                file: createFile(),
                source,
                transactionPolicy: undefined,
                transactionPolicyTagList: undefined,
                transactionReport: undefined,
                isVendorMatchingBetaEnabled: false,
                delegateAccountID: undefined,
                currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                transactionThreadReport: undefined,
            });
            await waitForBatchedUpdates();

            // Then both the transaction and its snapshot entry reflect the new receipt
            const updatedTransaction = await getUpdatedTransaction(transactionID);
            expect(updatedTransaction?.receipt?.source).toBe(source);
            expect(updatedTransaction?.receipt?.state).toBe(CONST.IOU.RECEIPT_STATE.OPEN);

            const updatedSnapshot = await getSearchSnapshot(snapshotHash);
            expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.source).toBe(source);
            expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.state).toBe(CONST.IOU.RECEIPT_STATE.OPEN);
        });

        it('should preserve receipt state when state is provided', async () => {
            // Given a transaction with a receipt in SCAN_READY state
            const transaction = await setupTransactionWithSnapshot(transactionID, {receipt: {source: 'test1', state: CONST.IOU.RECEIPT_STATE.SCAN_READY}});

            // When replaceReceipt is called with the same state explicitly passed
            replaceReceipt({
                isVendorMatchingBetaEnabled: false,
                transaction,
                file: createFile(),
                source,
                state: CONST.IOU.RECEIPT_STATE.SCAN_READY,
                transactionPolicy: undefined,
                transactionPolicyTagList: undefined,
                transactionReport: undefined,
                delegateAccountID: undefined,
                currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                transactionThreadReport: undefined,
            });
            await waitForBatchedUpdates();

            // Then the new receipt retains the provided state instead of falling back to OPEN
            const updatedTransaction = await getUpdatedTransaction(transactionID);
            expect(updatedTransaction?.receipt?.source).toBe(source);
            expect(updatedTransaction?.receipt?.state).toBe(CONST.IOU.RECEIPT_STATE.SCAN_READY);

            const updatedSnapshot = await getSearchSnapshot(snapshotHash);
            expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.source).toBe(source);
            expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.state).toBe(CONST.IOU.RECEIPT_STATE.SCAN_READY);
        });

        it('should add receipt if it does not exist', async () => {
            // Given a transaction with no receipt
            const transaction = await setupTransactionWithSnapshot(transactionID, {receipt: null});

            // When replaceReceipt is called
            replaceReceipt({
                transaction,
                file: createFile(),
                source,
                transactionPolicy: undefined,
                transactionPolicyTagList: undefined,
                transactionReport: undefined,
                isVendorMatchingBetaEnabled: false,
                delegateAccountID: undefined,
                currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                transactionThreadReport: undefined,
            });
            await waitForBatchedUpdates();

            // Then the receipt is created with the new source on both the transaction and snapshot
            const updatedTransaction = await getUpdatedTransaction(transactionID);
            expect(updatedTransaction?.receipt?.source).toBe(source);

            await waitFor(async () => {
                const updatedSnapshot = await getSearchSnapshot(snapshotHash);
                expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.source).toBe(source);
            });
        });

        it('should optimistically set pending field for receipt', async () => {
            // Given a transaction with an existing receipt
            const writeSpy = mockApiWrite();
            const transaction = await setupTransactionWithSnapshot(transactionID, {receipt: OLD_RECEIPT});

            try {
                // When replaceReceipt is called
                replaceReceipt({
                    transaction,
                    file: createFile(),
                    source,
                    transactionPolicy: undefined,
                    transactionPolicyTagList: undefined,
                    transactionReport: undefined,
                    isVendorMatchingBetaEnabled: false,
                    delegateAccountID: undefined,
                    currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                    transactionThreadReport: undefined,
                });
                await waitForBatchedUpdates();

                // Then the optimisticData marks the receipt field as pending UPDATE
                const [, , onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
                const transactionOptimistic = getRequiredOnyxUpdate(onyxData, 'optimisticData', `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, Onyx.METHOD.MERGE, true);
                expect(transactionOptimistic.value).toEqual(
                    expect.objectContaining({
                        receipt: expect.objectContaining({source, state: CONST.IOU.RECEIPT_STATE.OPEN}),
                        pendingFields: {receipt: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    }),
                );
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should call API.write with REPLACE_RECEIPT command and correct params', async () => {
            // Given a transaction with an existing receipt
            const writeSpy = mockApiWrite();
            const transaction = await setupTransactionWithSnapshot(transactionID, {receipt: OLD_RECEIPT});

            try {
                // When replaceReceipt is called
                replaceReceipt({
                    transaction,
                    file: createFile(),
                    source,
                    transactionPolicy: undefined,
                    transactionPolicyTagList: undefined,
                    transactionReport: undefined,
                    isVendorMatchingBetaEnabled: false,
                    delegateAccountID: undefined,
                    currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                    transactionThreadReport: undefined,
                });
                await waitForBatchedUpdates();

                // Then API.write is invoked with the REPLACE_RECEIPT command and the correct transactionID
                expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.REPLACE_RECEIPT, expect.objectContaining({transactionID}), expect.anything());
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should compute violations when policy is paid group', async () => {
            // Given a transaction and expense report linked to a paid group policy with tag definitions
            const reportID = 'replaceReceiptReportID';
            const policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                id: policyID,
            };
            const policyTagList = createRandomPolicyTags('Department', 3);
            const transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID,
                receipt: OLD_RECEIPT,
            };
            const report = {
                ...createRandomReport(1, undefined),
                reportID,
                policyID,
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, policyTagList);
            await waitForBatchedUpdates();

            // When replaceReceipt is called with the paid group policy
            replaceReceipt({
                transaction,
                file: createFile(),
                source,
                transactionPolicy: policy,
                transactionPolicyTagList: undefined,
                transactionReport: undefined,
                isVendorMatchingBetaEnabled: false,
                delegateAccountID: undefined,
                currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                transactionThreadReport: undefined,
            });
            await waitForBatchedUpdates();

            // Then transaction violations are computed and stored
            const violations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            expect(violations).toBeDefined();
            expect(Array.isArray(violations)).toBe(true);
        });

        it('should rollback to the previous receipt in failure data', async () => {
            // Given a transaction with OLD_RECEIPT
            const writeSpy = mockApiWrite();
            const transaction = await setupTransactionWithSnapshot(transactionID, {receipt: OLD_RECEIPT});

            try {
                // When replaceReceipt is called
                replaceReceipt({
                    transaction,
                    file: createFile(),
                    source,
                    transactionPolicy: undefined,
                    transactionPolicyTagList: undefined,
                    transactionReport: undefined,
                    isVendorMatchingBetaEnabled: false,
                    delegateAccountID: undefined,
                    currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                    transactionThreadReport: undefined,
                });
                await waitForBatchedUpdates();

                // Then the failureData restores the original receipt, clears pendingFields, and attaches errors
                const [, , onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
                const transactionFailure = getRequiredOnyxUpdate(onyxData, 'failureData', `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, Onyx.METHOD.MERGE, true);
                expect(transactionFailure.value).toEqual(
                    expect.objectContaining({
                        receipt: OLD_RECEIPT,
                        pendingFields: {receipt: null},
                    }),
                );
                expect(transactionFailure.value.errors).toBeDefined();
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should rollback the receipt to null in failure data when there was no previous receipt', async () => {
            // Given a transaction with no receipt
            const writeSpy = mockApiWrite();
            const transaction = await setupTransactionWithSnapshot(transactionID, {receipt: null});

            try {
                // When replaceReceipt is called
                replaceReceipt({
                    transaction,
                    file: createFile(),
                    source,
                    transactionPolicy: undefined,
                    transactionPolicyTagList: undefined,
                    transactionReport: undefined,
                    isVendorMatchingBetaEnabled: false,
                    delegateAccountID: undefined,
                    currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                    transactionThreadReport: undefined,
                });
                await waitForBatchedUpdates();

                // Then the failureData sets receipt to null since there was nothing to restore
                const [, , onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
                const transactionFailure = getRequiredOnyxUpdate(onyxData, 'failureData', `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, Onyx.METHOD.MERGE, true);
                expect(transactionFailure.value).toEqual(
                    expect.objectContaining({
                        receipt: null,
                        pendingFields: {receipt: null},
                    }),
                );
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should clear pending fields in success data', async () => {
            // Given a transaction with an existing receipt
            const writeSpy = mockApiWrite();
            const transaction = await setupTransactionWithSnapshot(transactionID, {receipt: OLD_RECEIPT});

            try {
                // When replaceReceipt is called
                replaceReceipt({
                    transaction,
                    file: createFile(),
                    source,
                    transactionPolicy: undefined,
                    transactionPolicyTagList: undefined,
                    transactionReport: undefined,
                    isVendorMatchingBetaEnabled: false,
                    delegateAccountID: undefined,
                    currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                    transactionThreadReport: undefined,
                });
                await waitForBatchedUpdates();

                // Then the successData clears the pending field for the receipt
                const [, , onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
                const transactionSuccess = getRequiredOnyxUpdate(onyxData, 'successData', `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, Onyx.METHOD.MERGE, true);
                expect(transactionSuccess.value).toEqual({
                    pendingFields: {receipt: null},
                });
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should not include snapshot updates when there is no current search query hash', async () => {
            // Given there is no active search query hash
            getCurrentSearchQueryJSONSpy.mockReturnValueOnce(null);
            const writeSpy = mockApiWrite();
            const transaction = await setupTransactionWithSnapshot(transactionID, {receipt: OLD_RECEIPT});

            try {
                // When replaceReceipt is called
                replaceReceipt({
                    transaction,
                    file: createFile(),
                    source,
                    transactionPolicy: undefined,
                    transactionPolicyTagList: undefined,
                    transactionReport: undefined,
                    isVendorMatchingBetaEnabled: false,
                    delegateAccountID: undefined,
                    currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                    transactionThreadReport: undefined,
                });
                await waitForBatchedUpdates();

                // Then no snapshot updates are included in either optimisticData or failureData
                const [, , onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
                expect(getRequiredOnyxUpdates(onyxData, 'optimisticData')).not.toEqual(
                    expect.arrayContaining([expect.objectContaining({key: expect.stringMatching(new RegExp(`^${ONYXKEYS.COLLECTION.SNAPSHOT}`))})]),
                );
                expect(getRequiredOnyxUpdates(onyxData, 'failureData')).not.toEqual(
                    expect.arrayContaining([expect.objectContaining({key: expect.stringMatching(new RegExp(`^${ONYXKEYS.COLLECTION.SNAPSHOT}`))})]),
                );
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should rollback the snapshot receipt in failure data when a search query hash exists', async () => {
            // Given a transaction with OLD_RECEIPT and an active search snapshot
            const writeSpy = mockApiWrite();
            const transaction = await setupTransactionWithSnapshot(transactionID, {receipt: OLD_RECEIPT});

            try {
                // When replaceReceipt is called
                replaceReceipt({
                    transaction,
                    file: createFile(),
                    source,
                    transactionPolicy: undefined,
                    transactionPolicyTagList: undefined,
                    transactionReport: undefined,
                    isVendorMatchingBetaEnabled: false,
                    delegateAccountID: undefined,
                    currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                    transactionThreadReport: undefined,
                });
                await waitForBatchedUpdates();

                // Then the failureData restores the original receipt inside the snapshot entry
                const [, , onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
                const snapshotFailure = getRequiredOnyxUpdate(onyxData, 'failureData', `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`, Onyx.METHOD.MERGE, true);
                expect(snapshotFailure.value).toEqual(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: expect.objectContaining({receipt: OLD_RECEIPT}),
                        }),
                    }),
                );
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should forward isSameReceipt and receiptState to API parameters', async () => {
            // Given a transaction with an existing receipt
            const writeSpy = mockApiWrite();
            const transaction = await setupTransactionWithSnapshot(transactionID, {receipt: OLD_RECEIPT});

            try {
                // When replaceReceipt is called with isSameReceipt=true and a specific receipt state
                replaceReceipt({
                    isVendorMatchingBetaEnabled: false,
                    transaction,
                    file: createFile(),
                    source,
                    state: CONST.IOU.RECEIPT_STATE.SCAN_READY,
                    transactionPolicy: undefined,
                    transactionPolicyTagList: undefined,
                    transactionReport: undefined,
                    isSameReceipt: true,
                    delegateAccountID: undefined,
                    currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                    transactionThreadReport: undefined,
                });
                await waitForBatchedUpdates();

                // Then API.write receives those parameters verbatim
                expect(writeSpy).toHaveBeenCalledWith(
                    WRITE_COMMANDS.REPLACE_RECEIPT,
                    expect.objectContaining({
                        transactionID,
                        receiptState: CONST.IOU.RECEIPT_STATE.SCAN_READY,
                        isSameReceipt: true,
                        receipt: expect.any(Object),
                    }),
                    expect.anything(),
                );
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should rollback transaction violations in failure data when policy is paid group', async () => {
            // Given a transaction with existing violations linked to a paid group policy
            const reportID = 'replaceReceiptViolationsRollbackReportID';
            const policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                id: policyID,
            };
            const existingViolations = [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}];
            const transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID,
                receipt: OLD_RECEIPT,
            };
            const report = {
                ...createRandomReport(1, undefined),
                reportID,
                policyID,
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, existingViolations);
            await waitForBatchedUpdates();

            // When replaceReceipt is called with the paid group policy
            const writeSpy = mockApiWrite();
            try {
                replaceReceipt({
                    isVendorMatchingBetaEnabled: false,
                    transaction,
                    file: createFile(),
                    source,
                    transactionPolicy: policy,
                    transactionPolicyTagList: undefined,
                    transactionReport: undefined,
                    transactionViolations: existingViolations,
                    delegateAccountID: undefined,
                    currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                    transactionThreadReport: undefined,
                });
                await waitForBatchedUpdates();

                // Then the failureData restores the original violations
                const [, , onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
                const violationsFailure = getRequiredOnyxUpdate(onyxData, 'failureData', `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, Onyx.METHOD.MERGE);
                expect(violationsFailure.value).toEqual(existingViolations);
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should post an optimistic "added a receipt" action to the existing transaction thread', async () => {
            // Given an expense whose IOU action already has a transaction thread, replaced by a copilot
            const expenseReportID = 'replaceReceiptThreadExpenseReportID';
            const threadReportID = 'replaceReceiptThreadReportID';
            const previousThreadTime = '2024-01-01 00:00:00';
            const delegateAccountID = 99;
            const transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: expenseReportID,
                receipt: {},
            };

            const threadReport = {
                ...createRandomReport(2, undefined),
                reportID: threadReportID,
                lastVisibleActionCreated: previousThreadTime,
                lastReadTime: previousThreadTime,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`, threadReport);
            await waitForBatchedUpdates();

            const writeSpy = mockApiWrite();
            try {
                // When the receipt is replaced with a different one
                replaceReceipt({
                    isVendorMatchingBetaEnabled: false,
                    transaction,
                    file: createFile(),
                    source,
                    transactionPolicy: undefined,
                    transactionPolicyTagList: undefined,
                    transactionReport: undefined,
                    delegateAccountID,
                    currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                    transactionThreadReport: threadReport,
                });
                await waitForBatchedUpdates();

                // Then the thread timestamps move to the new action so it is treated as the newest one
                const [, , onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
                const threadReportUpdate = getRequiredOnyxUpdate(onyxData, 'optimisticData', `${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`, Onyx.METHOD.MERGE, true);
                const {lastVisibleActionCreated, lastReadTime} = threadReportUpdate.value;
                expect(lastVisibleActionCreated).not.toBe(previousThreadTime);
                expect(lastReadTime).toBe(lastVisibleActionCreated);

                // And the thread receives the action, attributed to the copilot so the actor does not change once the server responds
                const threadActionsUpdate = getRequiredOnyxUpdate(onyxData, 'optimisticData', `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`, Onyx.METHOD.MERGE, true);
                const optimisticAction = Object.values(threadActionsUpdate.value).at(0);
                expect(optimisticAction).toEqual(
                    expect.objectContaining({
                        actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                        delegateAccountID,
                        created: lastVisibleActionCreated,
                        originalMessage: expect.objectContaining({receiptAdded: true}),
                    }),
                );

                // The expense held no receipt, so there is nothing to audit as removed
                expect(Object.values(threadActionsUpdate.value)).toHaveLength(1);

                // And a failed upload restores the timestamps the thread had before
                const threadReportFailure = getRequiredOnyxUpdate(onyxData, 'failureData', `${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`, Onyx.METHOD.MERGE, true);
                expect(threadReportFailure.value).toEqual({
                    lastVisibleActionCreated: previousThreadTime,
                    lastReadTime: previousThreadTime,
                });
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should audit a swap as a removal followed by an addition', async () => {
            // Given an expense whose receipt is already stored server-side, so it has a receiptID
            const expenseReportID = 'replaceReceiptReplacementExpenseReportID';
            const threadReportID = 'replaceReceiptReplacementThreadReportID';
            const transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: expenseReportID,
                receipt: {...OLD_RECEIPT, receiptID: 1234},
            };

            const threadReport = {
                ...createRandomReport(2, undefined),
                reportID: threadReportID,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`, threadReport);
            await waitForBatchedUpdates();

            const writeSpy = mockApiWrite();
            try {
                // When the receipt is replaced with a different one
                replaceReceipt({
                    isVendorMatchingBetaEnabled: false,
                    transaction,
                    file: createFile(),
                    source,
                    transactionPolicy: undefined,
                    transactionPolicyTagList: undefined,
                    transactionReport: undefined,
                    delegateAccountID: undefined,
                    currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                    transactionThreadReport: threadReport,
                });
                await waitForBatchedUpdates();

                // Then the thread gets both messages, so the swap reads the same as removing and re-adding by hand
                const [, parameters, onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
                const threadActionsUpdate = getRequiredOnyxUpdate(onyxData, 'optimisticData', `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`, Onyx.METHOD.MERGE, true);
                const auditActions = Object.values(threadActionsUpdate.value).filter(isReceiptAuditAction);
                expect(auditActions).toHaveLength(2);

                const removedAction = auditActions.find((action) => !!action.originalMessage.receiptRemoved);
                const addedAction = auditActions.find((action) => !!action.originalMessage.receiptAdded);
                expect(removedAction).toBeDefined();
                expect(addedAction).toBeDefined();

                // And the removal is stamped earlier, because the two are built in the same millisecond and
                // would otherwise sort on their random reportActionIDs
                expect(removedAction?.created.localeCompare(addedAction?.created ?? '')).toBeLessThan(0);

                // And both IDs reach the server so the actions it writes reconcile with these
                expect(parameters).toEqual(
                    expect.objectContaining({
                        reportActionID: addedAction?.reportActionID,
                        receiptRemovedReportActionID: removedAction?.reportActionID,
                    }),
                );
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should audit a swap of a receipt that was added offline and has no receiptID yet', async () => {
            // Given a receipt that exists only on this device, with a file but no receipt ID yet
            const expenseReportID = 'replaceReceiptOfflineExpenseReportID';
            const threadReportID = 'replaceReceiptOfflineThreadReportID';
            const transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: expenseReportID,
                receipt: OLD_RECEIPT,
            };

            const threadReport = {
                ...createRandomReport(2, undefined),
                reportID: threadReportID,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`, threadReport);
            await waitForBatchedUpdates();

            const writeSpy = mockApiWrite();
            try {
                // When that receipt is replaced before it has been stored server-side
                replaceReceipt({
                    isVendorMatchingBetaEnabled: false,
                    transaction,
                    file: createFile(),
                    source,
                    transactionPolicy: undefined,
                    transactionPolicyTagList: undefined,
                    transactionReport: undefined,
                    delegateAccountID: undefined,
                    currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                    transactionThreadReport: threadReport,
                });
                await waitForBatchedUpdates();

                // Then "removed a receipt" shows right away, and its ID is sent so the server message matches it
                const [, parameters, onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
                const threadActionsUpdate = getRequiredOnyxUpdate(onyxData, 'optimisticData', `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`, Onyx.METHOD.MERGE, true);
                const auditActions = Object.values(threadActionsUpdate.value).filter(isReceiptAuditAction);
                expect(auditActions).toHaveLength(2);

                const removedAction = auditActions.find((action) => !!action.originalMessage.receiptRemoved);
                const addedAction = auditActions.find((action) => !!action.originalMessage.receiptAdded);
                expect(removedAction).toBeDefined();
                expect(addedAction).toBeDefined();
                expect(parameters).toEqual(
                    expect.objectContaining({
                        reportActionID: addedAction?.reportActionID,
                        receiptRemovedReportActionID: removedAction?.reportActionID,
                    }),
                );
            } finally {
                writeSpy.mockRestore();
            }
        });
    });

    describe('detachReceipt', () => {
        const transactionID = '1';
        const reportID = '2';
        const policyID = '3';
        const tagListName = 'Department';

        const policy = {
            ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
            id: policyID,
        };

        const policyTagList = createRandomPolicyTags(tagListName, 3);

        const transaction = {
            ...createRandomTransaction(1),
            transactionID,
            reportID,
            receipt: {source: 'receipt-url.jpg'},
            merchant: 'Test Merchant',
        };

        const report = {
            ...createRandomReport(1, undefined),
            reportID,
            policyID,
            type: CONST.REPORT.TYPE.EXPENSE,
            lastVisibleActionCreated: '2024-01-01 00:00:00',
            lastReadTime: '2024-01-01 00:00:00',
        };

        const threadReportID = 'detachReceiptThreadReportID';
        const previousThreadTime = '2024-01-01 00:00:00';
        const threadReport = {
            ...createRandomReport(2, undefined),
            reportID: threadReportID,
            lastVisibleActionCreated: previousThreadTime,
            lastReadTime: previousThreadTime,
        };

        const baseParams = {
            transaction,
            transactionPolicy: undefined,
            transactionPolicyTagList: undefined,
            transactionViolations: undefined,
            transactionReport: undefined,
            isVendorMatchingBetaEnabled: false,
            transactionThreadReport: undefined,
            delegateAccountID: undefined,
            currentUserPersonalDetails: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
        };

        const seedOnyx = async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`, threadReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, policyTagList);
            await waitForBatchedUpdates();
        };

        it('should do nothing when transactionID is undefined', async () => {
            const transactionsBefore = await getOnyxValue(ONYXKEYS.COLLECTION.TRANSACTION);

            detachReceipt({...baseParams, transaction: undefined});
            await waitForBatchedUpdates();

            const transactionsAfter = await getOnyxValue(ONYXKEYS.COLLECTION.TRANSACTION);
            expect(transactionsAfter).toEqual(transactionsBefore);
        });

        it('should optimistically null the receipt and set pending field', async () => {
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());
            await seedOnyx();

            try {
                detachReceipt(baseParams);
                await waitForBatchedUpdates();

                const [, , onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
                const transactionOptimistic = getRequiredOnyxUpdate(onyxData, 'optimisticData', `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, Onyx.METHOD.MERGE, true);
                expect(transactionOptimistic.value).toEqual(
                    expect.objectContaining({
                        receipt: null,
                        pendingFields: {receipt: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    }),
                );
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should audit the removal on the transaction thread', async () => {
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());
            await seedOnyx();

            try {
                // When a receipt is removed from an expense that already has a thread
                detachReceipt({...baseParams, transactionReport: report, transactionThreadReport: threadReport});
                await waitForBatchedUpdates();

                // Then the message lands on the thread next to "added a receipt", rather than on the expense
                // report, where the backend only records it for a manager or a submitted report
                const [, parameters, onyxData] = getRequiredWriteCall(writeSpy.mock.calls, 0);
                const threadActionsUpdate = getRequiredOnyxUpdate(onyxData, 'optimisticData', `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`, Onyx.METHOD.MERGE, true);
                const optimisticAction = Object.values(threadActionsUpdate.value).find(isReceiptAuditAction);
                expect(optimisticAction).toEqual(
                    expect.objectContaining({
                        actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                        originalMessage: expect.objectContaining({receiptRemoved: true}),
                    }),
                );

                // And its ID reaches the server so the action it writes reconciles with this one
                expect(parameters).toEqual(expect.objectContaining({receiptRemovedReportActionID: optimisticAction?.reportActionID}));

                // And the thread timestamps move to it, then roll back if the request fails
                const threadReportUpdate = getRequiredOnyxUpdate(onyxData, 'optimisticData', `${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`, Onyx.METHOD.MERGE, true);
                expect(threadReportUpdate.value.lastVisibleActionCreated).toBe(optimisticAction?.created);

                const threadReportFailure = getRequiredOnyxUpdate(onyxData, 'failureData', `${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`, Onyx.METHOD.MERGE, true);
                expect(threadReportFailure.value).toEqual({
                    lastVisibleActionCreated: previousThreadTime,
                    lastReadTime: previousThreadTime,
                });
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should leave the expense report untouched, since the backend may not record the removal there', async () => {
            await seedOnyx();

            // When a receipt is removed
            detachReceipt({...baseParams, transactionReport: report, transactionThreadReport: threadReport});
            await waitForBatchedUpdates();

            // Then nothing is shown optimistically on the expense report, because whether the backend writes
            // its MANAGER_DETACH_RECEIPT action depends on who is acting and whether the report was submitted
            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
            expect(Object.values(reportActions ?? {})).toHaveLength(0);

            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
            expect(updatedReport?.lastVisibleActionCreated).toBe('2024-01-01 00:00:00');
        });

        it('should call API.write with DETACH_RECEIPT command and correct params', async () => {
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());
            await seedOnyx();

            try {
                detachReceipt(baseParams);
                await waitForBatchedUpdates();

                expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.DETACH_RECEIPT, expect.objectContaining({transactionID}), expect.anything());
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should compute violations when policy is paid group', async () => {
            await seedOnyx();

            detachReceipt({...baseParams, transactionPolicy: policy, transactionPolicyTagList: policyTagList});
            await waitForBatchedUpdates();

            const violations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            expect(violations).toBeDefined();
            expect(Array.isArray(violations)).toBe(true);
        });
    });

    describe('setMoneyRequestReceipt', () => {
        it('should clear the previous receipt page count when a new receipt is set', async () => {
            // Given a draft transaction whose current receipt has a server-provided page count
            const transactionID = 'setReceiptTransactionID';
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
                ...createRandomTransaction(1),
                transactionID,
                receipt: {source: 'old-receipt.pdf', filename: 'old-receipt.pdf', pageCount: 3},
            });
            await waitForBatchedUpdates();

            // When the receipt is replaced with a different file
            setMoneyRequestReceipt(transactionID, 'new-receipt.pdf', 'new-receipt.pdf', true, 'application/pdf');
            await waitForBatchedUpdates();

            // Then the old page count is dropped because it described the previous file, not the new one
            const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
            expect(transaction?.receipt?.source).toBe('new-receipt.pdf');
            expect(transaction?.receipt?.pageCount).toBeUndefined();
        });
    });
});
