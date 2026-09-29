import {issueExpensifyCard} from '@libs/actions/Card';
import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {IssueNewCardData} from '@src/types/onyx/Card';

import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const domainAccountID = 22588762;
const policyID = 'A6D48964EA47D654';
const feedCountry = CONST.COUNTRY.GB;
const validateCode = '123456';

function getLastRequestParams(command: string): Record<string, FormDataEntryValue> {
    if (!jest.isMockFunction(global.fetch)) {
        throw new Error('Expected global.fetch to be a Jest mock function.');
    }
    const calls = jest.mocked(global.fetch).mock.calls.filter(([url]) => url === `https://www.expensify.com.dev/api/${command}?`);
    const body = calls.at(-1)?.[1]?.body;
    return body instanceof FormData ? Object.fromEntries(body) : {};
}

function createIssueNewCardData(cardType: IssueNewCardData['cardType']): IssueNewCardData {
    return {
        assigneeEmail: 'assignee@example.com',
        invitingMemberEmail: 'admin@example.com',
        invitingMemberAccountID: 123,
        cardType,
        limitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
        limit: 10000,
        cardTitle: 'Program card',
        currency: CONST.CURRENCY.GBP,
    };
}

OnyxUpdateManager();

describe('issueExpensifyCard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeEach(async () => {
        mockFetch.succeed();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('sends the selected program when issuing a physical card', async () => {
        // Given a physical card being issued into the selected GB program
        const data = createIssueNewCardData(CONST.EXPENSIFY_CARD.CARD_TYPE.PHYSICAL);

        // When the issue-card action is called
        issueExpensifyCard(domainAccountID, policyID, feedCountry, validateCode, undefined, data);
        await waitForBatchedUpdates();

        // Then the physical-card request includes that program
        expect(getLastRequestParams(WRITE_COMMANDS.CREATE_EXPENSIFY_CARD)).toEqual(expect.objectContaining({feedCountry, policyID, validateCode}));
    });

    it('sends the selected program when issuing a virtual card', async () => {
        // Given a virtual card being issued into the selected GB program
        const data = createIssueNewCardData(CONST.EXPENSIFY_CARD.CARD_TYPE.VIRTUAL);

        // When the issue-card action is called
        issueExpensifyCard(domainAccountID, policyID, feedCountry, validateCode, undefined, data);
        await waitForBatchedUpdates();

        // Then the virtual-card request includes that program
        expect(getLastRequestParams(WRITE_COMMANDS.CREATE_ADMIN_ISSUED_VIRTUAL_CARD)).toEqual(expect.objectContaining({feedCountry, policyID, validateCode}));
    });
});
