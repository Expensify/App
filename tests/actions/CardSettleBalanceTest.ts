import CONST from '@src/CONST';
import {queueExpensifyCardForBilling} from '@src/libs/actions/Card';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import {WRITE_COMMANDS} from '@src/libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const domainAccountID = 22588762;

/**
 * Reads the parameters of the most recent settle balance request. The fetch mock accumulates calls for the whole
 * file, and parameters travel as FormData, so every value comes back as a string.
 */
function getLastSettleBalanceRequestParams(): Record<string, FormDataEntryValue> {
    if (!jest.isMockFunction(global.fetch)) {
        throw new Error('Expected global.fetch to be a Jest mock function.');
    }
    const calls = jest.mocked(global.fetch).mock.calls.filter(([url]) => url === `https://www.expensify.com.dev/api/${WRITE_COMMANDS.QUEUE_EXPENSIFY_CARD_FOR_BILLING}?`);
    const body = calls.at(-1)?.[1]?.body;
    return body instanceof FormData ? Object.fromEntries(body) : {};
}

OnyxUpdateManager();
describe('actions/Card', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeEach(() => {
        mockFetch.succeed();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('queueExpensifyCardForBilling', () => {
        it('tells the backend which card program to settle', async () => {
            // Given a UK/EU workspace, whose card settings live under the GB program
            const programKey = CONST.COUNTRY.GB;

            // When the admin settles the balance
            queueExpensifyCardForBilling(domainAccountID, programKey);
            await waitForBatchedUpdates();
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            // Then the request names that program, otherwise the backend looks for a US program and rejects the request
            expect(getLastSettleBalanceRequestParams()).toEqual(
                expect.objectContaining({
                    domainAccountID: String(domainAccountID),
                    feedCountry: programKey,
                }),
            );
        });

        it('lets the backend pick the program when the card settings do not identify one', async () => {
            // Given card settings with no recognizable program key
            // When the admin settles the balance
            queueExpensifyCardForBilling(domainAccountID, undefined);
            await waitForBatchedUpdates();
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            // Then no program is sent, so the backend settles whichever program is provisioned on the domain
            expect(getLastSettleBalanceRequestParams()).toEqual(expect.objectContaining({domainAccountID: String(domainAccountID)}));
            expect(getLastSettleBalanceRequestParams()).not.toHaveProperty('feedCountry');
        });
    });
});
