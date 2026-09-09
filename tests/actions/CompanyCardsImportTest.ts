import {importCSVCompanyCards} from '@libs/actions/CompanyCards';
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
