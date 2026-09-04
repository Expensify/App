import {BANNED_RULE_ID, collectDisableDirectivesFromSource, findNewBypasses} from '../../scripts/onyxConnectBypass';

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

    it('flags blanket line and next-line disables only when they cover a call', () => {
        const source = [`${onyxConnectCall('line')} // eslint-disable-line`, '// eslint-disable-next-line', onyxConnectCall('next')].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([
            {file: 'src/libs/Foo.ts', line: 1},
            {file: 'src/libs/Foo.ts', line: 2},
        ]);
    });

    it('ignores blanket disables that do not cover a banned call', () => {
        const source = ['/* eslint-disable */', 'console.log(1);', '// eslint-disable-next-line', 'console.log(2);'].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([]);
    });

    it('ignores a blanket disable after the ban is re-enabled', () => {
        const source = ['/* eslint-disable */', '/* eslint-enable */', onyxConnectCall('x')].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([]);
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
