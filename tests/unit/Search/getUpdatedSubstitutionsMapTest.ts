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
            'from:Mat': '@mateusz',
        };

        const result = getUpdatedSubstitutionsMap(userTypedQuery, substitutionsMock);

        expect(result).toStrictEqual({
            'from:Mat': '@mateusz',
        });
    });

    test('when query has a substitution and it changed', () => {
        const userTypedQuery = 'foo from:Johnny';
        const substitutionsMock = {
            'from:Steven': '@steven',
        };

        const result = getUpdatedSubstitutionsMap(userTypedQuery, substitutionsMock);

        expect(result).toStrictEqual({});
    });

    test('when query has multiple substitutions and some changed but some stayed', () => {
        // cspell:disable-next-line
        const userTypedQuery = 'from:Johnny to:Steven category:Fruitzzzz';
        const substitutionsMock = {
            'from:Johnny': '@johnny',
            'to:Steven': '@steven',
            'from:OldName': '@oldName',
            'category:Fruit': '123456',
        };

        const result = getUpdatedSubstitutionsMap(userTypedQuery, substitutionsMock);

        expect(result).toStrictEqual({
            'from:Johnny': '@johnny',
            'to:Steven': '@steven',
        });
    });

    test('when query has repeated values, it preserves only indexed keys still in query', () => {
        const userTypedQuery = 'policyID:Team,Team to:Steven';
        const substitutionsMock = {
            'policyID:Team': '111',
            'policyID:Team:1': '222',
            'policyID:Team:2': '333',
            'to:Steven': '@steven',
        };

        const result = getUpdatedSubstitutionsMap(userTypedQuery, substitutionsMock);

        expect(result).toStrictEqual({
            'policyID:Team': '111',
            'policyID:Team:1': '222',
            'to:Steven': '@steven',
        });
    });
});
