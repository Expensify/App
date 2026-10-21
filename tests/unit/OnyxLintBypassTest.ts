import {BANNED_RULE_ID, ONYX_READ_BAN, ONYX_UTILS_IMPORT_BAN, collectDisableDirectivesFromSource, findNewBypasses} from '../../scripts/onyxLintBypass';

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

    it('does not treat eslint-enable-line or eslint-enable-next-line as re-enabling the ban', () => {
        // Given a blanket disable followed by eslint-enable-line or eslint-enable-next-line before the call
        // When the connect ban scans each
        // Then both still count, since those are not real ESLint directives
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
        // When the overflow is computed
        // Then it is reported as new
        expect(findNewBypasses([{file: 'src/libs/CurrencyUtils.ts', line: 5}])).toEqual([{file: 'src/libs/CurrencyUtils.ts', line: 5}]);
    });

    it('allows grandfathered disables up to their recorded count', () => {
        // Given suppressed bans that match the recorded counts of two grandfathered files
        // When the overflow is computed
        // Then nothing is reported
        const bans = [
            {file: 'src/libs/ReportNameUtils.ts', line: 192},
            {file: 'src/libs/ReportNameUtils.ts', line: 201},
            {file: 'src/libs/NextStepUtils.ts', line: 33},
        ];
        expect(findNewBypasses(bans)).toEqual([]);
    });

    it('flags only the overflow when a grandfathered file gains an extra disable', () => {
        // Given one more suppressed ban than a grandfathered file allows
        // When the overflow is computed
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
        // When the overflow is computed
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
        // Then it counts, because a blanket directive silences the rule just as well as a named one
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
        // Then it is left to the connect ban, since each ban only owns its own rule
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
        // Given linted files under src, .storybook, scripts and tests, plus a doc and a patch
        // When the read ban decides which files it checks
        // Then every linted file outside tests is in scope, since reads are allowed in suites and they assert on Search snapshot keys
        expect(ONYX_READ_BAN.appliesTo('src/pages/Foo.tsx')).toBe(true);
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
        // Then the blanket directive counts, because alias collection repeats until no new alias appears instead of taking one pass
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 3}]);
    });

    it('frees a blanket disable only through an enable that is blanket or names this ban', () => {
        // Given a blanket disable, then an enable naming the read ban, no-console, or the connect ban, then a read
        const forRead = ['/* eslint-disable */', '/* eslint-enable rulesdir/no-unsafe-onyx-read */', onyxReadCall].join('\n');
        const forConsole = ['/* eslint-disable */', '/* eslint-enable no-console */', onyxReadCall].join('\n');
        const forConnect = ['/* eslint-disable */', '/* eslint-enable rulesdir/no-onyx-connect */', onyxReadCall].join('\n');

        // When the read ban scans each
        // Then only the enable that names the read ban frees it
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

    it('splits the description only on a spaced double dash, as ESLint does', () => {
        // Given a directive where `--` touches a rule name, so ESLint reads the whole text as rule names
        const source = ['/* eslint-disable no-console--x, rulesdir/no-unsafe-onyx-read */', onyxReadCall].join('\n');

        // When the read ban scans it
        // Then the disable counts, because the read rule is still part of the rule list
        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('ignores block-form directives written as line comments, as ESLint does', () => {
        // Given a blanket block disable followed by `// eslint-enable`, and a `// eslint-disable` line comment, each above a read
        const lineEnable = ['/* eslint-disable */', '// eslint-enable', onyxReadCall].join('\n');
        const lineDisable = ['// eslint-disable', onyxReadCall].join('\n');

        // When the read ban scans each
        // Then the block disable still counts, since the line-comment enable is not a directive to ESLint, and the line-comment disable silences nothing
        expect(collectDisableDirectivesFromSource(lineEnable, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(lineDisable, 'src/libs/Foo.ts', ONYX_READ_BAN)).toEqual([]);
    });

    it('treats a malformed enable as a plain comment', () => {
        // Given a blanket disable, then `eslint-enable**` and `eslint-enable,rule` comments, then a read
        const stars = ['/* eslint-disable */', '/* eslint-enable**/', onyxReadCall].join('\n');
        const comma = ['/* eslint-disable */', '/* eslint-enable,rulesdir/no-unsafe-onyx-read */', onyxReadCall].join('\n');

        // When the read ban scans each
        // Then the disable still counts, because ESLint needs whitespace after the keyword to honor an enable
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

    it('flags a blanket disable over an OnyxUtils import', () => {
        // Given a blanket disable over the import
        // When the OnyxUtils ban scans it
        // Then it counts, because a blanket directive silences the restriction just as well
        expect(scan(['// eslint-disable-next-line', onyxUtilsImport])).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags re-exports and import-equals of OnyxUtils', () => {
        // Given other runtime forms the restriction also reports
        // When the OnyxUtils ban scans them
        // Then each disable counts, so the ban cannot be dodged by changing the import syntax
        expect(scan(['// eslint-disable-next-line @typescript-eslint/no-restricted-imports', `export {default} from 'react-native-onyx/dist/${'OnyxUtils'}';`])).toEqual([
            {file: 'src/libs/Foo.ts', line: 1},
        ]);
        expect(scan(['// eslint-disable-next-line @typescript-eslint/no-restricted-imports', `import OnyxUtils = require('react-native-onyx/dist/${'OnyxUtils'}');`])).toEqual([
            {file: 'src/libs/Foo.ts', line: 1},
        ]);
    });

    it('ignores restricted-imports disables over other modules', () => {
        // Given the many existing disables that silence the rule for unrelated paths
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
        // Then it is reported
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
