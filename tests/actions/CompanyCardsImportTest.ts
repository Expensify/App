import {importCSVCompanyCards} from '@libs/actions/CompanyCards';
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
});
