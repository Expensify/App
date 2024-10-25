/* eslint-disable @typescript-eslint/naming-convention */
// we need "dirty" object key names in these tests
import {getUpdatedSubstitutionsMap} from '@src/components/Search/SearchRouter/getUpdatedSubstitutionsMap';

describe('getUpdatedSubstitutionsMap should return updated and cleaned substitutions map', () => {
    test('when there were no substitutions', () => {
        const userTypedQuery = 'foo bar';
        const substitutionsMock = {};

        const result = getUpdatedSubstitutionsMap(userTypedQuery, substitutionsMock);

        expect(result).toStrictEqual({});
    });

    test('when query has a substitution and it did not change', () => {
        const userTypedQuery = 'foo from:Mat';
        const substitutionsMock = {
            'from:Mat': {
                value: '@mateusz',
            },
        };

        const result = getUpdatedSubstitutionsMap(userTypedQuery, substitutionsMock);

        expect(result).toStrictEqual({
            'from:Mat': {
                value: '@mateusz',
            },
        });
    });

    test('when query has a substitution and it changed', () => {
        const userTypedQuery = 'foo from:Johnny';
        const substitutionsMock = {
            'from:Steven': {
                value: '@steven',
            },
        };

        const result = getUpdatedSubstitutionsMap(userTypedQuery, substitutionsMock);

        expect(result).toStrictEqual({});
    });

    test('when query has multiple substitutions and some changed but some stayed', () => {
        const userTypedQuery = 'from:Johnny to:Steven category:Fruitzzzz';
        const substitutionsMock = {
            'from:Johnny': {
                value: '@johnny',
            },
            'to:Steven': {
                value: '@steven',
            },
            'from:OldName': {
                value: '@oldName',
            },
            'category:Fruit': {
                value: '123456',
            },
        };

        const result = getUpdatedSubstitutionsMap(userTypedQuery, substitutionsMock);

        expect(result).toStrictEqual({
            'from:Johnny': {
                value: '@johnny',
            },
            'to:Steven': {
                value: '@steven',
            },
        });
    });
});
