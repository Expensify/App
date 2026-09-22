/* eslint-disable @typescript-eslint/naming-convention */
// we need "dirty" object key names in these tests
import type {PersonalDetailsByLogin} from '@components/PersonalDetailsByLoginProvider';

import {getQueryWithSubstitutions} from '@src/components/Search/SearchRouter/getQueryWithSubstitutions';

const personalDetailsByLogin = {
    'johndoe@example.com': {
        accountID: 12345,
    },
    'janedoe@example.com': {
        accountID: 78901,
    },
} as PersonalDetailsByLogin;

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

    test('when a login is typed out by hand rather than picked from the autocomplete, it resolves to an account ID', () => {
        const userTypedQuery = 'from:johndoe@example.com hello';
        const substitutionsMock = {};

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock, undefined, personalDetailsByLogin);

        expect(result).toBe('from:12345 hello');
    });

    test('when a hand-typed login is used on every user-based filter key, each occurrence resolves', () => {
        const userTypedQuery =
            'from:johndoe@example.com to:janedoe@example.com assignee:johndoe@example.com payer:janedoe@example.com exporter:johndoe@example.com attendee:janedoe@example.com';
        const substitutionsMock = {};

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock, undefined, personalDetailsByLogin);

        expect(result).toBe('from:12345 to:78901 assignee:12345 payer:78901 exporter:12345 attendee:78901');
    });

    test('when a comma separated list mixes hand-typed logins and account IDs, only the logins are resolved', () => {
        const userTypedQuery = 'from:johndoe@example.com,55555,janedoe@example.com';
        const substitutionsMock = {};

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock, undefined, personalDetailsByLogin);

        expect(result).toBe('from:12345,55555,78901');
    });

    test('when a hand-typed login has no personal details, it is left unresolved', () => {
        const userTypedQuery = 'from:nobody@example.com';
        const substitutionsMock = {};

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock, undefined, personalDetailsByLogin);

        expect(result).toBe('from:nobody@example.com');
    });

    test('when an existing substitution exists for a login, it takes precedence over the personal details', () => {
        const userTypedQuery = 'from:johndoe@example.com';
        const substitutionsMock = {
            'from:johndoe@example.com': '5555',
        };

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock, undefined, personalDetailsByLogin);

        expect(result).toBe('from:5555');
    });

    test('when a login is used on a non-user-based filter, it is not resolved to an account ID', () => {
        const userTypedQuery = 'merchant:johndoe@example.com';
        const substitutionsMock = {};

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock, undefined, personalDetailsByLogin);

        expect(result).toBe('merchant:johndoe@example.com');
    });

    test('when personalDetailsByLogin is not passed, a hand-typed login is left unresolved', () => {
        const userTypedQuery = 'from:johndoe@example.com';
        const substitutionsMock = {};

        const result = getQueryWithSubstitutions(userTypedQuery, substitutionsMock);

        expect(result).toBe('from:johndoe@example.com');
    });
});
