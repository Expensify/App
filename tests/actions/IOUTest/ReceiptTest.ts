/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {OnyxEntry, OnyxKey} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
import {detachReceipt, replaceReceipt} from '@libs/actions/IOU/Receipt';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {WRITE_COMMANDS} from '@libs/API/types';
import {rand64} from '@libs/NumberUtils';
import type * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as API from '@src/libs/API';
import * as SearchQueryUtils from '@src/libs/SearchQueryUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, SearchResults} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import createRandomPolicy from '../../utils/collections/policies';
import createRandomPolicyTags from '../../utils/collections/policyTags';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import type {MockFetch} from '../../utils/TestHelper';
import {getGlobalFetchMock} from '../../utils/TestHelper';
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

jest.mock('@src/libs/actions/Report', () => {
    const originalModule = jest.requireActual('@src/libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...originalModule,
        notifyNewAction: jest.fn(),
    };
});

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
    isPolicyOwner: jest.fn().mockImplementation((policy?: OnyxEntry<Policy>, currentUserAccountID?: number) => !!currentUserAccountID && policy?.ownerAccountID === currentUserAccountID),
}));

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

OnyxUpdateManager();

describe('actions/IOU/Receipt', () => {
    let mockFetch: MockFetch;

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
        mockFetch = fetch as MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        mockFetch?.mockClear();
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
            const transaction = {transactionID: id, ...transactionData};
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`, {
                // @ts-expect-error: Allow partial record in snapshot update
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]: transaction,
                },
            });
            await waitForBatchedUpdates();
        };

        const getUpdatedTransaction = async (id: string) => {
            return new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (transactions) => {
                        Onyx.disconnect(connection);
                        resolve(transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]);
                    },
                });
            });
        };

        let getCurrentSearchQueryJSONSpy: jest.SpyInstance;

        const mockApiWrite = () => {
            return jest.spyOn(API, 'write').mockImplementation(jest.fn());
        };

        type OnyxUpdateEntry = {onyxMethod?: string; key: string; value: Record<string, unknown>};
        type OnyxDataArg = {optimisticData?: OnyxUpdateEntry[]; successData?: OnyxUpdateEntry[]; failureData?: OnyxUpdateEntry[]};

        const getOnyxDataFromWriteSpy = (writeSpy: jest.SpyInstance): OnyxDataArg | undefined => {
            const firstCall = writeSpy.mock.calls.at(0) as unknown[] | undefined;
            return firstCall?.at(2) as OnyxDataArg | undefined;
        };

        beforeEach(() => {
            transactionID = rand64().toString();
            getCurrentSearchQueryJSONSpy = jest.spyOn(SearchQueryUtils, 'getCurrentSearchQueryJSON').mockReturnValue({hash: snapshotHash} as SearchQueryJSON);
        });

        afterEach(() => {
            getCurrentSearchQueryJSONSpy.mockRestore();
        });

        it('should do nothing when file is undefined', async () => {
            // Given a transaction with an existing receipt
            await setupTransactionWithSnapshot(transactionID, {receipt: {source: 'original.jpg'}});

            // When replaceReceipt is called without a file
            replaceReceipt({transactionID, file: undefined, source, transactionPolicy: undefined, transactionPolicyTagList: undefined});
            await waitForBatchedUpdates();

            // Then the receipt source remains unchanged
            const updatedTransaction = await getUpdatedTransaction(transactionID);
            expect(updatedTransaction?.receipt?.source).toBe('original.jpg');
        });

        it('should replace the receipt of the transaction', async () => {
            // Given a transaction with an existing receipt
            await setupTransactionWithSnapshot(transactionID, {receipt: {source: 'test1'}});

            // When replaceReceipt is called with a new file
            replaceReceipt({transactionID, file: createFile(), source, transactionPolicy: undefined, transactionPolicyTagList: undefined});
            await waitForBatchedUpdates();

            // Then both the transaction and its snapshot entry reflect the new receipt
            const updatedTransaction = await getUpdatedTransaction(transactionID);
            expect(updatedTransaction?.receipt?.source).toBe(source);
            expect(updatedTransaction?.receipt?.state).toBe(CONST.IOU.RECEIPT_STATE.OPEN);

            const updatedSnapshot = (await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}` as OnyxKey)) as OnyxEntry<SearchResults>;
            expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.source).toBe(source);
            expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.state).toBe(CONST.IOU.RECEIPT_STATE.OPEN);
        });

        it('should preserve receipt state when state is provided', async () => {
            // Given a transaction with a receipt in SCAN_READY state
            await setupTransactionWithSnapshot(transactionID, {receipt: {source: 'test1', state: CONST.IOU.RECEIPT_STATE.SCAN_READY}});

            // When replaceReceipt is called with the same state explicitly passed
            replaceReceipt({transactionID, file: createFile(), source, state: CONST.IOU.RECEIPT_STATE.SCAN_READY, transactionPolicy: undefined, transactionPolicyTagList: undefined});
            await waitForBatchedUpdates();

            // Then the new receipt retains the provided state instead of falling back to OPEN
            const updatedTransaction = await getUpdatedTransaction(transactionID);
            expect(updatedTransaction?.receipt?.source).toBe(source);
            expect(updatedTransaction?.receipt?.state).toBe(CONST.IOU.RECEIPT_STATE.SCAN_READY);

            const updatedSnapshot = (await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}` as OnyxKey)) as OnyxEntry<SearchResults>;
            expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.source).toBe(source);
            expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.state).toBe(CONST.IOU.RECEIPT_STATE.SCAN_READY);
        });

        it('should add receipt if it does not exist', async () => {
            // Given a transaction with no receipt
            await setupTransactionWithSnapshot(transactionID);

            // When replaceReceipt is called
            replaceReceipt({transactionID, file: createFile(), source, transactionPolicy: undefined, transactionPolicyTagList: undefined});
            await waitForBatchedUpdates();

            // Then the receipt is created with the new source on both the transaction and snapshot
            const updatedTransaction = await getUpdatedTransaction(transactionID);
            expect(updatedTransaction?.receipt?.source).toBe(source);

            await waitFor(async () => {
                const updatedSnapshot = (await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}` as OnyxKey)) as OnyxEntry<SearchResults>;
                expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.source).toBe(source);
            });
        });

        it('should optimistically set pending field for receipt', async () => {
            // Given a transaction with an existing receipt
            const writeSpy = mockApiWrite();
            await setupTransactionWithSnapshot(transactionID, {receipt: OLD_RECEIPT});

            try {
                // When replaceReceipt is called
                replaceReceipt({transactionID, file: createFile(), source, transactionPolicy: undefined, transactionPolicyTagList: undefined});
                await waitForBatchedUpdates();

                // Then the optimisticData marks the receipt field as pending UPDATE
                const onyxData = getOnyxDataFromWriteSpy(writeSpy);
                const transactionOptimistic = onyxData?.optimisticData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
                expect(transactionOptimistic?.value).toEqual(
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
            await setupTransactionWithSnapshot(transactionID, {receipt: OLD_RECEIPT});

            try {
                // When replaceReceipt is called
                replaceReceipt({transactionID, file: createFile(), source, transactionPolicy: undefined, transactionPolicyTagList: undefined});
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
            replaceReceipt({transactionID, file: createFile(), source, transactionPolicy: policy, transactionPolicyTagList: undefined});
            await waitForBatchedUpdates();

            // Then transaction violations are computed and stored
            const violations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            expect(violations).toBeDefined();
            expect(Array.isArray(violations)).toBe(true);
        });

        it('should rollback to the previous receipt in failure data', async () => {
            // Given a transaction with OLD_RECEIPT
            const writeSpy = mockApiWrite();
            await setupTransactionWithSnapshot(transactionID, {receipt: OLD_RECEIPT});

            try {
                // When replaceReceipt is called
                replaceReceipt({transactionID, file: createFile(), source, transactionPolicy: undefined, transactionPolicyTagList: undefined});
                await waitForBatchedUpdates();

                // Then the failureData restores the original receipt, clears pendingFields, and attaches errors
                const onyxData = getOnyxDataFromWriteSpy(writeSpy);
                const transactionFailure = onyxData?.failureData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
                expect(transactionFailure?.value).toEqual(
                    expect.objectContaining({
                        receipt: OLD_RECEIPT,
                        pendingFields: {receipt: null},
                    }),
                );
                expect(transactionFailure?.value?.errors).toBeDefined();
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should rollback the receipt to null in failure data when there was no previous receipt', async () => {
            // Given a transaction with no receipt
            const writeSpy = mockApiWrite();
            await setupTransactionWithSnapshot(transactionID);

            try {
                // When replaceReceipt is called
                replaceReceipt({transactionID, file: createFile(), source, transactionPolicy: undefined, transactionPolicyTagList: undefined});
                await waitForBatchedUpdates();

                // Then the failureData sets receipt to null since there was nothing to restore
                const onyxData = getOnyxDataFromWriteSpy(writeSpy);
                const transactionFailure = onyxData?.failureData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
                expect(transactionFailure?.value).toEqual(
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
            await setupTransactionWithSnapshot(transactionID, {receipt: OLD_RECEIPT});

            try {
                // When replaceReceipt is called
                replaceReceipt({transactionID, file: createFile(), source, transactionPolicy: undefined, transactionPolicyTagList: undefined});
                await waitForBatchedUpdates();

                // Then the successData clears the pending field for the receipt
                const onyxData = getOnyxDataFromWriteSpy(writeSpy);
                const transactionSuccess = onyxData?.successData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
                expect(transactionSuccess?.value).toEqual({
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
            await setupTransactionWithSnapshot(transactionID, {receipt: OLD_RECEIPT});

            try {
                // When replaceReceipt is called
                replaceReceipt({transactionID, file: createFile(), source, transactionPolicy: undefined, transactionPolicyTagList: undefined});
                await waitForBatchedUpdates();

                // Then no snapshot updates are included in either optimisticData or failureData
                const onyxData = getOnyxDataFromWriteSpy(writeSpy);
                const hasSnapshotOptimistic = onyxData?.optimisticData?.some((update) => update.key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT));
                const hasSnapshotFailure = onyxData?.failureData?.some((update) => update.key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT));
                expect(hasSnapshotOptimistic).toBe(false);
                expect(hasSnapshotFailure).toBe(false);
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should rollback the snapshot receipt in failure data when a search query hash exists', async () => {
            // Given a transaction with OLD_RECEIPT and an active search snapshot
            const writeSpy = mockApiWrite();
            await setupTransactionWithSnapshot(transactionID, {receipt: OLD_RECEIPT});

            try {
                // When replaceReceipt is called
                replaceReceipt({transactionID, file: createFile(), source, transactionPolicy: undefined, transactionPolicyTagList: undefined});
                await waitForBatchedUpdates();

                // Then the failureData restores the original receipt inside the snapshot entry
                const onyxData = getOnyxDataFromWriteSpy(writeSpy);
                const snapshotFailure = onyxData?.failureData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`);
                const snapshotData = snapshotFailure?.value?.data as Record<string, {receipt?: unknown}> | undefined;
                expect(snapshotData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt).toEqual(OLD_RECEIPT);
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should forward isSameReceipt and receiptState to API parameters', async () => {
            // Given a transaction with an existing receipt
            const writeSpy = mockApiWrite();
            await setupTransactionWithSnapshot(transactionID, {receipt: OLD_RECEIPT});

            try {
                // When replaceReceipt is called with isSameReceipt=true and a specific receipt state
                replaceReceipt({
                    transactionID,
                    file: createFile(),
                    source,
                    state: CONST.IOU.RECEIPT_STATE.SCAN_READY,
                    transactionPolicy: undefined,
                    transactionPolicyTagList: undefined,
                    isSameReceipt: true,
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
                replaceReceipt({transactionID, file: createFile(), source, transactionPolicy: policy, transactionPolicyTagList: undefined});
                await waitForBatchedUpdates();

                // Then the failureData restores the original violations
                const onyxData = getOnyxDataFromWriteSpy(writeSpy);
                const violationsFailure = onyxData?.failureData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
                expect(violationsFailure?.value).toEqual(existingViolations);
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

        const seedOnyx = async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, policyTagList);
            await waitForBatchedUpdates();
        };

        it('should do nothing when transactionID is undefined', async () => {
            const transactionsBefore = await getOnyxValue(ONYXKEYS.COLLECTION.TRANSACTION);

            detachReceipt(undefined, undefined, undefined, undefined);
            await waitForBatchedUpdates();

            const transactionsAfter = await getOnyxValue(ONYXKEYS.COLLECTION.TRANSACTION);
            expect(transactionsAfter).toEqual(transactionsBefore);
        });

        it('should optimistically null the receipt and set pending field', async () => {
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());
            await seedOnyx();

            try {
                detachReceipt(transactionID, undefined, undefined, undefined);
                await waitForBatchedUpdates();

                const onyxData = writeSpy.mock.calls.at(0)?.at(2) as {optimisticData?: Array<{key: string; value: unknown}>};
                const transactionOptimistic = onyxData?.optimisticData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
                expect(transactionOptimistic?.value).toEqual(
                    expect.objectContaining({
                        receipt: null,
                        pendingFields: {receipt: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    }),
                );
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should create an optimistic report action and update report timestamps', async () => {
            await seedOnyx();

            detachReceipt(transactionID, undefined, undefined, undefined);
            await waitForBatchedUpdates();

            // Then a new report action should be created on the report
            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
            const actions = Object.values(reportActions ?? {});
            expect(actions.length).toBeGreaterThan(0);

            // And the report timestamps should be updated
            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
            expect(updatedReport?.lastVisibleActionCreated).not.toBe('2024-01-01 00:00:00');
        });

        it('should call API.write with DETACH_RECEIPT command and correct params', async () => {
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());
            await seedOnyx();

            try {
                detachReceipt(transactionID, undefined, undefined, undefined);
                await waitForBatchedUpdates();

                expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.DETACH_RECEIPT, expect.objectContaining({transactionID}), expect.anything(), expect.anything());
            } finally {
                writeSpy.mockRestore();
            }
        });

        it('should compute violations when policy is paid group', async () => {
            await seedOnyx();

            detachReceipt(transactionID, policy, policyTagList, undefined);
            await waitForBatchedUpdates();

            const violations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            expect(violations).toBeDefined();
            expect(Array.isArray(violations)).toBe(true);
        });
    });
});
