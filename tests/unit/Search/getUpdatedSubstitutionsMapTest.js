"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
// we need "dirty" object key names in these tests
var getUpdatedSubstitutionsMap_1 = require("@src/components/Search/SearchRouter/getUpdatedSubstitutionsMap");
describe('getUpdatedSubstitutionsMap should return updated and cleaned substitutions map', function () {
    test('when there were no substitutions', function () {
        var userTypedQuery = 'foo bar';
        var substitutionsMock = {};
        var result = (0, getUpdatedSubstitutionsMap_1.getUpdatedSubstitutionsMap)(userTypedQuery, substitutionsMock);
        expect(result).toStrictEqual({});
    });
    test('when query has a substitution and it did not change', function () {
        var userTypedQuery = 'foo from:Mat';
        var substitutionsMock = {
            'from:Mat': '@mateusz',
        };
        var result = (0, getUpdatedSubstitutionsMap_1.getUpdatedSubstitutionsMap)(userTypedQuery, substitutionsMock);
        expect(result).toStrictEqual({
            'from:Mat': '@mateusz',
        });
    });
    test('when query has a substitution and it changed', function () {
        var userTypedQuery = 'foo from:Johnny';
        var substitutionsMock = {
            'from:Steven': '@steven',
        };
        var result = (0, getUpdatedSubstitutionsMap_1.getUpdatedSubstitutionsMap)(userTypedQuery, substitutionsMock);
        expect(result).toStrictEqual({});
    });
    test('when query has multiple substitutions and some changed but some stayed', function () {
        // cspell:disable-next-line
        var userTypedQuery = 'from:Johnny to:Steven category:Fruitzzzz';
        var substitutionsMock = {
            'from:Johnny': '@johnny',
            'to:Steven': '@steven',
            'from:OldName': '@oldName',
            'category:Fruit': '123456',
        };
        var result = (0, getUpdatedSubstitutionsMap_1.getUpdatedSubstitutionsMap)(userTypedQuery, substitutionsMock);
        expect(result).toStrictEqual({
            'from:Johnny': '@johnny',
            'to:Steven': '@steven',
        });
    });
});
