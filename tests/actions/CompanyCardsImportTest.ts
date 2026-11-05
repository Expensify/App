import {importCSVCompanyCards} from '@libs/actions/CompanyCards';
import * as API from '@libs/API';
import type {ImportCSVCompanyCardsParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const POLICY_ID = 'POLICY_1';
const DOMAIN_ACCOUNT_ID = 777;
const CSV_FEED = CONST.COMPANY_CARD.FEED_BANK_NAME.CSV;

let numberedFeedWriteSpy: jest.SpiedFunction<typeof API.write>;

const isImportCSVCompanyCardsParams = (value: unknown): value is ImportCSVCompanyCardsParams => typeof value === 'object' && value !== null && 'settings' in value && 'csvData' in value;

OnyxUpdateManager();
describe('actions/CompanyCards importCSVCompanyCards', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('targets the feed-owning domain account when re-importing a domain feed surfaced via a preferred workspace', () => {
        // Given a domain feed (its NVPs live on the +@domain account, not the workspace account) that is re-imported
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

        // When importing with an explicit domainAccountID and no cached feeds for that account
        importCSVCompanyCards({
            policyID: POLICY_ID,
            domainAccountID: DOMAIN_ACCOUNT_ID,
            layoutName: 'My Layout',
            layoutType: CSV_FEED,
            columnMappings: ['merchant', 'amount'],
            csvData: [
                ['merchant', 'amount'],
                ['Coffee Shop', '-5.00'],
            ],
            existingInstanceID: 'domain-instance',
            workspaceCardFeeds: undefined,
        });

        // Then the domainAccountID is forwarded to the backend so the existing feed is updated in place, and the
        // optimistic Onyx writes target the domain account rather than the workspace account.
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.IMPORT_CSV_COMPANY_CARDS,
            expect.objectContaining({
                policyID: POLICY_ID,
                domainAccountID: DOMAIN_ACCOUNT_ID,
            }),
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${POLICY_ID}`,
                        value: `${CSV_FEED}${CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}${DOMAIN_ACCOUNT_ID}`,
                    }),
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${DOMAIN_ACCOUNT_ID}`,
                    }),
                ]),
            }),
        );

        apiWriteSpy.mockRestore();
    });

    it('does not optimistically create the feed when it already exists on the target account', () => {
        // Given the target account already has the feed and a nickname for it
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

        const existingFeeds: CardFeeds = {
            settings: {
                companyCards: {[CSV_FEED]: {pending: false}},
                companyCardNicknames: {[CSV_FEED]: 'Existing Layout'},
            },
        };

        // When re-importing into that existing feed
        importCSVCompanyCards({
            policyID: POLICY_ID,
            domainAccountID: DOMAIN_ACCOUNT_ID,
            layoutName: 'Existing Layout',
            layoutType: CSV_FEED,
            columnMappings: ['merchant', 'amount'],
            csvData: [['merchant', 'amount']],
            existingInstanceID: 'domain-instance',
            workspaceCardFeeds: existingFeeds,
        });

        // Then only the last-selected-feed is updated optimistically; no domain_member feed stub is created
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.IMPORT_CSV_COMPANY_CARDS,
            expect.objectContaining({policyID: POLICY_ID, domainAccountID: DOMAIN_ACCOUNT_ID}),
            expect.objectContaining({
                optimisticData: [
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${POLICY_ID}`,
                    }),
                ],
            }),
        );

        apiWriteSpy.mockRestore();
    });

    it('counts every row that has a card identity when the Card number column is not mapped', () => {
        // Given an import that maps Card name (not Card number) plus a mapped Unique ID and a trailing optional column
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

        // When rows leave that trailing optional column empty
        importCSVCompanyCards({
            policyID: POLICY_ID,
            domainAccountID: DOMAIN_ACCOUNT_ID,
            layoutName: 'My Layout',
            layoutType: CSV_FEED,
            columnMappings: ['externalID', 'cardName', 'postedDate', 'merchant', 'amount', 'currency', 'tag'],
            csvData: [
                ['Unique ID', 'Card Name', 'Date', 'Merchant', 'Amount', 'Currency', 'Tag'],
                ['txn-1', 'Finance Card', '08/05/2026', 'Coffee Shop', '-6.25', 'USD', ''],
                ['txn-2', 'Finance Card', '08/06/2026', 'Book Store', '-14.00', 'USD', ''],
                ['txn-3', 'Travel Card', '08/07/2026', 'Grocery Mart', '-28.40', 'USD', 'Travel'],
            ],
            workspaceCardFeeds: undefined,
        });

        // Then all three rows are counted, because the card identity comes from Card name rather than the last cell in the row
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.IMPORT_CSV_COMPANY_CARDS,
            expect.anything(),
            expect.objectContaining({
                successData: [
                    expect.objectContaining({
                        value: expect.objectContaining({
                            importFinalModal: expect.objectContaining({promptKeyParams: {count: 3}}),
                        }),
                    }),
                ],
            }),
        );

        apiWriteSpy.mockRestore();
    });

    describe('numbered CSV feeds', () => {
        beforeEach(() => {
            numberedFeedWriteSpy = jest.spyOn(API, 'write');
            jest.spyOn(Date, 'now').mockReturnValue(1705320000000);
            jest.spyOn(Math, 'random').mockReturnValue(0.5);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('retains the existing numbered feed, nickname and domain while normalizing rows', async () => {
            // Given a numbered feed owned by the domain with an existing nickname.
            numberedFeedWriteSpy.mockResolvedValue(undefined);
            const existingFeeds: CardFeeds = {
                settings: {companyCards: {csv2: {pending: false}}, companyCardNicknames: {csv2: 'Existing Layout'}},
            };
            const columnMappings = ['externalID', 'cardNumber', 'postedDate', 'merchant', 'amount', 'currency'];

            // When that feed is re-imported with one valid row and one row missing its card identity.
            const result = importCSVCompanyCards({
                policyID: POLICY_ID,
                domainAccountID: DOMAIN_ACCOUNT_ID,
                layoutName: 'Replacement Layout',
                layoutType: 'csv2',
                columnMappings,
                csvData: [
                    ['ID', 'Card', 'Date', 'Merchant', 'Amount', 'Currency'],
                    ['txn-1', '1234', '01/15/2024', 'Coffee Shop', '-5.00', 'USD'],
                    ['txn-2', '', '01/16/2024', 'Book Store', '-10.00', 'USD'],
                ],
                existingInstanceID: 'domain-instance',
                lastSelectedFeed: 'csv1#777',
                workspaceCardFeeds: existingFeeds,
            });

            // Then serialization retains the numbered identity and the existing metadata is never overwritten.
            expect(numberedFeedWriteSpy).toHaveBeenCalledTimes(1);
            const call = numberedFeedWriteSpy.mock.calls.at(0);
            if (!call) {
                throw new Error('Expected the numbered CSV import request');
            }
            const [command, parameters, onyxData] = call;
            expect(command).toBe(WRITE_COMMANDS.IMPORT_CSV_COMPANY_CARDS);
            expect(parameters).toStrictEqual({
                policyID: POLICY_ID,
                domainAccountID: DOMAIN_ACCOUNT_ID,
                settings: JSON.stringify({columnMappings, instanceID: 'domain-instance', layoutName: 'Replacement Layout', layoutType: 'csv2'}),
                csvData: JSON.stringify([
                    ['ID', 'Card', 'Date', 'Merchant', 'Amount', 'Currency'],
                    ['txn-1', '1234', '2024-01-15', 'Coffee Shop', '-5.00', 'USD'],
                    ['txn-2', '', '01/16/2024', 'Book Store', '-10.00', 'USD'],
                ]),
            });
            expect(onyxData?.optimisticData).toStrictEqual([{onyxMethod: Onyx.METHOD.MERGE, key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${POLICY_ID}`, value: 'csv2#777'}]);
            expect(onyxData?.successData).toStrictEqual([
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.IMPORTED_SPREADSHEET,
                    value: {
                        importFinalModalID: '1705320000000-0.5',
                        importFinalModal: {
                            titleKey: 'spreadsheet.importSuccessfulTitle',
                            promptKey: 'spreadsheet.importCompanyCardTransactionsSuccessfulDescription',
                            promptKeyParams: {count: 1},
                            pendingMessageKey: 'spreadsheet.importCompanyCardTransactionsPendingMessage',
                        },
                    },
                },
            ]);
            expect(onyxData?.failureData).toStrictEqual([
                {onyxMethod: Onyx.METHOD.MERGE, key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${POLICY_ID}`, value: 'csv1#777'},
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.IMPORTED_SPREADSHEET,
                    value: {
                        importFinalModalID: '1705320000000-0.5',
                        importFinalModal: {titleKey: 'spreadsheet.importFailedTitle', promptKey: 'spreadsheet.importFailedDescription'},
                    },
                },
            ]);
            expect(existingFeeds.settings?.companyCardNicknames?.csv2).toBe('Existing Layout');
            if (!onyxData?.successData) {
                throw new Error('Expected the import success modal batch');
            }
            await Onyx.update(onyxData.successData);
            await waitForBatchedUpdates();
            await expect(result).resolves.toStrictEqual({
                titleKey: 'spreadsheet.importSuccessfulTitle',
                promptKey: 'spreadsheet.importCompanyCardTransactionsSuccessfulDescription',
                promptKeyParams: {count: 1},
                pendingMessageKey: 'spreadsheet.importCompanyCardTransactionsPendingMessage',
            });
        });

        it('creates a fresh numbered feed and rolls back both new metadata entries with null', async () => {
            // Given a fresh numbered feed and a request that fails before completing the import.
            numberedFeedWriteSpy.mockRejectedValue(new Error('import failed'));
            const columnMappings = ['externalID', 'cardNumber', 'postedDate', 'merchant', 'amount', 'currency'];

            // When no previous feed or instance ID is available.
            const result = await importCSVCompanyCards({
                policyID: POLICY_ID,
                domainAccountID: DOMAIN_ACCOUNT_ID,
                layoutName: 'New Layout',
                layoutType: 'csv2',
                columnMappings,
                csvData: [['txn-1', '1234', '01/15/2024', 'Coffee Shop', '-5.00', 'USD']],
                workspaceCardFeeds: undefined,
            });

            // Then the domain key and numbered feed survive in both creation and deletion batches.
            expect(numberedFeedWriteSpy).toHaveBeenCalledTimes(1);
            const call = numberedFeedWriteSpy.mock.calls.at(0);
            if (!call) {
                throw new Error('Expected the fresh numbered CSV import request');
            }
            const [, parameters, onyxData] = call;
            expect(parameters).toStrictEqual({
                policyID: POLICY_ID,
                domainAccountID: DOMAIN_ACCOUNT_ID,
                settings: JSON.stringify({columnMappings, instanceID: '1705320000000', layoutName: 'New Layout', layoutType: 'csv2'}),
                csvData: JSON.stringify([['txn-1', '1234', '2024-01-15', 'Coffee Shop', '-5.00', 'USD']]),
            });
            expect(onyxData?.optimisticData).toStrictEqual([
                {onyxMethod: Onyx.METHOD.MERGE, key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${POLICY_ID}`, value: 'csv2#777'},
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${DOMAIN_ACCOUNT_ID}`,
                    value: {settings: {companyCards: {csv2: {statementPeriodEndDay: null, errors: null}}, companyCardNicknames: {csv2: 'New Layout'}}},
                },
            ]);
            expect(onyxData?.failureData).toStrictEqual([
                {onyxMethod: Onyx.METHOD.MERGE, key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${POLICY_ID}`, value: null},
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.IMPORTED_SPREADSHEET,
                    value: {importFinalModalID: '1705320000000-0.5', importFinalModal: result},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${DOMAIN_ACCOUNT_ID}`,
                    value: {settings: {companyCards: {csv2: null}, companyCardNicknames: {csv2: null}}},
                },
            ]);
            expect(result).toStrictEqual({titleKey: 'spreadsheet.importFailedTitle', promptKey: 'spreadsheet.importFailedDescription'});
        });
    });

    describe('externalID', () => {
        const sentImports: ImportCSVCompanyCardsParams[] = [];

        beforeEach(() => {
            sentImports.length = 0;
            jest.spyOn(require('@libs/API'), 'write').mockImplementation((...args: unknown[]) => {
                const parameters = args.at(1);
                if (isImportCSVCompanyCardsParams(parameters)) {
                    sentImports.push(parameters);
                }
                return Promise.resolve();
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('appends a generated externalID column when no unique ID column is mapped', () => {
            // Given an import that maps no unique ID column
            // When the file is imported
            importCSVCompanyCards({
                policyID: POLICY_ID,
                domainAccountID: DOMAIN_ACCOUNT_ID,
                layoutName: 'My Layout',
                layoutType: CSV_FEED,
                columnMappings: ['cardNumber', 'postedDate', 'merchant', 'amount', 'currency'],
                csvData: [
                    ['Card', 'Date', 'Merchant', 'Amount', 'Currency'],
                    ['1234', '01/15/2024', 'Coffee Shop', '-5.00', 'USD'],
                ],
                workspaceCardFeeds: undefined,
            });

            // Then an externalID column is appended to the mappings and every row is filled with a generated ID
            expect(sentImports.at(0)?.settings ?? '').toContain('"columnMappings":["cardNumber","postedDate","merchant","amount","currency","externalID"]');
            expect(sentImports.at(0)?.csvData ?? '').toMatch(/,"USD","\d+"]/);
        });

        it('sends the mapped unique ID column values as externalID so re-imports can be deduped', () => {
            // Given an import that maps a unique ID column
            // When the file is imported
            importCSVCompanyCards({
                policyID: POLICY_ID,
                domainAccountID: DOMAIN_ACCOUNT_ID,
                layoutName: 'My Layout',
                layoutType: CSV_FEED,
                columnMappings: ['externalID', 'cardNumber', 'postedDate', 'merchant', 'amount', 'currency'],
                csvData: [
                    ['Unique ID', 'Card', 'Date', 'Merchant', 'Amount', 'Currency'],
                    ['txn-abc-1', '1234', '01/15/2024', 'Coffee Shop', '-5.00', 'USD'],
                    ['txn-abc-2', '1234', '01/16/2024', 'Book Store', '-10.00', 'USD'],
                ],
                workspaceCardFeeds: undefined,
            });

            // Then no externalID column is appended and the mapped values are sent as-is, so the backend can dedupe a re-upload
            expect(sentImports.at(0)?.settings ?? '').toContain('"columnMappings":["externalID","cardNumber","postedDate","merchant","amount","currency"]');
            expect(sentImports.at(0)?.csvData ?? '').toBe(
                JSON.stringify([
                    ['Unique ID', 'Card', 'Date', 'Merchant', 'Amount', 'Currency'],
                    ['txn-abc-1', '1234', '2024-01-15', 'Coffee Shop', '-5.00', 'USD'],
                    ['txn-abc-2', '1234', '2024-01-16', 'Book Store', '-10.00', 'USD'],
                ]),
            );
        });

        it('falls back to a generated externalID for rows with an empty unique ID value', () => {
            // Given an import that maps a unique ID column, with a row missing its value
            // When the file is imported
            importCSVCompanyCards({
                policyID: POLICY_ID,
                domainAccountID: DOMAIN_ACCOUNT_ID,
                layoutName: 'My Layout',
                layoutType: CSV_FEED,
                columnMappings: ['externalID', 'cardNumber', 'postedDate', 'merchant', 'amount', 'currency'],
                csvData: [
                    ['Unique ID', 'Card', 'Date', 'Merchant', 'Amount', 'Currency'],
                    ['   ', '1234', '01/15/2024', 'Coffee Shop', '-5.00', 'USD'],
                ],
                workspaceCardFeeds: undefined,
            });

            // Then that row is sent with a generated ID instead of the blank value
            expect(sentImports.at(0)?.csvData ?? '').toMatch(/\["\d+","1234",/);
        });
    });
});
