import {BANNED_RULE_ID, collectDisableDirectivesFromSource, findNewBypasses} from '../../scripts/onyxConnectBypass';

describe('collectDisableDirectivesFromSource', () => {
    it('keeps only disable directives that name the no-onyx-connect ban', () => {
        const source = [
            '// eslint-disable-next-line no-console',
            'console.log(1);',
            `// eslint-disable-next-line ${BANNED_RULE_ID}`,
            'Onyx.connect({key: "x"});',
            '/* eslint-disable no-console */',
        ].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([{file: 'src/libs/Foo.ts', line: 3}]);
    });

    it('ignores a blanket eslint-disable that does not name the ban', () => {
        const source = ['/* eslint-disable */', 'Onyx.connect({key: "x"});', '// eslint-disable-next-line'].join('\n');

        expect(collectDisableDirectivesFromSource(source, 'src/libs/Foo.ts')).toEqual([]);
    });

    it('matches a trailing eslint-disable-line that names the ban', () => {
        const source = `Onyx.connect({key: "x"}); // eslint-disable-line ${BANNED_RULE_ID}\n`;

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
