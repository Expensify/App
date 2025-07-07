"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
// we need "dirty" object key names in these tests
var getQueryWithSubstitutions_1 = require("@src/components/Search/SearchRouter/getQueryWithSubstitutions");
describe('getQueryWithSubstitutions should compute and return correct new query', function () {
    test('when both queries contain no substitutions', function () {
        // given this previous query: "foo"
        var userTypedQuery = 'foo bar';
        var substitutionsMock = {};
        var result = (0, getQueryWithSubstitutions_1.getQueryWithSubstitutions)(userTypedQuery, substitutionsMock);
        expect(result).toBe('foo bar');
    });
    test('when query has a substitution and plain text was added after it', function () {
        // given this previous query: "foo from:@mateusz"
        var userTypedQuery = 'foo from:Mat test';
        var substitutionsMock = {
            'from:Mat': '@mateusz',
        };
        var result = (0, getQueryWithSubstitutions_1.getQueryWithSubstitutions)(userTypedQuery, substitutionsMock);
        expect(result).toBe('foo from:@mateusz test');
    });
    test('when query has a substitution and plain text was added after before it', function () {
        // given this previous query: "foo from:@mateusz1"
        var userTypedQuery = 'foo bar from:Mat1';
        var substitutionsMock = {
            'from:Mat1': '@mateusz1',
        };
        var result = (0, getQueryWithSubstitutions_1.getQueryWithSubstitutions)(userTypedQuery, substitutionsMock);
        expect(result).toBe('foo bar from:@mateusz1');
    });
    test('when query has a substitution and then it was removed', function () {
        // given this previous query: "foo from:@mateusz"
        var userTypedQuery = 'foo from:Ma';
        var substitutionsMock = {
            'from:Mat': '@mateusz',
        };
        var result = (0, getQueryWithSubstitutions_1.getQueryWithSubstitutions)(userTypedQuery, substitutionsMock);
        expect(result).toBe('foo from:Ma');
    });
    test('when query has a substitution and then it was changed', function () {
        // given this previous query: "foo from:@mateusz1"
        var userTypedQuery = 'foo from:Maat1';
        var substitutionsMock = {
            'from:Mat1': '@mateusz1',
        };
        var result = (0, getQueryWithSubstitutions_1.getQueryWithSubstitutions)(userTypedQuery, substitutionsMock);
        expect(result).toBe('foo from:Maat1');
    });
    test('when query has multiple substitutions and one was changed on the last position', function () {
        // given this previous query: "foo in:123,456 from:@jakub"
        // oldHumanReadableQ = 'foo in:admin,admins from:Jakub'
        var userTypedQuery = 'foo in:admin,admins from:Jakub2';
        var substitutionsMock = {
            'in:admin': '123',
            'in:admins': '456',
            'from:Jakub': '@jakub',
        };
        var result = (0, getQueryWithSubstitutions_1.getQueryWithSubstitutions)(userTypedQuery, substitutionsMock);
        expect(result).toBe('foo in:123,456 from:Jakub2');
    });
    test('when query has multiple substitutions and one was changed in the middle', function () {
        // given this previous query: "foo in:aabbccdd123,zxcv123 from:@jakub"
        var userTypedQuery = 'foo in:wave2,waveControl from:zzzz';
        var substM = {
            'in:wave': 'aabbccdd123',
            'in:waveControl': 'zxcv123',
        };
        var result = (0, getQueryWithSubstitutions_1.getQueryWithSubstitutions)(userTypedQuery, substM);
        expect(result).toBe('foo in:wave2,zxcv123 from:zzzz');
    });
});
