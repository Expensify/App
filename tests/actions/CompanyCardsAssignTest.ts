import {assignWorkspaceCompanyCard} from '@libs/actions/CompanyCards';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AssignCard, Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const DOMAIN_ACCOUNT_ID = 777;
const ASSIGNEE_ACCOUNT_ID = 2;
const CURRENT_USER_ACCOUNT_ID = 1;
const policy: Policy = {...createRandomPolicy(1), ownerAccountID: CURRENT_USER_ACCOUNT_ID};
const cardData = {
    bankName: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
    email: 'assignee@example.com',
    encryptedCardNumber: '480801XXXXXX2554',
    customCardName: 'Visa card',
    startDate: '2026-01-01',
};

function getAssignCard() {
    return new Promise<OnyxEntry<AssignCard>>((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.ASSIGN_CARD,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

OnyxUpdateManager();
describe('actions/CompanyCards assignWorkspaceCompanyCard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.EN);
        mockFetch.succeed();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('shows an assign card error on the confirmation step when the request fails', async () => {
        // Given the AssignCompanyCard request will fail
        mockFetch.fail();

        // When an admin assigns a card
        assignWorkspaceCompanyCard(policy, DOMAIN_ACCOUNT_ID, cardData, ASSIGNEE_ACCOUNT_ID, CURRENT_USER_ACCOUNT_ID);
        await waitForBatchedUpdates();

        // Then the assign card state stops loading and has an error to show above the Assign button
        const assignCard = await getAssignCard();
        expect(assignCard?.isAssigning).toBe(false);
        expect(Object.values(assignCard?.errors ?? {})).toEqual([TestHelper.translateLocal('workspace.companyCards.assignCardFailedError')]);
    });

    it('clears the previous error when the admin retries the assignment', async () => {
        // Given a previous assignment attempt failed
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {errors: getMicroSecondOnyxErrorWithTranslationKey('workspace.companyCards.assignCardFailedError')});
        mockFetch.pause?.();

        // When the admin presses Assign again
        assignWorkspaceCompanyCard(policy, DOMAIN_ACCOUNT_ID, cardData, ASSIGNEE_ACCOUNT_ID, CURRENT_USER_ACCOUNT_ID);
        await waitForBatchedUpdates();

        // Then the old error is removed while the new request is in flight
        const assignCard = await getAssignCard();
        expect(assignCard?.isAssigning).toBe(true);
        expect(assignCard?.errors).toBeUndefined();

        await mockFetch.resume?.();
        await waitForBatchedUpdates();
    });
});
