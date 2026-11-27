import {clearErrorField, setWorkspaceCompanyCardTransactionLiability} from '@libs/actions/CompanyCards';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const POLICY_ID = 'A1B2C3D4E5F60718';
const DOMAIN_ACCOUNT_ID = 1234567;
const FEED = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;

OnyxUpdateManager();
describe('actions/CompanyCards setWorkspaceCompanyCardTransactionLiability', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeEach(async () => {
        mockFetch.succeed();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('targets the feed-owning domain account when restricting deletion on a domain feed', () => {
        // Given a domain feed, whose settings live on the +@domain account rather than the workspace account
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

        // When an admin turns off deleting transactions for that feed
        setWorkspaceCompanyCardTransactionLiability(DOMAIN_ACCOUNT_ID, POLICY_ID, FEED, CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.RESTRICT, CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.ALLOW);

        // Then the domainAccountID is forwarded to the backend, so the setting is written to the correct account, and the optimistic Onyx write targets that same account.
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.SET_COMPANY_CARD_TRANSACTION_LIABILITY,
            expect.objectContaining({
                policyID: POLICY_ID,
                bankName: FEED,
                liabilityType: CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.RESTRICT,
                domainAccountID: DOMAIN_ACCOUNT_ID,
            }),
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${DOMAIN_ACCOUNT_ID}`,
                    }),
                ]),
            }),
        );
    });

    describe.each([DOMAIN_ACCOUNT_ID, 7654321])('feed owned by account %s', (accountID) => {
        const key = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${accountID}` as const;

        it('retains the last selection after repeated queued toggles', async () => {
            // Given a paused queue so several selections can be made before a response arrives
            const allow = CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.ALLOW;
            const restrict = CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.RESTRICT;
            await Onyx.set(key, {settings: {companyCards: {[FEED]: {liabilityType: restrict}}}});
            mockFetch.pause();

            // When the admin changes their selection repeatedly while requests are queued
            setWorkspaceCompanyCardTransactionLiability(accountID, POLICY_ID, FEED, allow, restrict);
            await waitForBatchedUpdates();
            setWorkspaceCompanyCardTransactionLiability(accountID, POLICY_ID, FEED, restrict, allow);
            await waitForBatchedUpdates();
            setWorkspaceCompanyCardTransactionLiability(accountID, POLICY_ID, FEED, allow, restrict);
            await waitForBatchedUpdates();

            // Then the final selection is pending until the queue can finish
            let feed = (await getOnyxValue(key))?.settings?.companyCards?.[FEED];
            expect(feed?.liabilityType).toBe(allow);
            expect(feed?.pendingFields?.liabilityType).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the queued writes succeed
            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then cleanup does not undo the final selection
            feed = (await getOnyxValue(key))?.settings?.companyCards?.[FEED];
            expect(feed?.liabilityType).toBe(allow);
            expect(feed?.pendingFields?.liabilityType).toBeUndefined();
        });

        it.each([
            [CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.ALLOW, CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.RESTRICT],
            [CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.RESTRICT, CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.ALLOW],
        ])('keeps %s to %s pending until success', async (oldValue, newValue) => {
            // Given another pending setting, a liability error, and a paused response to expose optimistic feedback
            await Onyx.set(key, {
                settings: {
                    companyCards: {
                        [FEED]: {
                            liabilityType: oldValue,
                            pendingFields: {forceReimbursable: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            errorFields: {liabilityType: {error: 'Previous failure'}},
                        },
                    },
                },
            });
            mockFetch.pause();

            // When an admin changes the setting before the server can confirm it
            setWorkspaceCompanyCardTransactionLiability(accountID, POLICY_ID, FEED, newValue, oldValue);
            await waitForBatchedUpdates();

            // Then the new value is pending and retrying clears the old error without clearing another pending setting
            let feed = (await getOnyxValue(key))?.settings?.companyCards?.[FEED];
            expect(feed?.liabilityType).toBe(newValue);
            expect(feed?.pendingFields?.liabilityType).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(feed?.pendingFields?.forceReimbursable).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(feed?.errorFields?.liabilityType).toBeUndefined();

            // When the server accepts the queued change
            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the chosen value persists and only its pending feedback clears
            feed = (await getOnyxValue(key))?.settings?.companyCards?.[FEED];
            expect(feed?.liabilityType).toBe(newValue);
            expect(feed?.pendingFields?.liabilityType).toBeUndefined();
            expect(feed?.pendingFields?.forceReimbursable).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        });

        it.each([CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.ALLOW, CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.RESTRICT, undefined])(
            'restores the previous value %s after rejection',
            async (oldValue) => {
                // Given a rejected request and an unrelated error that must survive rollback
                await Onyx.set(key, {
                    settings: {companyCards: {[FEED]: {liabilityType: oldValue, errorFields: {forceReimbursable: {error: 'Other failure'}}}}},
                });
                mockFetch.fail();
                const newValue =
                    oldValue === CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.ALLOW ? CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.RESTRICT : CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.ALLOW;

                // When a change is rejected instead of reaching the server
                setWorkspaceCompanyCardTransactionLiability(accountID, POLICY_ID, FEED, newValue, oldValue);
                await waitForBatchedUpdates();

                // Then the previous value, including an absent setting, is restored with dismissible error feedback
                const feed = (await getOnyxValue(key))?.settings?.companyCards?.[FEED];
                expect(feed?.liabilityType).toBe(oldValue);
                expect(feed?.pendingFields?.liabilityType).toBeUndefined();
                expect(Object.keys(feed?.errorFields?.liabilityType ?? {})).toHaveLength(1);
                expect(feed?.errorFields?.forceReimbursable).toEqual({error: 'Other failure'});

                // When the admin dismisses only this setting's error
                clearErrorField(FEED, accountID, 'liabilityType');
                await waitForBatchedUpdates();

                // Then unrelated failure feedback remains visible
                const clearedFeed = (await getOnyxValue(key))?.settings?.companyCards?.[FEED];
                expect(clearedFeed?.errorFields?.liabilityType).toBeUndefined();
                expect(clearedFeed?.errorFields?.forceReimbursable).toEqual({error: 'Other failure'});
            },
        );
    });
});
