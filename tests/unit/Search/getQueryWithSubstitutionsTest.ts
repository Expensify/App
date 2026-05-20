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
            'from:Mat': '@mateusz',
        };

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock);

        expect(result).toBe('foo from:@mateusz test');
    });

    test('when query has a substitution and plain text was added after before it', () => {
        // given this previous query: "foo from:@mateusz1"
        const userTypedQuery = 'foo bar from:Mat1';
        const substitutionsMock = {
            'from:Mat1': '@mateusz1',
        };

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock);

        expect(result).toBe('foo bar from:@mateusz1');
    });

    test('when query has a substitution and then it was removed', () => {
        // given this previous query: "foo from:@mateusz"
        const userTypedQuery = 'foo from:Ma';
        const substitutionsMock = {
            'from:Mat': '@mateusz',
        };

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock);

        expect(result).toBe('foo from:Ma');
    });

    test('when query has a substitution and then it was changed', () => {
        // given this previous query: "foo from:@mateusz1"
        const userTypedQuery = 'foo from:Maat1';
        const substitutionsMock = {
            'from:Mat1': '@mateusz1',
        };

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock);

        expect(result).toBe('foo from:Maat1');
    });

    test('when query has multiple substitutions and one was changed on the last position', () => {
        // given this previous query: "foo in:123,456 from:@jakub"
        // oldHumanReadableQ = 'foo in:admin,admins from:Jakub'
        const userTypedQuery = 'foo in:admin,admins from:Jakub2';
        const substitutionsMock = {
            'in:admin': '123',
            'in:admins': '456',
            'from:Jakub': '@jakub',
        };

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock);

        expect(result).toBe('foo in:123,456 from:Jakub2');
    });

    test('when query has multiple substitutions and one was changed in the middle', () => {
        // given this previous query: "foo in:aabbccdd123,zxcv123 from:@jakub"
        const userTypedQuery = 'foo in:wave2,waveControl from:zzzz';

        const substM = {
            'in:wave': 'aabbccdd123',
            'in:waveControl': 'zxcv123',
        };

        const result = getQueryWithSubstitutions(userTypedQuery, substM);

        expect(result).toBe('foo in:wave2,zxcv123 from:zzzz');
    });

    test('when query has duplicate workspace names with indexed substitution keys', () => {
        const userTypedQuery = 'workspace:"Test Workspace","Test Workspace","Test Workspace"';
        const substitutionsMock = {
            'policyID:Test Workspace': 'policyA',
            'policyID:Test Workspace:1': 'policyB',
            'policyID:Test Workspace:2': 'policyC',
        };

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock);

        expect(result).toBe('workspace:policyA,policyB,policyC');
    });

    test('when "me" is pasted on a user-based filter and the substitution map is empty, it resolves to currentUserAccountID', () => {
        const userTypedQuery = 'type:expense-report action:submit from:me';
        const substitutionsMock = {};
        const currentUserAccountID = 1234;

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock, currentUserAccountID);

        expect(result).toBe('type:expense-report action:submit from:1234');
    });

    test('when "me" is used on every user-based filter key, each occurrence resolves to currentUserAccountID', () => {
        const userTypedQuery = 'from:me to:me assignee:me payer:me exporter:me attendee:me';
        const substitutionsMock = {};
        const currentUserAccountID = 9876;

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock, currentUserAccountID);

        expect(result).toBe('from:9876 to:9876 assignee:9876 payer:9876 exporter:9876 attendee:9876');
    });

    test('when an existing substitution exists for "me", it takes precedence over currentUserAccountID', () => {
        const userTypedQuery = 'from:me';
        const substitutionsMock = {
            'from:me': '5555',
        };
        const currentUserAccountID = 1234;

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock, currentUserAccountID);

        expect(result).toBe('from:5555');
    });

    test('when "me" is used on a non-user-based filter, it is not resolved to currentUserAccountID', () => {
        const userTypedQuery = 'category:me';
        const substitutionsMock = {};
        const currentUserAccountID = 1234;

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock, currentUserAccountID);

        expect(result).toBe('category:me');
    });

    test('when currentUserAccountID is undefined, "me" is left unresolved', () => {
        const userTypedQuery = 'from:me';
        const substitutionsMock = {};

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock);

        expect(result).toBe('from:me');
    });

    test('when currentUserAccountID is -1 (not signed in), "me" is left unresolved', () => {
        const userTypedQuery = 'from:me';
        const substitutionsMock = {};
        const currentUserAccountID = -1;

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock, currentUserAccountID);

        expect(result).toBe('from:me');
    });
});
