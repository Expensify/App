import Onyx from 'react-native-onyx';
import {getAccountIDsByLogins, getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

describe('PersonalDetailsUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => Onyx.clear());

    describe('getAccountIDsByLogins', () => {
        it('should return account IDs for existing users', async () => {
            const personalDetails: PersonalDetailsList = {
                1: {
                    accountID: 1,
                    login: 'user1@example.com',
                    displayName: 'User One',
                },
                2: {
                    accountID: 2,
                    login: 'user2@example.com',
                    displayName: 'User Two',
                },
                3: {
                    accountID: 3,
                    login: 'user3@example.com',
                    displayName: 'User Three',
                },
            };

            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await waitForBatchedUpdates();

            const result = getAccountIDsByLogins(['user1@example.com', 'user2@example.com']);
            expect(result).toEqual([1, 2]);
        });

        it('should generate optimistic account IDs for unknown users', async () => {
            const personalDetails: PersonalDetailsList = {
                1: {
                    accountID: 1,
                    login: 'user1@example.com',
                    displayName: 'User One',
                },
            };

            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await waitForBatchedUpdates();

            const result = getAccountIDsByLogins(['user1@example.com', 'unknown@example.com']);

            // First should be 1 (existing), second should be a generated optimistic ID
            expect(result[0]).toBe(1);
            // Optimistic account IDs are generated - they should be different from real IDs
            expect(result[1]).not.toBe(0);
            expect(typeof result[1]).toBe('number');
        });

        it('should handle case-insensitive email matching', async () => {
            const personalDetails: PersonalDetailsList = {
                1: {
                    accountID: 1,
                    login: 'user1@example.com',
                    displayName: 'User One',
                },
            };

            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await waitForBatchedUpdates();

            // The cache is built with lowercase keys, so we need to test that the lookup works
            const result = getAccountIDsByLogins(['USER1@EXAMPLE.COM']);
            expect(result).toEqual([1]);
        });

        it('should handle empty array', async () => {
            const result = getAccountIDsByLogins([]);
            expect(result).toEqual([]);
        });
    });

    describe('getPersonalDetailByEmail', () => {
        it('should return personal details for an existing email', async () => {
            const personalDetails: PersonalDetailsList = {
                1: {
                    accountID: 1,
                    login: 'test@example.com',
                    displayName: 'Test User',
                },
            };

            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await waitForBatchedUpdates();

            const result = getPersonalDetailByEmail('test@example.com');
            expect(result).toEqual({
                accountID: 1,
                login: 'test@example.com',
                displayName: 'Test User',
            });
        });

        it('should return undefined for unknown email', async () => {
            const personalDetails: PersonalDetailsList = {
                1: {
                    accountID: 1,
                    login: 'test@example.com',
                    displayName: 'Test User',
                },
            };

            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await waitForBatchedUpdates();

            const result = getPersonalDetailByEmail('unknown@example.com');
            expect(result).toBeUndefined();
        });

        it('should handle case-insensitive email lookup', async () => {
            const personalDetails: PersonalDetailsList = {
                1: {
                    accountID: 1,
                    login: 'Test@Example.com',
                    displayName: 'Test User',
                },
            };

            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await waitForBatchedUpdates();

            const result = getPersonalDetailByEmail('test@example.com');
            expect(result).toEqual({
                accountID: 1,
                login: 'Test@Example.com',
                displayName: 'Test User',
            });
        });
    });
});
