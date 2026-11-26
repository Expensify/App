import {isEmailPublicDomain} from '@libs/LoginUtils';
import {getParsedMessageWithShortMentions} from '@libs/ParsingUtils';

import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

import {
    createDisplayDetailsByAccountIDsSelector,
    multiPersonalDetailsSelector,
    personalDetailsListSelector,
    personalDetailsLoginSelector,
    personalDetailsLoginsSelector,
    personalDetailsSelector,
    shortMentionLoginsSelector,
} from '@selectors/PersonalDetails';
import {Str} from 'expensify-common';

import createMock from '../utils/createMock';

describe('PersonalDetailsSelector', () => {
    const accountID = 123;
    const personalDetails = {
        accountID,
        displayName: 'Test User',
        login: 'test@user.com',
    };
    const personalDetailsList = createMock<PersonalDetailsList>({
        [accountID]: personalDetails,
    });
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

    describe('shortMentionLoginsSelector', () => {
        const teammateAccountID = 1;
        const outsiderAccountID = 2;
        const phoneAccountID = 3;
        const noLoginAccountID = 4;
        const loginsList = createMock<PersonalDetailsList>({
            [teammateAccountID]: {accountID: teammateAccountID, login: 'john@acme.com'},
            [outsiderAccountID]: {accountID: outsiderAccountID, login: 'jane@other.com'},
            [phoneAccountID]: {accountID: phoneAccountID, login: '+15005550006@expensify.sms'},
            [noLoginAccountID]: {accountID: noLoginAccountID, displayName: 'No Login'},
        });
        const allLogins = ['john@acme.com', 'jane@other.com', '+15005550006@expensify.sms'];

        it('keeps teammates on the private domain and phone logins', () => {
            // Given a user on a private domain
            // When the logins are selected
            const result = shortMentionLoginsSelector('me@acme.com')(loginsList);

            // Then only logins a short mention can resolve to are kept
            expect(result).toEqual(['john@acme.com', '+15005550006@expensify.sms']);
        });

        it('keeps only phone logins for a user on a public domain or without a login', () => {
            // Given a user on a public domain, and a user whose login is not loaded
            // When the logins are selected
            // Then no email login can match a short mention, so only phone logins are kept
            expect(shortMentionLoginsSelector('me@gmail.com')(loginsList)).toEqual(['+15005550006@expensify.sms']);
            expect(shortMentionLoginsSelector('')(loginsList)).toEqual(['+15005550006@expensify.sms']);
        });

        it('returns an empty list before personal details load', () => {
            // Given no personal details yet
            // When the logins are selected
            // Then there is nothing to resolve short mentions against
            expect(shortMentionLoginsSelector('me@acme.com')(undefined)).toEqual([]);
        });

        it.each(['me@acme.com', 'me@gmail.com', ''])('resolves short mentions the same as the full list for %s', (currentUserLogin) => {
            // Given a message that mentions a teammate, an outsider, a phone number with and without a plus, and unknown names
            const text = 'hi @john @jane @15005550006 @+15005550006 @nobody @John';
            const userEmailDomain = isEmailPublicDomain(currentUserLogin) ? '' : Str.extractEmailDomain(currentUserLogin);
            const parse = (availableMentionLogins: string[]) => getParsedMessageWithShortMentions({text, userEmailDomain, availableMentionLogins, parserOptions: {}});

            // When it is parsed with the selected logins and with every login
            // Then the HTML is the same, so the narrower list never changes what a short mention resolves to
            expect(parse(shortMentionLoginsSelector(currentUserLogin)(loginsList))).toBe(parse(allLogins));
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
        const fullDetails = createMock<PersonalDetails>({
            accountID,
            displayName: 'Test User',
            login: 'test@user.com',
            avatar: 'https://example.com/avatar.png',
            pronouns: 'they/them',
            timezone: {selected: 'Europe/London'},
        });
        const listWithAvatar = createMock<PersonalDetailsList>({[accountID]: fullDetails});

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
