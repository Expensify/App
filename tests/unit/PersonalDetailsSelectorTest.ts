import {multiPersonalDetailsSelector, personalDetailsDisplayNameSelector, personalDetailsLoginSelector, personalDetailsSelector} from '@selectors/PersonalDetails';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import type {PersonalDetailsList} from '@src/types/onyx';

describe('PersonalDetailsSelector', () => {
    const accountID = 123;
    const personalDetails = {
        accountID,
        displayName: 'Test User',
        login: 'test@user.com',
    };
    const personalDetailsList = {
        [accountID]: personalDetails,
    } as unknown as PersonalDetailsList;
    describe('personalDetailsSelector', () => {
        it('should return the personal details for the given accountID', () => {
            const result = personalDetailsSelector(accountID)(personalDetailsList);
            expect(result).toEqual(personalDetails);
        });

        it('should return undefined if the accountID is not in the list', () => {
            const result = personalDetailsSelector(999)(personalDetailsList);
            expect(result).toBeUndefined();
        });

        it('should return undefined if the personalDetailsList is undefined', () => {
            const result = personalDetailsSelector(accountID)(undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('personalDetailsDisplayNameSelector', () => {
        it('should return the display name for the given accountID', () => {
            const result = personalDetailsDisplayNameSelector(accountID)(personalDetailsList);
            expect(result).toEqual(getDisplayNameOrDefault(personalDetails));
        });

        it('should return concierge display name for concierge accountID', () => {
            const conciergeDetails = {
                accountID: CONST.ACCOUNT_ID.CONCIERGE,
                displayName: 'Some Other Name',
                login: 'concierge@expensify.com',
            };
            const list = {
                [CONST.ACCOUNT_ID.CONCIERGE]: conciergeDetails,
            } as unknown as PersonalDetailsList;

            const result = personalDetailsDisplayNameSelector(CONST.ACCOUNT_ID.CONCIERGE)(list);
            expect(result).toBe(CONST.CONCIERGE_DISPLAY_NAME);
        });

        it('should return login when displayName is missing', () => {
            const personalDetailsWithLoginOnly = {
                accountID,
                login: 'fallback@user.com',
            };
            const list = {
                [accountID]: personalDetailsWithLoginOnly,
            } as unknown as PersonalDetailsList;

            const result = personalDetailsDisplayNameSelector(accountID)(list);
            expect(result).toBe('fallback@user.com');
        });

        it('should return default display name if the accountID is not in the list', () => {
            const result = personalDetailsDisplayNameSelector(999)(personalDetailsList);
            expect(result).toEqual(getDisplayNameOrDefault(undefined));
        });

        it('should return default display name if the personalDetailsList is undefined', () => {
            const result = personalDetailsDisplayNameSelector(accountID)(undefined);
            expect(result).toEqual(getDisplayNameOrDefault(undefined));
        });
    });

    describe('personalDetailsLoginSelector', () => {
        it('should return the personal details login for the given accountID', () => {
            const result = personalDetailsLoginSelector(accountID)(personalDetailsList);
            expect(result).toEqual(personalDetails.login);
        });

        it('should return undefined if the accountID is not in the list', () => {
            const result = personalDetailsLoginSelector(999)(personalDetailsList);
            expect(result).toBeUndefined();
        });

        it('should return undefined if the personalDetailsList is undefined', () => {
            const result = personalDetailsLoginSelector(accountID)(undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('multiPersonalDetailsSelector', () => {
        it('should return the personal details for the given accountIDs', () => {
            const result = multiPersonalDetailsSelector([accountID])(personalDetailsList);
            expect(result).toEqual([personalDetails]);
        });

        it('should filter out accountIDs that do not exist in the list', () => {
            const result = multiPersonalDetailsSelector([accountID, 999])(personalDetailsList);
            expect(result).toEqual([personalDetails]);
        });

        it('should return an empty array if accountIDs is empty', () => {
            const result = multiPersonalDetailsSelector([])(personalDetailsList);
            expect(result).toEqual([]);
        });

        it('should return an empty array if the personalDetailsList is undefined', () => {
            const result = multiPersonalDetailsSelector([accountID])(undefined);
            expect(result).toEqual([]);
        });
    });
});
