import {BANNED_RULE_ID, ONYX_READ_BAN, ONYX_UTILS_IMPORT_BAN, collectDisableDirectivesFromSource, findNewBypasses} from '../../scripts/onyxConnectBypass';

const ONYX_CONNECT_CALL = `Onyx${'.connect'}`;
const onyxConnectCall = (key: string): string => `${ONYX_CONNECT_CALL}({key: "${key}"});`;

describe('collectDisableDirectivesFromSource', () => {
    it('keeps only disable directives that name the no-onyx-connect ban', () => {
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
        const source = ['/* eslint-disable */', onyxConnectCall('x'), '// eslint-disable-next-line'].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags a blanket disable covering a spaced or split Onyx.connect call', () => {
        const spaced = ['/* eslint-disable */', `Onyx${' . connect'} ({key: "x"});`].join('\n');
        const split = ['/* eslint-disable */', `Onyx${'.'}`, '    connect({key: "x"});'].join('\n');

        expect(collectDisableDirectivesFromSource(spaced, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(split, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags a blanket disable covering commented or parenthesized Onyx.connect calls', () => {
        const commented = ['/* eslint-disable */', `Onyx${' /* x */ . connect'}({key: "x"});`].join('\n');
        const parenthesized = ['/* eslint-disable */', `(Onyx)${'.connect'}({key: "x"});`].join('\n');

        expect(collectDisableDirectivesFromSource(commented, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(parenthesized, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags a blanket disable covering an optional-chained Onyx.connect call', () => {
        const optionalMember = ['/* eslint-disable */', `Onyx?${'.connect'}({key: "x"});`].join('\n');
        const optionalCall = ['/* eslint-disable */', `Onyx${'.connect'}?.({key: "x"});`].join('\n');

        expect(collectDisableDirectivesFromSource(optionalMember, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(optionalCall, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('flags blanket line and next-line disables only when they cover a call', () => {
        const source = [`${onyxConnectCall('line')} // eslint-disable-line`, '// eslint-disable-next-line', onyxConnectCall('next')].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([
            {file: 'src/libs/Foo.ts', line: 1},
            {file: 'src/libs/Foo.ts', line: 2},
        ]);
    });

    it('flags a multiline blanket eslint-disable-next-line covering the line after the comment ends', () => {
        const source = ['/* eslint-disable-next-line', '*/', onyxConnectCall('x')].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('counts LS/PS line terminators the same way ESLint does for next-line coverage', () => {
        const lineSeparator = '\u2028';
        const paragraphSeparator = '\u2029';
        const ls = `// eslint-disable-next-line${lineSeparator}${onyxConnectCall('x')}`;
        const ps = `// eslint-disable-next-line${paragraphSeparator}${onyxConnectCall('x')}`;

        expect(collectDisableDirectivesFromSource(ls, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(ps, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('ignores blanket disables that do not cover a banned call', () => {
        const source = ['/* eslint-disable */', 'console.log(1);', '// eslint-disable-next-line', 'console.log(2);'].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([]);
    });

    it('ignores a blanket disable after the ban is re-enabled', () => {
        const source = ['/* eslint-disable */', '/* eslint-enable */', onyxConnectCall('x')].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([]);
    });

    it('does not treat eslint-enable-line or eslint-enable-next-line as re-enabling the ban', () => {
        const enableLine = ['/* eslint-disable */', '// eslint-enable-line', onyxConnectCall('x')].join('\n');
        const enableNextLine = ['/* eslint-disable */', '// eslint-enable-next-line', onyxConnectCall('x')].join('\n');

        expect(collectDisableDirectivesFromSource(enableLine, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
        expect(collectDisableDirectivesFromSource(enableNextLine, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('matches a trailing eslint-disable-line that names the ban', () => {
        const source = `${onyxConnectCall('x')} // eslint-disable-line ${BANNED_RULE_ID}\n`;

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('matches a multiline block disable that names the ban after the first line', () => {
        const source = ['/* eslint-disable no-console,', `   ${BANNED_RULE_ID} */`, onyxConnectCall('x')].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('does not treat directive text in a string as an eslint-enable', () => {
        const source = ['/* eslint-disable */', 'const text = "/* eslint-enable */";', onyxConnectCall('x')].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 1}]);
    });

    it('returns nothing when there are no matching directives', () => {
        expect(collectDisableDirectivesFromSource('const x = 1;\n', 'src/libs/Foo.ts')).toEqual([]);
    });
});

describe('findNewBypasses', () => {
    it('flags a bypass in a file with no grandfathered allowance', () => {
        expect(findNewBypasses([{file: 'src/libs/CurrencyUtils.ts', line: 5}])).toEqual([{file: 'src/libs/CurrencyUtils.ts', line: 5}]);
    });

    it('allows grandfathered disables up to their recorded count', () => {
        const bans = [
            {file: 'src/libs/ReportNameUtils.ts', line: 192},
            {file: 'src/libs/ReportNameUtils.ts', line: 201},
            {file: 'src/libs/NextStepUtils.ts', line: 33},
        ];
        expect(findNewBypasses(bans)).toEqual([]);
    });

    it('flags only the overflow when a grandfathered file gains an extra disable', () => {
        const bans = [
            {file: 'src/libs/ReportNameUtils.ts', line: 192},
            {file: 'src/libs/ReportNameUtils.ts', line: 201},
            {file: 'src/libs/ReportNameUtils.ts', line: 300},
        ];
        expect(findNewBypasses(bans)).toEqual([{file: 'src/libs/ReportNameUtils.ts', line: 300}]);
    });

    it('returns nothing for an empty input', () => {
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

    it('allows only the grandfathered addUtilsToWindow disable', () => {
        // Given the existing addUtilsToWindow disable plus one more in that file and one elsewhere
        const bans = [
            {file: 'src/setup/addUtilsToWindow.ts', line: 1},
            {file: 'src/setup/addUtilsToWindow.ts', line: 40},
            {file: 'src/libs/Foo.ts', line: 3},
        ];

        // When the read ban compares them with its grandfather list
        // Then only the file-level dev-console disable survives
        expect(findNewBypasses(bans, ONYX_READ_BAN)).toEqual([
            {file: 'src/setup/addUtilsToWindow.ts', line: 40},
            {file: 'src/libs/Foo.ts', line: 3},
        ]);
    });

    it('covers src but not tests', () => {
        // Given a src file and a test suite
        // When the read ban decides which files it checks
        // Then tests are out of scope, since reads are allowed there and suites assert on Search snapshot keys
        expect(ONYX_READ_BAN.appliesTo('src/pages/Foo.tsx')).toBe(true);
        expect(ONYX_READ_BAN.appliesTo('tests/unit/FooTest.ts')).toBe(false);
    });
});

describe('OnyxUtils import bypasses', () => {
    const onyxUtilsImport = `import OnyxUtils from 'react-native-onyx/dist/${'OnyxUtils'}';`;
    const scan = (lines: string[]) => collectDisableDirectivesFromSource(lines.join('\n'), 'src/libs/Foo.ts', ONYX_UTILS_IMPORT_BAN);

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
