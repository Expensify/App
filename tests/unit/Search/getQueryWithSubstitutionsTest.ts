/* eslint-disable @typescript-eslint/naming-convention */
// we need "dirty" object key names in these tests
import {getQueryWithSubstitutions} from '@src/components/Search/SearchRouter/getQueryWithSubstitutions';

describe('getQueryWithSubstitutions should compute and return correct new query', () => {
    test('when both queries contain no substitutions', () => {
        // given this previous query: "foo"
        const userTypedQuery = 'foo bar';
        const substitutionsMock = {};

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock);

        expect(result).toBe('foo bar');
    });

    test('when query has a substitution and plain text was added after it', () => {
        // given this previous query: "foo from:@mateusz"
        const userTypedQuery = 'foo from:Mat test';
        const substitutionsMock = {
            'from:Mat': {
                value: '@mateusz',
            },
        };

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock);

        expect(result).toBe('foo from:@mateusz test');
    });

    test('when query has a substitution and plain text was added after before it', () => {
        // given this previous query: "foo from:@mateusz1"
        const userTypedQuery = 'foo bar from:Mat1';
        const substitutionsMock = {
            'from:Mat1': {
                value: '@mateusz1',
            },
        };

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock);

        expect(result).toBe('foo bar from:@mateusz1');
    });

    test('when query has a substitution and then it was removed', () => {
        // given this previous query: "foo from:@mateusz"
        const userTypedQuery = 'foo from:Ma';
        const substitutionsMock = {
            'from:Mat': {
                value: '@mateusz',
            },
        };

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock);

        expect(result).toBe('foo from:Ma');
    });

    test('when query has a substitution and then it was changed', () => {
        // given this previous query: "foo from:@mateusz1"
        const userTypedQuery = 'foo from:Maat1';
        const substitutionsMock = {
            'from:Mat1': {
                value: '@mateusz1',
            },
        };

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock);

        expect(result).toBe('foo from:Maat1');
    });

    test('when query has multiple substitutions and one was changed on the last position', () => {
        // given this previous query: "foo in:123,456 from:@jakub"
        // oldHumanReadableQ = 'foo in:admin,admins from:Jakub'
        const userTypedQuery = 'foo in:admin,admins from:Jakub2';
        const substitutionsMock = {
            'in:admin': {
                value: '123',
            },
            'in:admins': {
                value: '456',
            },
            'from:Jakub': {
                value: '@jakub',
            },
        };

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock);

        expect(result).toBe('foo in:123,456 from:Jakub2');
    });

    test('when query has multiple substitutions and one was changed in the middle', () => {
        // given this previous query: "foo in:aabbccdd123,zxcv123 from:@jakub"
        const userTypedQuery = 'foo in:wave2,waveControl from:zzzz';

        const substM = {
            'in:wave': {
                value: 'aabbccdd123',
            },
            'in:waveControl': {
                value: 'zxcv123',
            },
        };

        const result = getQueryWithSubstitutions(userTypedQuery, substM);

        expect(result).toBe('foo in:wave2,zxcv123 from:zzzz');
    });
});
