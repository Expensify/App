// cspell:ignore René Résumé
import deburr from 'lodash/deburr';
import {doesPersonalDetailMatchSearchTerm} from '@libs/OptionsListUtils/searchMatchUtils';

const CURRENT_USER_ACCOUNT_ID = 2;
const OTHER_USER_ACCOUNT_ID = 99;

describe('doesPersonalDetailMatchSearchTerm', () => {
    describe('basic matching', () => {
        it('should match by displayName', () => {
            expect(doesPersonalDetailMatchSearchTerm({displayName: 'John Doe'}, OTHER_USER_ACCOUNT_ID, 'john')).toBe(true);
        });

        it('should match by login (email)', () => {
            expect(doesPersonalDetailMatchSearchTerm({login: 'john@example.com'}, OTHER_USER_ACCOUNT_ID, 'john@example')).toBe(true);
        });

        it('should match by login without dots before @', () => {
            expect(doesPersonalDetailMatchSearchTerm({login: 'john.doe@example.com'}, OTHER_USER_ACCOUNT_ID, 'johndoe@')).toBe(true);
        });

        it('should match by participantsList displayName', () => {
            const item = {participantsList: [{displayName: 'Jane Smith', accountID: 123}]};
            expect(doesPersonalDetailMatchSearchTerm(item, OTHER_USER_ACCOUNT_ID, 'jane')).toBe(true);
        });

        it('should not match when search term is absent from all fields', () => {
            expect(doesPersonalDetailMatchSearchTerm({displayName: 'Alice', login: 'alice@test.com'}, OTHER_USER_ACCOUNT_ID, 'bob')).toBe(false);
        });

        it('should match when search term is empty string', () => {
            expect(doesPersonalDetailMatchSearchTerm({displayName: 'Anyone'}, OTHER_USER_ACCOUNT_ID, '')).toBe(true);
        });
    });

    describe('case insensitivity', () => {
        it('should match mixed case displayName against lowercased search', () => {
            expect(doesPersonalDetailMatchSearchTerm({displayName: 'John DOE'}, OTHER_USER_ACCOUNT_ID, 'john doe')).toBe(true);
        });

        it('should match mixed case login against lowercased search', () => {
            expect(doesPersonalDetailMatchSearchTerm({login: 'John.Doe@Example.COM'}, OTHER_USER_ACCOUNT_ID, 'john.doe@example.com')).toBe(true);
        });
    });

    describe('current user matching', () => {
        it('should match by text field for current user', () => {
            expect(doesPersonalDetailMatchSearchTerm({accountID: CURRENT_USER_ACCOUNT_ID, text: 'My Display Name'}, CURRENT_USER_ACCOUNT_ID, 'my display')).toBe(true);
        });

        it('should fall back to displayName when text is missing for current user', () => {
            expect(doesPersonalDetailMatchSearchTerm({accountID: CURRENT_USER_ACCOUNT_ID, displayName: 'Fallback Name'}, CURRENT_USER_ACCOUNT_ID, 'fallback')).toBe(true);
        });
    });

    describe('partial / sparse items', () => {
        it('should match with only login provided', () => {
            expect(doesPersonalDetailMatchSearchTerm({login: 'solo@test.com'}, OTHER_USER_ACCOUNT_ID, 'solo')).toBe(true);
        });

        it('should match with only displayName provided', () => {
            expect(doesPersonalDetailMatchSearchTerm({displayName: 'Solo'}, OTHER_USER_ACCOUNT_ID, 'solo')).toBe(true);
        });

        it('should not match empty item with a search term', () => {
            expect(doesPersonalDetailMatchSearchTerm({}, OTHER_USER_ACCOUNT_ID, 'anything')).toBe(false);
        });

        it('should match empty item with empty search term', () => {
            expect(doesPersonalDetailMatchSearchTerm({}, OTHER_USER_ACCOUNT_ID, '')).toBe(true);
        });
    });

    describe('cross-field matching', () => {
        it('should match a search term that spans displayName and login', () => {
            expect(doesPersonalDetailMatchSearchTerm({displayName: 'John', login: 'doe@test.com'}, OTHER_USER_ACCOUNT_ID, 'john doe')).toBe(true);
        });
    });

    describe('useLocaleLowerCase config', () => {
        it('should lowercase with toLocaleLowerCase when enabled', () => {
            expect(
                doesPersonalDetailMatchSearchTerm({displayName: 'ISTANBUL'}, OTHER_USER_ACCOUNT_ID, 'istanbul', {
                    useLocaleLowerCase: true,
                }),
            ).toBe(true);
        });

        it('should lowercase with toLowerCase by default', () => {
            expect(doesPersonalDetailMatchSearchTerm({displayName: 'ISTANBUL'}, OTHER_USER_ACCOUNT_ID, 'istanbul')).toBe(true);
        });
    });

    describe('transformSearchText config', () => {
        it('should match against appended text from transform callback', () => {
            expect(
                doesPersonalDetailMatchSearchTerm({displayName: 'John'}, OTHER_USER_ACCOUNT_ID, 'extra', {
                    transformSearchText: (concatenatedSearchTerms) => `${concatenatedSearchTerms} extra stuff`,
                }),
            ).toBe(true);
        });

        it('should pass already-lowercased terms to the transform callback', () => {
            let receivedText = '';
            doesPersonalDetailMatchSearchTerm({displayName: 'UPPER Case'}, OTHER_USER_ACCOUNT_ID, 'test', {
                transformSearchText: (concatenatedSearchTerms) => {
                    receivedText = concatenatedSearchTerms;
                    return concatenatedSearchTerms;
                },
            });
            expect(receivedText).toBe('upper case  ');
        });

        it('should use the transform result as the final match target', () => {
            expect(
                doesPersonalDetailMatchSearchTerm({displayName: 'Alice'}, OTHER_USER_ACCOUNT_ID, 'replaced', {
                    transformSearchText: () => 'completely replaced',
                }),
            ).toBe(true);
        });

        it('should support deburr with appended text (real-world usage)', () => {
            expect(
                doesPersonalDetailMatchSearchTerm({displayName: 'René'}, OTHER_USER_ACCOUNT_ID, 'rene', {
                    useLocaleLowerCase: true,
                    transformSearchText: (concatenatedSearchTerms) => deburr(`${concatenatedSearchTerms} ${'Résumé'.toLocaleLowerCase()}`),
                }),
            ).toBe(true);
        });
    });

    describe('negative cases', () => {
        it('should not match when search term is longer than all fields', () => {
            expect(doesPersonalDetailMatchSearchTerm({displayName: 'Jo'}, OTHER_USER_ACCOUNT_ID, 'john')).toBe(false);
        });

        it('should not match when search contains characters not in any field', () => {
            expect(doesPersonalDetailMatchSearchTerm({displayName: 'John'}, OTHER_USER_ACCOUNT_ID, 'john!')).toBe(false);
        });

        it('should not crash with undefined accountID', () => {
            expect(doesPersonalDetailMatchSearchTerm({accountID: undefined, displayName: 'Test'}, CURRENT_USER_ACCOUNT_ID, 'test')).toBe(true);
        });
    });
});
