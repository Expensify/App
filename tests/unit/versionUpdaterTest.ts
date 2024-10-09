import * as versionUpdater from '../../.github/libs/versionUpdater';

const VERSION = '2.3.9-80';
const VERSION_NUMBER = [2, 3, 9, 80] as const;

describe('versionUpdater', () => {
    describe('getVersionNumberFromString', () => {
        it('should return a list with version levels numbers', () => {
            expect(versionUpdater.getVersionNumberFromString(VERSION)).toStrictEqual(VERSION_NUMBER);
        });

        it('should return build as zero if not present in string', () => {
            const versionWithZeroBuild = [VERSION_NUMBER[0], VERSION_NUMBER[1], VERSION_NUMBER[2], 0];
            expect(versionUpdater.getVersionNumberFromString(VERSION.split('-').at(0) ?? '')).toStrictEqual(versionWithZeroBuild);
        });
    });

    describe('getVersionStringFromNumber', () => {
        it(`should return ${VERSION}`, () => {
            expect(versionUpdater.getVersionStringFromNumber(...VERSION_NUMBER)).toBe(VERSION);
        });
    });

    describe('incrementMinor', () => {
        it('should only increment minor', () => {
            expect(versionUpdater.incrementMinor(2, 3)).toStrictEqual('2.4.0-0');
        });

        it('should increment major', () => {
            expect(versionUpdater.incrementMinor(2, versionUpdater.MAX_INCREMENTS)).toStrictEqual('3.0.0-0');
        });
    });

    describe('incrementPatch', () => {
        it('should only increment patch', () => {
            expect(versionUpdater.incrementPatch(2, 3, 5)).toStrictEqual('2.3.6-0');
        });

        it('should increment minor', () => {
            expect(versionUpdater.incrementPatch(2, 3, versionUpdater.MAX_INCREMENTS)).toStrictEqual('2.4.0-0');
        });

        it('should increment major', () => {
            expect(versionUpdater.incrementPatch(2, versionUpdater.MAX_INCREMENTS, versionUpdater.MAX_INCREMENTS)).toStrictEqual('3.0.0-0');
        });
    });

    describe('incrementVersion', () => {
        it('should increment MAJOR', () => {
            expect(versionUpdater.incrementVersion(VERSION, versionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR)).toStrictEqual('3.0.0-0');
        });

        it('should increment MAJOR even above max level', () => {
            expect(versionUpdater.incrementVersion(`${versionUpdater.MAX_INCREMENTS}.5.1-80`, versionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR)).toStrictEqual(
                `${versionUpdater.MAX_INCREMENTS + 1}.0.0-0`,
            );
        });

        it('should increment BUILD number', () => {
            expect(versionUpdater.incrementVersion(VERSION, versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD)).toStrictEqual('2.3.9-81');
        });

        it('should add BUILD number if there is no BUILD number', () => {
            expect(versionUpdater.incrementVersion(VERSION.split('-').at(0) ?? '', versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD)).toStrictEqual('2.3.9-1');
        });

        it('should increment patch if MINOR is above max level', () => {
            expect(versionUpdater.incrementVersion(`2.3.9-${versionUpdater.MAX_INCREMENTS}`, versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD)).toStrictEqual('2.3.10-0');
        });

        it('should increment the MAJOR', () => {
            expect(
                versionUpdater.incrementVersion(
                    `2.${versionUpdater.MAX_INCREMENTS}.${versionUpdater.MAX_INCREMENTS}-${versionUpdater.MAX_INCREMENTS}`,
                    versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD,
                ),
            ).toStrictEqual('3.0.0-0');
        });
    });

    describe('getPreviousVersion', () => {
        test.each([
            ['1.0.0-0', versionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR, '1.0.0-0'],
            ['1.0.0-0', versionUpdater.SEMANTIC_VERSION_LEVELS.MINOR, '1.0.0-0'],
            ['1.0.0-0', versionUpdater.SEMANTIC_VERSION_LEVELS.PATCH, '1.0.0-0'],
            ['1.0.0-0', versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD, '1.0.0-0'],
            ['2.0.0-0', versionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR, '1.0.0-0'],
            ['1.1.0-0', versionUpdater.SEMANTIC_VERSION_LEVELS.MINOR, '1.0.0-0'],
            ['1.0.1-0', versionUpdater.SEMANTIC_VERSION_LEVELS.PATCH, '1.0.0-0'],
            ['1.0.0-1', versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD, '1.0.0-0'],
        ])('%s – get previous %s version', (input, level, expectedOutput) => {
            expect(versionUpdater.getPreviousVersion(input, level)).toBe(expectedOutput);
        });
    });
});
