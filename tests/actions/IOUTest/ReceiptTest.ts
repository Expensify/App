/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Onyx from 'react-native-onyx';
import type {OnyxEntry, OnyxKey} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
import {detachReceipt, replaceReceipt} from '@libs/actions/IOU/Receipt';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {WRITE_COMMANDS} from '@libs/API/types';
import {rand64} from '@libs/NumberUtils';
// eslint-disable-next-line no-restricted-syntax
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
        it('should replace the receipt of the transaction', async () => {
            const transactionID = rand64().toString();
            const snapshotHash = 918273645;
            const file = new File([new Blob(['test'])], 'test.jpg', {type: 'image/jpeg'});
            file.source = 'test';
            const source = 'test';
            const getCurrentSearchQueryJSONSpy = jest.spyOn(SearchQueryUtils, 'getCurrentSearchQueryJSON').mockReturnValue({hash: snapshotHash} as SearchQueryJSON);

            const transaction = {
                transactionID,
                receipt: {
                    source: 'test1',
                },
            };

            // Given a transaction with a receipt
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await waitForBatchedUpdates();

            // Given a snapshot of the transaction
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`, {
                // @ts-expect-error: Allow partial record in snapshot update
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
                },
            });
            await waitForBatchedUpdates();

            try {
                // When the receipt is replaced
                replaceReceipt({transactionID, file, source, transactionPolicy: undefined});
                await waitForBatchedUpdates();

                // Then the transaction should have the new receipt source
                const updatedTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                    const connection = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.TRANSACTION,
                        waitForCollectionCallback: true,
                        callback: (transactions) => {
                            Onyx.disconnect(connection);
                            const newTransaction = transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                            resolve(newTransaction);
                        },
                    });
                });
                expect(updatedTransaction?.receipt?.source).toBe(source);
                expect(updatedTransaction?.receipt?.state).toBe(CONST.IOU.RECEIPT_STATE.OPEN);

                // Then the snapshot should have the new receipt source
                const updatedSnapshot = (await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}` as OnyxKey)) as OnyxEntry<SearchResults>;

                expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.source).toBe(source);
                expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.state).toBe(CONST.IOU.RECEIPT_STATE.OPEN);
            } finally {
                getCurrentSearchQueryJSONSpy.mockRestore();
            }
        });

        it('should preserve receipt state when state is provided', async () => {
            const transactionID = rand64().toString();
            const snapshotHash = 918273647;
            const file = new File([new Blob(['test'])], 'test.jpg', {type: 'image/jpeg'});
            file.source = 'test';
            const source = 'test';
            const getCurrentSearchQueryJSONSpy = jest.spyOn(SearchQueryUtils, 'getCurrentSearchQueryJSON').mockReturnValue({hash: snapshotHash} as SearchQueryJSON);

            const transaction = {
                transactionID,
                receipt: {
                    source: 'test1',
                    state: CONST.IOU.RECEIPT_STATE.SCAN_READY,
                },
            };

            // Given a transaction with a receipt in SCANREADY state
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await waitForBatchedUpdates();

            // Given a snapshot of the transaction
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`, {
                // @ts-expect-error: Allow partial record in snapshot update
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
                },
            });
            await waitForBatchedUpdates();

            try {
                // When the receipt is replaced with the state preserved (e.g. rotating receipt)
                replaceReceipt({transactionID, file, source, state: CONST.IOU.RECEIPT_STATE.SCAN_READY, transactionPolicy: undefined});
                await waitForBatchedUpdates();

                // Then the transaction should have the new receipt source but preserve the state
                const updatedTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                    const connection = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.TRANSACTION,
                        waitForCollectionCallback: true,
                        callback: (transactions) => {
                            Onyx.disconnect(connection);
                            const newTransaction = transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                            resolve(newTransaction);
                        },
                    });
                });
                expect(updatedTransaction?.receipt?.source).toBe(source);
                expect(updatedTransaction?.receipt?.state).toBe(CONST.IOU.RECEIPT_STATE.SCAN_READY);

                // Then the snapshot should also preserve the state
                const updatedSnapshot = (await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}` as OnyxKey)) as OnyxEntry<SearchResults>;

                expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.source).toBe(source);
                expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.state).toBe(CONST.IOU.RECEIPT_STATE.SCAN_READY);
            } finally {
                getCurrentSearchQueryJSONSpy.mockRestore();
            }
        });

        it('should add receipt if it does not exist', async () => {
            const transactionID = rand64().toString();
            const snapshotHash = 918273646;
            const file = new File([new Blob(['test'])], 'test.jpg', {type: 'image/jpeg'});
            file.source = 'test';
            const source = 'test';
            const getCurrentSearchQueryJSONSpy = jest.spyOn(SearchQueryUtils, 'getCurrentSearchQueryJSON').mockReturnValue({hash: snapshotHash} as SearchQueryJSON);

            const transaction = {
                transactionID,
            };

            // Given a transaction without a receipt
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await waitForBatchedUpdates();

            // Given a snapshot of the transaction
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`, {
                // @ts-expect-error: Allow partial record in snapshot update
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
                },
            });
            await waitForBatchedUpdates();

            try {
                // When the receipt is replaced
                replaceReceipt({transactionID, file, source, transactionPolicy: undefined});
                await waitForBatchedUpdates();

                // Then the transaction should have the new receipt source
                const updatedTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                    const connection = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.TRANSACTION,
                        waitForCollectionCallback: true,
                        callback: (transactions) => {
                            Onyx.disconnect(connection);
                            const newTransaction = transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                            resolve(newTransaction);
                        },
                    });
                });
                expect(updatedTransaction?.receipt?.source).toBe(source);

                // Then the snapshot should have the new receipt source
                const updatedSnapshot = (await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}` as OnyxKey)) as OnyxEntry<SearchResults>;
                expect(updatedSnapshot?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.receipt?.source).toBe(source);
            } finally {
                getCurrentSearchQueryJSONSpy.mockRestore();
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
