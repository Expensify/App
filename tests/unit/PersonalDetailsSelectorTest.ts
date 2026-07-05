import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

import {
    createDisplayDetailsByAccountIDsSelector,
    multiPersonalDetailsSelector,
    personalDetailsDisplayNameSelector,
    personalDetailsListSelector,
    personalDetailsLoginSelector,
    personalDetailsLoginsSelector,
    personalDetailsSelector,
} from '@selectors/PersonalDetails';

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

    describe('personalDetailsLoginsSelector', () => {
        const secondAccountID = 456;
        const secondPersonalDetails = {
            accountID: secondAccountID,
            displayName: 'Second User',
            login: 'second@user.com',
        };
        const multiPersonalDetailsList: PersonalDetailsList = {
            [accountID]: personalDetails,
            [secondAccountID]: secondPersonalDetails,
        };

        it('should return the logins for the given accountIDs', () => {
            const result = personalDetailsLoginsSelector([accountID, secondAccountID])(multiPersonalDetailsList);
            expect(result).toEqual([personalDetails.login, secondPersonalDetails.login]);
        });

        it('should filter out accountIDs that do not exist in the list', () => {
            const result = personalDetailsLoginsSelector([accountID, 999])(multiPersonalDetailsList);
            expect(result).toEqual([personalDetails.login]);
        });

        it('should return an empty array if accountIDs is empty', () => {
            const result = personalDetailsLoginsSelector([])(multiPersonalDetailsList);
            expect(result).toEqual([]);
        });

        it('should return an empty array if none of the accountIDs exist in the list', () => {
            const result = personalDetailsLoginsSelector([888, 999])(multiPersonalDetailsList);
            expect(result).toEqual([]);
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

        it('should return an empty array if accountIDs is undefined', () => {
            const result = multiPersonalDetailsSelector(undefined)(personalDetailsList);
            expect(result).toEqual([]);
        });

        it('should return an empty array if the personalDetailsList is undefined', () => {
            const result = multiPersonalDetailsSelector([accountID])(undefined);
            expect(result).toEqual([]);
        });
    });

    describe('personalDetailsListSelector', () => {
        it('should return the personal details list for the given accountIDs', () => {
            const result = personalDetailsListSelector([accountID])(personalDetailsList);
            expect(result).toEqual(personalDetailsList);
        });

        it('should filter out accountIDs that do not exist in the list', () => {
            const result = personalDetailsListSelector([accountID, 999])(personalDetailsList);
            expect(result).toEqual(personalDetailsList);
        });

        it('should return an empty object if accountIDs is empty', () => {
            const result = personalDetailsListSelector([])(personalDetailsList);
            expect(result).toEqual({});
        });

        it('should return an empty object if the personalDetailsList is undefined', () => {
            const result = personalDetailsListSelector([accountID])(undefined);
            expect(result).toEqual({});
        });
    });

    describe('createDisplayDetailsByAccountIDsSelector', () => {
        const fullDetails = {
            accountID,
            displayName: 'Test User',
            login: 'test@user.com',
            avatar: 'https://example.com/avatar.png',
            pronouns: 'they/them',
            timezone: {selected: 'UTC'},
        } as unknown as PersonalDetails;
        const listWithAvatar = {[accountID]: fullDetails} as unknown as PersonalDetailsList;

        it('should return only the display detail fields for present account IDs', () => {
            const result = createDisplayDetailsByAccountIDsSelector([accountID])(listWithAvatar);
            expect(result).toEqual({
                [accountID]: {
                    accountID,
                    displayName: 'Test User',
                    login: 'test@user.com',
                    avatar: 'https://example.com/avatar.png',
                },
            });
        });

        it('should not include extra fields beyond accountID, displayName, login, avatar', () => {
            const result = createDisplayDetailsByAccountIDsSelector([accountID])(listWithAvatar);
            const keys = Object.keys(result[accountID] ?? {});
            expect(keys.sort()).toEqual(['accountID', 'avatar', 'displayName', 'login']);
        });

        it('should skip account IDs that are not in the list', () => {
            const result = createDisplayDetailsByAccountIDsSelector([accountID, 999])(listWithAvatar);
            expect(Object.keys(result)).toEqual([String(accountID)]);
        });

        it('should return an empty object for an empty account IDs array', () => {
            const result = createDisplayDetailsByAccountIDsSelector([])(listWithAvatar);
            expect(result).toEqual({});
        });

        it('should return an empty object when personalDetailsList is undefined', () => {
            const result = createDisplayDetailsByAccountIDsSelector([accountID])(undefined);
            expect(result).toEqual({});
        });
    });
});
