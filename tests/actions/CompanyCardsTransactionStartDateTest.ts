import {bulkUpdateCardTransactionStartDate, updateCardTransactionStartDate} from '@libs/actions/CompanyCards';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

const DOMAIN_OR_WORKSPACE_ACCOUNT_ID = 1234567;
const CARD_ID = '123';
const FEED = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;

describe('actions/CompanyCards transaction start date updates', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('removes an optimistically added date when a single-card update fails', () => {
        // Given a card that previously imported transactions from the beginning
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

        // When setting a custom start date
        updateCardTransactionStartDate(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, CARD_ID, '2026-10-13', FEED, undefined);

        // Then a failed request rolls the missing date back with null so Onyx removes the optimistic value
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_CARD_TRANSACTION_START_DATE,
            expect.anything(),
            expect.objectContaining({
                failureData: [
                    expect.objectContaining({
                        value: {
                            [CARD_ID]: expect.objectContaining({scrapeMinDate: null}),
                        },
                    }),
                ],
            }),
        );
    });

    it('rolls back absent dates, signals the queued update immediately, and signals success only through success data for bulk updates', () => {
        // Given cards that previously imported transactions from the beginning
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
        const onyxMergeSpy = jest.spyOn(Onyx, 'merge');

        // When setting a custom start date in bulk
        bulkUpdateCardTransactionStartDate(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, FEED, [{cardID: CARD_ID, oldStartDate: undefined}], '2026-10-13');

        // Then the queued request signals selection clearing immediately
        expect(onyxMergeSpy).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.RAM_ONLY_COMPANY_CARDS_LOADING_STATE}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}`, expect.anything());

        // And failure data removes the optimistic date while success data signals the confirmed server response
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.BULK_UPDATE_CARD_TRANSACTION_START_DATE,
            expect.anything(),
            expect.objectContaining({
                failureData: [
                    expect.objectContaining({
                        value: {
                            [CARD_ID]: expect.objectContaining({scrapeMinDate: null}),
                        },
                    }),
                ],
                successData: [
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.RAM_ONLY_COMPANY_CARDS_LOADING_STATE}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}`,
                    }),
                ],
            }),
        );
    });
});
