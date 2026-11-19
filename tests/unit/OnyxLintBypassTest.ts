import fs from 'fs';
import path from 'path';

import {
    BANNED_RULE_ID,
    ONYX_READ_BAN,
    ONYX_UTILS_IMPORT_BAN,
    SEATBELT_FORBIDDEN_RULES,
    collectDisableDirectivesFromSource,
    findForbiddenSeatbeltRows,
    findNewBypasses,
} from '../../scripts/onyxLintBypass';

const ONYX_CONNECT_CALL = `Onyx${'.connect'}`;
const onyxConnectCall = (key: string): string => `${ONYX_CONNECT_CALL}({key: "${key}"});`;

describe('collectDisableDirectivesFromSource', () => {
    it('keeps only disable directives that name the no-onyx-connect ban', () => {
        // Given a file with a no-console disable, a named connect-ban disable and a block no-console disable
        // When the connect ban scans it
        // Then only the directive that names the ban is reported, with its line
        const source = [
            '// eslint-disable-next-line no-console',
            'console.log(1);',
            `// eslint-disable-next-line ${BANNED_RULE_ID}`,
            onyxConnectCall('x'),
            '/* eslint-disable no-console */',
        ].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 3}]);
    });

    it('flags a blanket eslint-disable that covers a banned call', () => {
        // Given a blanket block disable above a connect call and a dangling next-line directive after it
        // When the connect ban scans it
        // Then the block counts and the dangling directive does not, since only the block covers the call
        const source = ['/* eslint-disable */', onyxConnectCall('x'), '// eslint-disable-next-line'].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags a blanket disable covering a spaced or split Onyx.connect call', () => {
        // Given a connect call written with spaces around the dot and one split across lines
        // When the connect ban scans each
        // Then both count, because the AST sees the call that a text match would miss
        const spaced = ['/* eslint-disable */', `Onyx${' . connect'} ({key: "x"});`].join('\n');
        const split = ['/* eslint-disable */', `Onyx${'.'}`, '    connect({key: "x"});'].join('\n');

        expect(collectDisableDirectivesFromSource(spaced, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(split, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags a blanket disable covering commented or parenthesized Onyx.connect calls', () => {
        // Given a connect call with a comment inside the member access and one wrapped in parentheses
        // When the connect ban scans each
        // Then both count, since comments and parentheses do not change the call
        const commented = ['/* eslint-disable */', `Onyx${' /* x */ . connect'}({key: "x"});`].join('\n');
        const parenthesized = ['/* eslint-disable */', `(Onyx)${'.connect'}({key: "x"});`].join('\n');

        expect(collectDisableDirectivesFromSource(commented, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(parenthesized, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags a blanket disable covering an optional-chained Onyx.connect call', () => {
        // Given a connect call written with optional chaining on the member and on the call
        // When the connect ban scans each
        // Then both count, because optional chaining produces different AST node types that must still match
        const optionalMember = ['/* eslint-disable */', `Onyx?${'.connect'}({key: "x"});`].join('\n');
        const optionalCall = ['/* eslint-disable */', `Onyx${'.connect'}?.({key: "x"});`].join('\n');

        expect(collectDisableDirectivesFromSource(optionalMember, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(optionalCall, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags blanket line and next-line disables only when they cover a call', () => {
        // Given a trailing eslint-disable-line on a call and a next-line directive above another
        // When the connect ban scans it
        // Then both directives count, each on its own line
        const source = [`${onyxConnectCall('line')} // eslint-disable-line`, '// eslint-disable-next-line', onyxConnectCall('next')].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([
            {file: 'src/libs/Foo.ts', line: 1},
            {file: 'src/libs/Foo.ts', line: 2},
        ]);
    });

    it('flags a multiline blanket eslint-disable-next-line covering the line after the comment ends', () => {
        // Given a block next-line directive whose closing marker sits on a later line, followed by a call
        // When the connect ban scans it
        // Then it counts, because ESLint measures next-line from where the comment ends
        const source = ['/* eslint-disable-next-line', '*/', onyxConnectCall('x')].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('counts LS/PS line terminators the same way ESLint does for next-line coverage', () => {
        // Given a next-line directive separated from the call by a line separator or paragraph separator character
        // When the connect ban scans each
        // Then both count, since ESLint treats those characters as line breaks
        const lineSeparator = '\u2028';
        const paragraphSeparator = '\u2029';
        const ls = `// eslint-disable-next-line${lineSeparator}${onyxConnectCall('x')}`;
        const ps = `// eslint-disable-next-line${paragraphSeparator}${onyxConnectCall('x')}`;

        expect(collectDisableDirectivesFromSource(ls, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(ps, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('ignores blanket disables that do not cover a banned call', () => {
        // Given blanket disables over code that never calls Onyx.connect
        // When the connect ban scans it
        // Then nothing is reported, so unrelated blanket comments keep working
        const source = ['/* eslint-disable */', 'console.log(1);', '// eslint-disable-next-line', 'console.log(2);'].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([]);
    });

    it('ignores a blanket disable after the ban is re-enabled', () => {
        // Given a blanket disable followed by a blanket enable before the call
        // When the connect ban scans it
        // Then nothing is reported, because the enable frees the call
        const source = ['/* eslint-disable */', '/* eslint-enable */', onyxConnectCall('x')].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([]);
    });

    it('matches oxlint-disable directives the same way as eslint-disable', () => {
        // Given a named oxlint-disable-next-line, a blanket oxlint-disable block and a trailing oxlint-disable-line, each over a connect call
        const named = [`// oxlint-disable-next-line ${BANNED_RULE_ID}`, onyxConnectCall('x')].join('\n');
        const blanket = ['/* oxlint-disable */', onyxConnectCall('x')].join('\n');
        const trailing = `${onyxConnectCall('x')} // oxlint-disable-line`;

        // When the connect ban scans each
        // Then each counts, because oxlint honors the oxlint- prefix exactly like eslint-
        expect(collectDisableDirectivesFromSource(named, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(blanket, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(trailing, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('lets an enable of either prefix reopen a disable of the other', () => {
        // Given an eslint-disable block closed by oxlint-enable, and an oxlint-disable block closed by eslint-enable, before a call
        const eslintThenOxlint = ['/* eslint-disable */', '/* oxlint-enable */', onyxConnectCall('x')].join('\n');
        const oxlintThenEslint = ['/* oxlint-disable */', '/* eslint-enable */', onyxConnectCall('x')].join('\n');

        // When the connect ban scans each
        // Then nothing is reported, because oxlint treats the two prefixes as one directive family
        expect(collectDisableDirectivesFromSource(eslintThenOxlint, 'src/libs/Foo.ts')).toEqual([]);
        expect(collectDisableDirectivesFromSource(oxlintThenEslint, 'src/libs/Foo.ts')).toEqual([]);
    });

    it('does not treat eslint-enable-line or eslint-enable-next-line as re-enabling the ban', () => {
        // Given a blanket disable followed by eslint-enable-line or eslint-enable-next-line before the call
        // When the connect ban scans each
        // Then both still count, since oxlint reads neither as an enable
        const enableLine = ['/* eslint-disable */', '// eslint-enable-line', onyxConnectCall('x')].join('\n');
        const enableNextLine = ['/* eslint-disable */', '// eslint-enable-next-line', onyxConnectCall('x')].join('\n');

        expect(collectDisableDirectivesFromSource(enableLine, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(enableNextLine, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('matches a trailing eslint-disable-line that names the ban', () => {
        // Given a connect call with a trailing disable-line that names the ban
        // When the connect ban scans it
        // Then it counts on the call's line
        const source = `${onyxConnectCall('x')} // eslint-disable-line ${BANNED_RULE_ID}\n`;

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('matches a multiline block disable that names the ban after the first line', () => {
        // Given a block disable that lists the ban on its second line
        // When the connect ban scans it
        // Then it counts, because the whole comment text is parsed
        const source = ['/* eslint-disable no-console,', `   ${BANNED_RULE_ID} */`, onyxConnectCall('x')].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('does not treat directive text in a string as an eslint-enable', () => {
        // Given a blanket disable, then a string literal that looks like an enable comment, then a call
        // When the connect ban scans it
        // Then the disable still counts, since only real comments are directives
        const source = ['/* eslint-disable */', 'const text = "/* eslint-enable */";', onyxConnectCall('x')].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('returns nothing when there are no matching directives', () => {
        // Given a file without any directive
        // When the connect ban scans it
        // Then nothing is reported
        expect(collectDisableDirectivesFromSource('const x = 1;\n', 'src/libs/Foo.ts')).toEqual([]);
    });
});

describe('no-onyx-connect member uses', () => {
    it('flags a blanket disable over an alias of Onyx.connect', () => {
        // Given the connect method aliased into a const under a blanket disable, with the call on the next line
        const alias = ['// eslint-disable-next-line', `const c = ${ONYX_CONNECT_CALL};`, 'c({key: "x"});'].join('\n');

        // When the connect ban scans it
        // Then it counts, because no-onyx-connect reports on the member access, not only on a call
        expect(collectDisableDirectivesFromSource(alias, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('ignores a blanket disable inside a connect callback', () => {
        // Given a blanket next-line directive on a line inside the callback body of Onyx.connect
        const source = [`${ONYX_CONNECT_CALL}({`, '    key: "x",', '    callback: () => {', '        // eslint-disable-next-line', '        doSomething();', '    },', '});'].join('\n');

        // When the connect ban scans it
        // Then nothing is reported, since the rule reports on the call itself and only a directive on its first line silences that
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([]);
    });
});

describe('findNewBypasses', () => {
    it('flags a bypass in a file with no grandfathered allowance', () => {
        // Given one suppressed ban in a file with no allowance
        // When the bans are compared with the grandfathered counts
        // Then it is reported as new, since no allowance covers it
        expect(findNewBypasses([{file: 'src/libs/CurrencyUtils.ts', line: 5}])).toEqual([{file: 'src/libs/CurrencyUtils.ts', line: 5}]);
    });

    it('allows grandfathered disables up to their recorded count', () => {
        // Given suppressed bans that match the recorded counts of two grandfathered files
        // When the bans are compared with the grandfathered counts
        // Then nothing is reported, since each file stays within its allowance
        const bans = [
            {file: 'src/libs/ReportNameUtils.ts', line: 192},
            {file: 'src/libs/ReportNameUtils.ts', line: 201},
            {file: 'src/libs/NextStepUtils.ts', line: 33},
        ];
        expect(findNewBypasses(bans)).toEqual([]);
    });

    it('flags only the overflow when a grandfathered file gains an extra disable', () => {
        // Given one more suppressed ban than a grandfathered file allows
        // When the bans are compared with the grandfathered counts
        // Then only the highest-line extra one is reported
        const bans = [
            {file: 'src/libs/ReportNameUtils.ts', line: 192},
            {file: 'src/libs/ReportNameUtils.ts', line: 201},
            {file: 'src/libs/ReportNameUtils.ts', line: 300},
        ];
        expect(findNewBypasses(bans)).toEqual([{file: 'src/libs/ReportNameUtils.ts', line: 300}]);
    });

    it('returns nothing for an empty input', () => {
        // Given no suppressed bans
        // When the bans are compared with the grandfathered counts
        // Then nothing is reported
        expect(findNewBypasses([])).toEqual([]);
    });
});

describe('no-unsafe-onyx-read bypasses', () => {
    const onyxReadCall = `await Onyx${'.get'}(ONYXKEYS.SESSION);`;

    it('flags a disable that names the rule', () => {
        // Given a src file that silences no-unsafe-onyx-read on the next line
        const source = ['// eslint-disable-next-line rulesdir/no-unsafe-onyx-read', onyxReadCall].join('\n');

        // When the read ban scans it
        const suppressed = collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN);

        // Then the directive counts as a bypass, since the rule must not be silenced inline
        expect(suppressed).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags a blanket disable that covers an Onyx.get call', () => {
        // Given a blanket disable over a read
        const source = ['/* eslint-disable */', onyxReadCall].join('\n');

        // When the read ban scans it
        // Then it counts, because a blanket directive silences the rule the same as a named one
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags a blanket disable that covers an Onyx.multiGet call', () => {
        // Given a blanket disable over a multi-key read
        const source = ['/* eslint-disable */', `await Onyx${'.multiGet'}([ONYXKEYS.SESSION]);`].join('\n');

        // When the read ban scans it
        // Then it counts, because the rule checks multiGet the same way it checks get
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags a blanket disable over an aliased read', () => {
        // Given the Onyx import under another name, a destructured read method and a member alias, each under a blanket disable
        const aliasedImport = ["import O from 'react-native-onyx';", '// eslint-disable-next-line', `await O${'.get'}(ONYXKEYS.SESSION);`].join('\n');
        const destructured = ["import Onyx from 'react-native-onyx';", `const {get: read} = Onyx;`, '// eslint-disable-next-line', 'await read(ONYXKEYS.SESSION);'].join('\n');
        const memberAlias = [
            "import Onyx from 'react-native-onyx';",
            `const api = Onyx; const readMany = api${'.multiGet'};`,
            '// eslint-disable-next-line',
            'await readMany([ONYXKEYS.SESSION]);',
        ].join('\n');

        // When the read ban scans each
        // Then every one counts, since the lint rules resolve these aliases and the directive silences them the same way
        expect(collectDisableDirectivesFromSource(aliasedImport, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 2}]);
        expect(collectDisableDirectivesFromSource(destructured, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 3}]);
        expect(collectDisableDirectivesFromSource(memberAlias, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 3}]);
    });

    it('flags a blanket disable over a read reached through a string-literal property', () => {
        // Given the read method reached by `Onyx['get']`, a quoted destructuring key, a computed quoted key, and a quoted member alias
        const bracket = ["import Onyx from 'react-native-onyx';", '// eslint-disable-next-line', `await Onyx${"['get']"}(ONYXKEYS.SESSION);`].join('\n');
        const quotedKey = ["import Onyx from 'react-native-onyx';", `const {'get': read} = Onyx;`, '// eslint-disable-next-line', 'await read(ONYXKEYS.SESSION);'].join('\n');
        const computedKey = ["import Onyx from 'react-native-onyx';", `const {['get']: read} = Onyx;`, '// eslint-disable-next-line', 'await read(ONYXKEYS.SESSION);'].join('\n');
        const quotedMember = ["import Onyx from 'react-native-onyx';", `const readMany = Onyx${"['multiGet']"};`, '// eslint-disable-next-line', 'await readMany([ONYXKEYS.SESSION]);'].join(
            '\n',
        );

        // When the read ban scans each
        // Then every one counts, since the lint rules resolve a string-literal property the same as an identifier
        expect(collectDisableDirectivesFromSource(bracket, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 2}]);
        expect(collectDisableDirectivesFromSource(quotedKey, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 3}]);
        expect(collectDisableDirectivesFromSource(computedKey, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 3}]);
        expect(collectDisableDirectivesFromSource(quotedMember, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 3}]);
    });

    it('flags a quoted rule name, which ESLint reads like the bare one', () => {
        // Given a disable that names the rule in quotes
        const source = ["// eslint-disable-next-line 'rulesdir/no-unsafe-onyx-read'", onyxReadCall].join('\n');

        // When the read ban scans it
        // Then it counts, since ESLint strips the quotes and honors the directive
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags a blanket disable on an inner line of a multi-line multiGet', () => {
        // Given a key list spread over several lines, with a blanket next-line directive on an element line and a block pair around another
        const source = [
            `await Onyx${'.multiGet'}([`,
            '    ONYXKEYS.SESSION,',
            '    // eslint-disable-next-line',
            '    ONYXKEYS.COLLECTION.REPORT,',
            '    /* eslint-disable */',
            '    ONYXKEYS.PERSONAL_DETAILS_LIST,',
            '    /* eslint-enable */',
            ']);',
        ].join('\n');

        // When the read ban scans it
        // Then both count, since a directive inside the call is a bypass attempt even though both rules report on the call line
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([
            {file: 'src/libs/Foo.ts', line: 3},
            {file: 'src/libs/Foo.ts', line: 5},
        ]);
    });

    it('ignores a blanket disable that covers no read', () => {
        // Given a blanket disable over code that never reads Onyx
        const source = ['/* eslint-disable */', 'console.log(1);'].join('\n');

        // When the read ban scans it
        // Then nothing is reported, so unrelated blanket comments keep working
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([]);
    });

    it('does not treat a no-onyx-connect disable as a read bypass', () => {
        // Given a disable of the connect ban
        const source = [`// eslint-disable-next-line ${BANNED_RULE_ID}`, onyxReadCall].join('\n');

        // When the read ban scans it
        // Then it is left to the connect ban, since each ban checks only its own rule
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([]);
    });

    it('grandfathers nothing', () => {
        // Given suppressed read bans in the dev-console file and elsewhere
        const bans = [
            {file: 'src/setup/addUtilsToWindow.ts', line: 1},
            {file: 'src/libs/Foo.ts', line: 3},
        ];

        // When the read ban compares them with its grandfather list
        // Then every one is new, since no file is allowed to silence the read rule
        expect(findNewBypasses(bans, ONYX_READ_BAN)).toEqual(bans);
    });

    it('covers every file the rule lints except tests', () => {
        // Given linted files under src, .storybook, scripts, __mocks__ and tests, plus a doc and a patch
        // When the read ban decides which files it checks
        // Then every linted file outside tests is in scope, since suites may read Onyx and assert on Search snapshot keys,
        // while module mocks stay in scope because the rule still reports reads there
        expect(ONYX_READ_BAN.appliesTo('src/pages/Foo.tsx')).toBe(true);
        expect(ONYX_READ_BAN.appliesTo('__mocks__/react-native-onyx.ts')).toBe(true);
        expect(ONYX_READ_BAN.appliesTo('.storybook/preview.tsx')).toBe(true);
        expect(ONYX_READ_BAN.appliesTo('scripts/foo.ts')).toBe(true);
        expect(ONYX_READ_BAN.appliesTo('tests/unit/FooTest.ts')).toBe(false);
        // Docs and patches quote directives that ESLint never honors
        expect(ONYX_READ_BAN.appliesTo('contributingGuides/LINTING.md')).toBe(false);
        expect(ONYX_READ_BAN.appliesTo('patches/foo+1.0.0.patch')).toBe(false);
    });

    it('flags an alias resolved before its declaration', () => {
        // Given a read through an alias of an alias, where the Onyx alias is declared after the function that uses it
        const source = ['function f() {', `    const read = api${'.get'};`, '    // eslint-disable-next-line', '    read(ONYXKEYS.SESSION);', '}', 'const api = Onyx;'].join('\n');

        // When the read ban scans it
        // Then the blanket directive counts, because alias collection repeats until no new alias appears, so declaration order does not matter
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 3}]);
    });

    it('frees a blanket disable only through an enable that is blanket or names this ban', () => {
        // Given a blanket disable, then an enable naming the read ban, no-console, or the connect ban, then a read
        const forRead = ['/* eslint-disable */', '/* eslint-enable rulesdir/no-unsafe-onyx-read */', onyxReadCall].join('\n');
        const forConsole = ['/* eslint-disable */', '/* eslint-enable no-console */', onyxReadCall].join('\n');
        const forConnect = ['/* eslint-disable */', '/* eslint-enable rulesdir/no-onyx-connect */', onyxReadCall].join('\n');

        // When the read ban scans each
        // Then only the enable that names the read ban frees it, since an enable of another rule leaves this ban disabled
        expect(collectDisableDirectivesFromSource(forRead, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([]);
        expect(collectDisableDirectivesFromSource(forConsole, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(forConnect, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('ignores a block disable that starts after the read', () => {
        // Given a read followed by a blanket block disable
        const source = [onyxReadCall, '/* eslint-disable */'].join('\n');

        // When the read ban scans it
        // Then nothing is reported, since the directive covers only what comes after it
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([]);
    });

    it('splits the description on a bare double dash, as oxlint does', () => {
        // Given a directive where `--` touches a rule name before the read rule, one where it touches the read rule itself, and a blanket disable with only a description
        const otherRuleFirst = ['/* eslint-disable no-console--x, rulesdir/no-unsafe-onyx-read */', onyxReadCall].join('\n');
        const banThenDashes = ['/* eslint-disable rulesdir/no-unsafe-onyx-read--x */', onyxReadCall].join('\n');
        const blanketWithDescription = ['/* eslint-disable --x */', onyxReadCall].join('\n');

        // When the read ban scans each
        // Then the first is not reported, because oxlint reads `x, rulesdir/no-unsafe-onyx-read` as the description and disables only no-console,
        // while the other two count: the ban is named before the dashes, and an empty rule list is a blanket disable over the read
        expect(collectDisableDirectivesFromSource(otherRuleFirst, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([]);
        expect(collectDisableDirectivesFromSource(banThenDashes, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(blanketWithDescription, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('reads block-form directives written as line comments, as oxlint does', () => {
        // Given a blanket block disable followed by `// eslint-enable`, and `// eslint-disable` and `// oxlint-disable` line comments, each above a read
        const lineEnable = ['/* eslint-disable */', '// eslint-enable', onyxReadCall].join('\n');
        const lineDisable = ['// eslint-disable', onyxReadCall].join('\n');
        const oxlintLineDisable = ['// oxlint-disable', onyxReadCall].join('\n');

        // When the read ban scans each
        // Then the line-comment enable frees the read, and each line-comment disable counts, because oxlint, unlike ESLint, honors both forms
        expect(collectDisableDirectivesFromSource(lineEnable, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([]);
        expect(collectDisableDirectivesFromSource(lineDisable, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(oxlintLineDisable, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('treats a malformed enable as a plain comment', () => {
        // Given a blanket disable, then `eslint-enable**` and `eslint-enable,rule` comments, then a read
        const stars = ['/* eslint-disable */', '/* eslint-enable**/', onyxReadCall].join('\n');
        const comma = ['/* eslint-disable */', '/* eslint-enable,rulesdir/no-unsafe-onyx-read */', onyxReadCall].join('\n');

        // When the read ban scans each
        // Then the disable still counts, because oxlint needs whitespace after the keyword to honor an enable
        expect(collectDisableDirectivesFromSource(stars, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(comma, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('parses a .ts file with an angle-bracket assertion', () => {
        // Given a .ts file with `<string>(x)`, which the jsx plugin would reject, and a named disable over a read
        const source = ['const n = <string>(x);', '// eslint-disable-next-line rulesdir/no-unsafe-onyx-read', onyxReadCall].join('\n');

        // When the read ban scans it as a .ts file
        // Then the file parses and the disable counts
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 2}]);
    });

    it('fails closed when the file cannot be parsed', () => {
        // Given a file with a syntax error Babel cannot recover from, a blanket disable, a named disable in a block comment and a plain comment
        const source = ['/* eslint-disable */', 'const = ;', '/* eslint-disable-next-line', '   rulesdir/no-unsafe-onyx-read */', '// just a note', onyxReadCall].join('\n');

        // When the read ban scans it
        // Then every disable directive is reported, so a broken file cannot hide a bypass, and the plain comment is not
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([
            {file: 'src/libs/Foo.ts', line: 1},
            {file: 'src/libs/Foo.ts', line: 3},
        ]);
    });
});

describe('no-unsafe-onyx-read member uses', () => {
    const onyxImport = "import Onyx from 'react-native-onyx';";

    it('flags a blanket disable over a read method passed as a callback', () => {
        // Given Onyx.get handed to map without being called, under a blanket next-line directive
        const source = [onyxImport, '// eslint-disable-next-line', `const values = await Promise.all(keys.map(Onyx${'.get'}));`].join('\n');

        // When the read ban scans it
        // Then it counts, because no-unsafe-onyx-read reports any reference to the read method that is not a direct call
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 2}]);
    });

    it('flags a blanket disable over a read method stored in a variable', () => {
        // Given Onyx.get assigned to a const under a blanket next-line directive, with no call in the file
        const source = [onyxImport, '// eslint-disable-next-line', `const readOnyx = Onyx${'.get'};`, 'export default readOnyx;'].join('\n');

        // When the read ban scans it
        // Then it counts, since the rule reports the alias declaration itself and an importer's call is out of its reach
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 2}]);
    });

    it('flags a blanket disable over a read invoked through call', () => {
        // Given Onyx.get invoked with .call under a blanket next-line directive
        const source = [onyxImport, '// eslint-disable-next-line', `await Onyx${'.get'}.call(Onyx, ONYXKEYS.SESSION);`].join('\n');

        // When the read ban scans it
        // Then it counts, because the callee is `.call`, so only the member reference identifies the read
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 2}]);
    });

    it('flags a blanket disable over a destructured read method', () => {
        // Given the read method destructured off Onyx under a blanket next-line directive, with no call in the file
        const source = [onyxImport, '// eslint-disable-next-line', 'const {get} = Onyx;', 'export default get;'].join('\n');

        // When the read ban scans it
        // Then it counts, since destructuring takes the method by reference, the same as `const read = Onyx.get`
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 2}]);
    });

    it('ignores a blanket disable over an unrelated line in a file that references a read method', () => {
        // Given a file that passes Onyx.get to map, with a blanket next-line directive over an unrelated line
        const source = [onyxImport, `const values = await Promise.all(keys.map(Onyx${'.get'}));`, '// eslint-disable-next-line', 'console.log(values);'].join('\n');

        // When the read ban scans it
        // Then nothing is reported, because the directive covers no read reference
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([]);
    });

    it('flags a blanket disable over a spread of the Onyx object', () => {
        // Given the Onyx object spread into a local copy under a blanket next-line directive
        const source = [onyxImport, '// eslint-disable-next-line', 'const api = {...Onyx};', `export const load = (key) => api${'.get'}(key);`].join('\n');

        // When the read ban scans it
        // Then it counts, because no-unsafe-onyx-read reports the Onyx object used as a value and the copy hides the read
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 2}]);
    });

    it('flags a blanket disable over a spread of the Onyx object behind a cast', () => {
        // Given the Onyx object spread through a cast under a blanket next-line directive
        const source = [onyxImport, '// eslint-disable-next-line', 'const api = {...(Onyx as typeof Onyx)};'].join('\n');

        // When the read ban scans it
        // Then it counts, because the cast is unwrapped to the spread, which the rule reports as a value use
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 2}]);
    });

    it('flags a blanket disable over an export assignment of the Onyx object', () => {
        // Given `export = Onyx` in a .ts file under a blanket next-line directive
        const source = [onyxImport, '// eslint-disable-next-line', 'export = Onyx;'].join('\n');

        // When the read ban scans it
        // Then it counts, because TSExportAssignment is the one TS parent kept as a value position, and the rule reports the export
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 2}]);
    });

    it('flags a blanket disable over a re-export of the Onyx object under another name', () => {
        // Given the default export of react-native-onyx re-exported by name, and the module re-exported as a namespace, each under a blanket next-line directive
        const named = ['// eslint-disable-next-line', "export {default as Store} from 'react-native-onyx';"].join('\n');
        const namespace = ['// eslint-disable-next-line', "export * as Store from 'react-native-onyx';"].join('\n');

        // When the read ban scans each
        // Then both count, because the rule reports each re-export as a value use that hands the Onyx object to importers
        expect(collectDisableDirectivesFromSource(named, 'src/libs/Store.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Store.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(namespace, 'src/libs/Store.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Store.ts', line: 1}]);
    });

    it('ignores a blanket disable over a type-only re-export from react-native-onyx', () => {
        // Given a type-only re-export from react-native-onyx under a blanket next-line directive
        const source = ['// eslint-disable-next-line', "export type {OnyxEntry} from 'react-native-onyx';"].join('\n');

        // When the read ban scans it
        // Then nothing is reported, because a type reads nothing at runtime and the rule skips it
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Store.ts', ONYX_READ_BAN)).toEqual([]);
    });

    it('treats optional chaining on the Onyx object as a member use', () => {
        // Given a read and a write through optional chaining, each under a blanket next-line directive
        const source = [onyxImport, '// eslint-disable-next-line', `Onyx?.${'get'}(key);`, '// eslint-disable-next-line', 'Onyx?.merge(key, value);'].join('\n');

        // When the read ban scans it
        // Then only the read counts, through the read ban itself, since Onyx as the object of an optional member is not a value use
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 2}]);
    });

    it('ignores value uses of the Onyx object in module mocks but still flags reads there', () => {
        // Given the spread of __mocks__/react-native-onyx.ts and a read, each under a blanket next-line directive
        const source = [onyxImport, '// eslint-disable-next-line', 'const mock = {...Onyx};', '// eslint-disable-next-line', `export const load = (key) => Onyx${'.get'}(key);`].join('\n');

        // When the read ban scans it
        // Then only the read counts, because the rule skips value uses in test infrastructure but its path check still reports reads in __mocks__
        expect(collectDisableDirectivesFromSource(source, '__mocks__/react-native-onyx.ts', ONYX_READ_BAN)).toEqual([{file: '__mocks__/react-native-onyx.ts', line: 4}]);
    });

    it('ignores a blanket disable over the window dev console exposure', () => {
        // Given the addUtilsToWindow shapes, with the Onyx object assigned to window, cast or not, and to globalThis, under blanket next-line directives
        const source = [
            onyxImport,
            '// eslint-disable-next-line',
            'window.Onyx = Onyx;',
            '// eslint-disable-next-line',
            'window.Onyx = Onyx as typeof Onyx & {log: () => void};',
            '// eslint-disable-next-line',
            'globalThis.Onyx = Onyx;',
        ].join('\n');

        // When the read ban scans it
        // Then nothing is reported, because the rule allows that one value use, so the directive hides no read
        expect(collectDisableDirectivesFromSource(source, 'src/setup/addUtilsToWindow.ts', ONYX_READ_BAN)).toEqual([]);
    });

    it('ignores a blanket disable over the dev console exposure on a cast window', () => {
        // Given the Onyx object assigned to the Onyx property of a cast window under a blanket next-line directive
        const source = [onyxImport, '// eslint-disable-next-line', '(window as WindowWithOnyx).Onyx = Onyx;'].join('\n');

        // When the read ban scans it
        // Then nothing is reported, because the cast is unwrapped to window, which the rule allows as the dev console exposure
        expect(collectDisableDirectivesFromSource(source, 'src/setup/addUtilsToWindow.ts', ONYX_READ_BAN)).toEqual([]);
    });

    it('ignores a blanket disable over the dev console exposure through a bracket key', () => {
        // Given the Onyx object assigned to window through a quoted bracket key under a blanket next-line directive
        const source = [onyxImport, '// eslint-disable-next-line', "window['Onyx'] = Onyx;"].join('\n');

        // When the read ban scans it
        // Then nothing is reported, because the bracket key resolves to the same Onyx property the rule allows
        expect(collectDisableDirectivesFromSource(source, 'src/setup/addUtilsToWindow.ts', ONYX_READ_BAN)).toEqual([]);
    });

    it('flags a blanket disable over the Onyx object assigned to another property of window', () => {
        // Given the Onyx object assigned to window.foo under a blanket next-line directive
        const source = [onyxImport, '// eslint-disable-next-line', 'window.foo = Onyx;'].join('\n');

        // When the read ban scans it
        // Then it counts, because only window.Onyx is the dev console exposure and the rule reports any other property
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 2}]);
    });

    it('ignores a blanket disable over a runtime typeof check of the Onyx object', () => {
        // Given a runtime typeof check on the Onyx object under a blanket next-line directive
        const source = [onyxImport, '// eslint-disable-next-line', "if (typeof Onyx === 'object') {", '    init();', '}'].join('\n');

        // When the read ban scans it
        // Then nothing is reported, because typeof only inspects the object and the rule does not report it
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([]);
    });

    it('flags a blanket disable over a member picked by a variable key but not over a write named by a template key', () => {
        // Given an Onyx method picked by a variable key, and merge named by a template literal, each under a blanket next-line directive
        const variableKey = [onyxImport, '// eslint-disable-next-line', 'await Onyx[method](key);'].join('\n');
        const templateKey = [onyxImport, '// eslint-disable-next-line', 'await Onyx[`merge`](key, value);'].join('\n');

        // When the read ban scans each
        // Then only the variable key counts, because the rule reports it by reference and resolves the template key to merge, which is not a read
        expect(collectDisableDirectivesFromSource(variableKey, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 2}]);
        expect(collectDisableDirectivesFromSource(templateKey, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([]);
    });

    it('flags a blanket disable over a read through the default member of a namespace import', () => {
        // Given a read through Onyx.default, and through an alias of it, each under a blanket next-line directive
        const namespaceImport = "import * as Onyx from 'react-native-onyx';";
        const direct = [namespaceImport, '// eslint-disable-next-line', `await Onyx.default${'.get'}(key);`].join('\n');
        const alias = [namespaceImport, 'const api = Onyx.default;', '// eslint-disable-next-line', `await api${'.get'}(key);`].join('\n');

        // When the read ban scans each
        // Then both count, because the rule resolves Onyx.default to the Onyx object
        expect(collectDisableDirectivesFromSource(direct, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 2}]);
        expect(collectDisableDirectivesFromSource(alias, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 3}]);
    });

    it('still flags a blanket disable on an inner line of a multi-line multiGet', () => {
        // Given a multi-line multiGet call with a blanket next-line directive above one of its key lines
        const source = [onyxImport, `await Onyx${'.multiGet'}([`, '    ONYXKEYS.SESSION,', '    // eslint-disable-next-line', '    ONYXKEYS.COLLECTION.REPORT,', ']);'].join('\n');

        // When the read ban scans it
        // Then it counts, because member uses add ranges next to the call range instead of replacing it, so coversInnerLines still applies
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 4}]);
    });
});

describe('OnyxUtils import bypasses', () => {
    const onyxUtilsImport = `import OnyxUtils from 'react-native-onyx/dist/${'OnyxUtils'}';`;
    const scan = (lines: string[]) => collectDisableDirectivesFromSource(lines.join('\n'), 'src/libs/Foo.ts', ONYX_UTILS_IMPORT_BAN);

    it('flags a blanket disable over a side-effect import', () => {
        // Given a bare import of the module with no specifiers, under a blanket disable
        // When the OnyxUtils ban scans it
        // Then it counts, since a side-effect import still loads the runtime module
        expect(scan(['// eslint-disable-next-line', `import 'react-native-onyx/dist/${'OnyxUtils'}';`])).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags a disable of the restricted-imports rule over an OnyxUtils import', () => {
        // Given a src file that silences the import restriction on the OnyxUtils import
        // When the OnyxUtils ban scans it
        // Then the directive counts as a bypass, since OnyxUtils must not be imported at runtime
        expect(scan(['// eslint-disable-next-line @typescript-eslint/no-restricted-imports', onyxUtilsImport])).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(scan([`${onyxUtilsImport} // eslint-disable-line @typescript-eslint/no-restricted-imports`])).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(scan(['/* eslint-disable @typescript-eslint/no-restricted-imports */', onyxUtilsImport])).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags a disable that names the core rule id oxlint reports', () => {
        // Given a src file that silences `no-restricted-imports` under the id oxlint uses, without the `@typescript-eslint/` prefix
        // When the OnyxUtils ban scans it
        // Then the directive counts as a bypass, the same as one naming the old id
        expect(scan(['// eslint-disable-next-line no-restricted-imports', onyxUtilsImport])).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(scan(['/* eslint no-restricted-imports: off */', onyxUtilsImport])).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags a blanket disable over an OnyxUtils import', () => {
        // Given a blanket disable over the import
        // When the OnyxUtils ban scans it
        // Then it counts, because a blanket directive silences the restriction the same as a named one
        expect(scan(['// eslint-disable-next-line', onyxUtilsImport])).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags re-exports and import-equals of OnyxUtils', () => {
        // Given a re-export and an import-equals of OnyxUtils, runtime forms the restriction also reports
        // When the OnyxUtils ban scans them
        // Then each disable counts, so changing the import syntax does not dodge the ban
        expect(scan(['// eslint-disable-next-line @typescript-eslint/no-restricted-imports', `export {default} from 'react-native-onyx/dist/${'OnyxUtils'}';`])).toEqual([
            {file: 'src/libs/Foo.ts', line: 1},
        ]);
        expect(scan(['// eslint-disable-next-line @typescript-eslint/no-restricted-imports', `import OnyxUtils = require('react-native-onyx/dist/${'OnyxUtils'}');`])).toEqual([
            {file: 'src/libs/Foo.ts', line: 1},
        ]);
    });

    it('ignores restricted-imports disables over other modules', () => {
        // Given existing disables that silence the rule for unrelated paths
        const source = [
            '// eslint-disable-next-line @typescript-eslint/no-restricted-imports',
            "import {Text} from 'react-native';",
            onyxUtilsImport.replace('import OnyxUtils', 'import type OnyxUtils'),
        ];

        // When the OnyxUtils ban scans it
        // Then nothing is reported, so only OnyxUtils imports are locked down
        expect(scan(source)).toEqual([]);
    });

    it('ignores type-only OnyxUtils imports', () => {
        // Given type-only imports, which the restriction allows
        // When the OnyxUtils ban scans a disable above each
        // Then nothing is reported, since there is no runtime import to protect
        expect(scan(['// eslint-disable-next-line', `import type {OnyxKey} from 'react-native-onyx/dist/${'OnyxUtils'}';`])).toEqual([]);
        expect(scan(['// eslint-disable-next-line', `import {type OnyxKey} from 'react-native-onyx/dist/${'OnyxUtils'}';`])).toEqual([]);
    });

    it('ignores a disable that names a different rule', () => {
        // Given a disable of another rule over the import
        // When the OnyxUtils ban scans it
        // Then nothing is reported, because that directive cannot silence the import restriction
        expect(scan(['// eslint-disable-next-line no-console', onyxUtilsImport])).toEqual([]);
    });

    it('covers src but not tests', () => {
        // Given a src file and a test suite
        // When the OnyxUtils ban decides which files it checks
        // Then tests are out of scope, matching the Onyx read ban
        expect(ONYX_UTILS_IMPORT_BAN.appliesTo('src/Expensify.tsx')).toBe(true);
        expect(ONYX_UTILS_IMPORT_BAN.appliesTo('tests/unit/FooTest.ts')).toBe(false);
    });
});

describe('eslint config comments', () => {
    const connectFile = ["import Onyx from 'react-native-onyx';", onyxConnectCall('x')];
    const readFile = ["import Onyx from 'react-native-onyx';", `function f() { return Onyx${'.get'}('x'); }`];
    const onyxUtilsRuntimeImport = `import OnyxUtils from 'react-native-onyx/dist/${'OnyxUtils'}';`;
    const onyxUtilsTypeImport = `import type OnyxUtils from 'react-native-onyx/dist/${'OnyxUtils'}';`;

    it.each([
        '/* eslint rulesdir/no-onyx-connect: off */',
        '/* eslint rulesdir/no-onyx-connect: 0 */',
        '/* eslint rulesdir/no-onyx-connect: [0] */',
        '/* eslint rulesdir/no-onyx-connect: warn */',
        '/* eslint "rulesdir/no-onyx-connect": "off" */',
        '/*eslint rulesdir/no-onyx-connect:off*/',
        '/*eslint\n  rulesdir/no-onyx-connect: off\n*/',
        '/* eslint rulesdir/no-onyx-connect: off -- legacy */',
        '/* eslint no-console: 0 rulesdir/no-onyx-connect: 0 */',
        '/* eslint "rulesdir/no-onyx\\u002dconnect": "off" */',
    ])('flags %s wherever it sits in the file', (comment) => {
        // Given a config comment that turns the connect ban off, downgrades it, or names it through a JSON escape
        // When the connect ban scans it above the call and again after the call
        // Then it is reported both times, since ESLint applies a config comment to the whole file
        expect(collectDisableDirectivesFromSource([comment, ...connectFile].join('\n'), 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource([...connectFile, comment].join('\n'), 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 3}]);
    });

    it('ignores comments ESLint does not read as rule configuration', () => {
        // Given a line comment, a JSDoc comment, an eslint-env comment, a global comment, and config comments for another rule
        // When the connect ban scans each one above a connect call
        // Then nothing is reported, since ESLint reads none of them as rule configuration
        const comments = [
            '// eslint rulesdir/no-onyx-connect: off',
            '/** eslint rulesdir/no-onyx-connect: off */',
            '/* eslint-env node */',
            '/* global Onyx */',
            '/* eslint no-console: off */',
            '/* eslint no-console: off -- not rulesdir/no-onyx-connect */',
        ];
        for (const comment of comments) {
            expect(collectDisableDirectivesFromSource([comment, ...connectFile].join('\n'), 'src/libs/Foo.ts')).toEqual([]);
        }
    });

    it('flags a config comment that turns off the read ban', () => {
        // Given a config comment that turns no-unsafe-onyx-read off above a read in a function
        // When the read ban scans it
        // Then it is reported, since it turns the rule off for the whole file
        const source = ['/* eslint rulesdir/no-unsafe-onyx-read: off */', ...readFile].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags a reconfigured import restriction only over a runtime OnyxUtils import', () => {
        // Given a config comment that replaces the no-restricted-imports options with an empty path list
        // When the OnyxUtils ban scans it over a runtime import and over a type-only import
        // Then only the runtime import is reported, since the restriction allows type imports anyway
        const reconfigure = '/* eslint @typescript-eslint/no-restricted-imports: ["error", {"paths": []}] */';

        expect(collectDisableDirectivesFromSource([reconfigure, onyxUtilsRuntimeImport].join('\n'), 'src/libs/Foo.ts', ONYX_UTILS_IMPORT_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(
            collectDisableDirectivesFromSource(['/* eslint @typescript-eslint/no-restricted-imports: off */', onyxUtilsTypeImport].join('\n'), 'src/libs/Foo.ts', ONYX_UTILS_IMPORT_BAN),
        ).toEqual([]);
    });

    it('counts every config comment when the file cannot be parsed', () => {
        // Given a file with a syntax error and a config comment for an unrelated rule
        // When the connect ban scans it
        // Then it is reported, since nothing can be verified without an AST
        const source = ['/* eslint no-console: off */', ...connectFile, 'const = ;', '<<<'].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });
});

describe('findForbiddenSeatbeltRows', () => {
    const header = ['# eslint-seatbelt temporarily allowed errors', '# docs: https://github.com/justjake/eslint-seatbelt#readme'];
    const connectRow = '"../../src/libs/ReportUtils.ts"\t"rulesdir/no-onyx-connect"\t13';

    it('allows rows of the grandfathered connect ban', () => {
        // Given a seatbelt TSV whose only Onyx rows are for no-onyx-connect
        const tsv = [...header, connectRow, '"../../src/libs/Parser.ts"\t"rulesdir/no-onyx-connect"\t1', ''].join('\n');

        // When it is scanned for the forbidden rules
        // Then nothing is reported, since the connect ban keeps its migration backlog in the seatbelt
        expect(findForbiddenSeatbeltRows(tsv, SEATBELT_FORBIDDEN_RULES)).toEqual([]);
    });

    it('reports a no-unsafe-onyx-read row with its line', () => {
        // Given a seatbelt TSV with a no-unsafe-onyx-read row after a connect row, as SEATBELT_INCREASE would write it
        const tsv = [...header, connectRow, '"../../src/libs/ProbeSeatbelt.ts"\t"rulesdir/no-unsafe-onyx-read"\t1', ''].join('\n');

        // When it is scanned for the forbidden rules
        // Then the row is reported with its file and 1-based line, so the lint run can name it
        expect(findForbiddenSeatbeltRows(tsv, SEATBELT_FORBIDDEN_RULES)).toEqual([{file: '../../src/libs/ProbeSeatbelt.ts', rule: 'rulesdir/no-unsafe-onyx-read', line: 4}]);
    });

    it('reports a no-onyx-get-snapshot-key row with its line', () => {
        // Given a seatbelt TSV with a no-onyx-get-snapshot-key row
        const tsv = [...header, '"../../src/pages/Foo.tsx"\t"rulesdir/no-onyx-get-snapshot-key"\t2'].join('\n');

        // When it is scanned for the forbidden rules
        // Then the row is reported, since the snapshot rule cannot be grandfathered either
        expect(findForbiddenSeatbeltRows(tsv, SEATBELT_FORBIDDEN_RULES)).toEqual([{file: '../../src/pages/Foo.tsx', rule: 'rulesdir/no-onyx-get-snapshot-key', line: 3}]);
    });

    it('skips header, comment and blank lines', () => {
        // Given comment lines and blank lines that mention a forbidden rule, around a single forbidden row
        const tsv = [
            '# rulesdir/no-unsafe-onyx-read',
            '',
            '   ',
            '  # "../../src/libs/A.ts"\t"rulesdir/no-unsafe-onyx-read"\t1',
            '"../../src/libs/B.ts"\t"rulesdir/no-unsafe-onyx-read"\t1',
            '',
        ].join('\n');

        // When it is scanned for the forbidden rules
        // Then only the data row is reported, on the line it sits on
        expect(findForbiddenSeatbeltRows(tsv, SEATBELT_FORBIDDEN_RULES)).toEqual([{file: '../../src/libs/B.ts', rule: 'rulesdir/no-unsafe-onyx-read', line: 5}]);
    });

    it('decodes JSON escapes in the rule id like the seatbelt does', () => {
        // Given a row whose rule id spells the slash as a JSON unicode escape
        const tsv = '"../../src/libs/A.ts"\t"rulesdir\\u002fno-unsafe-onyx-read"\t1\r\n';

        // When it is scanned for the forbidden rules
        // Then it is reported, because the seatbelt reads cells as JSON and would honor the row
        expect(findForbiddenSeatbeltRows(tsv, SEATBELT_FORBIDDEN_RULES)).toEqual([{file: '../../src/libs/A.ts', rule: 'rulesdir/no-unsafe-onyx-read', line: 1}]);
    });

    it('finds no forbidden row in the committed seatbelt TSV', () => {
        // Given the seatbelt TSV checked into the repo
        const tsv = fs.readFileSync(path.resolve(__dirname, '../../config/oxlint/oxlint.seatbelt.tsv'), 'utf8');

        // When it is scanned for the forbidden rules
        // Then nothing is reported, so a row added through SEATBELT_INCREASE fails this suite as well as the lint run
        expect(findForbiddenSeatbeltRows(tsv, SEATBELT_FORBIDDEN_RULES)).toEqual([]);
    });
});
