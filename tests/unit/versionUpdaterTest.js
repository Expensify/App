const versionUpdater = require('../../.github/libs/versionUpdater.js');

const VERSION = '2.3.9-80';
const VERSION_NUMBER = [2, 3, 9, 80];

describe('getVersionNumberFromString', () => {
    it('should return a list with version levels numbers', () => {
        expect(versionUpdater.getVersionNumberFromString(VERSION)).toStrictEqual(
            VERSION_NUMBER,
        );
    });
    it('should return build as undefined if not present in string', () => {
        const versionWithNoBuild = [
            VERSION_NUMBER[0],
            VERSION_NUMBER[1],
            VERSION_NUMBER[2],
            undefined,
        ];

        expect(
            versionUpdater.getVersionNumberFromString(VERSION.split('-')[0]),
        ).toStrictEqual(versionWithNoBuild);
    });
});

describe('getVersionStringFromNumber', () => {
    it(`should return ${VERSION}`, () => {
        expect(versionUpdater.getVersionStringFromNumber(...VERSION_NUMBER)).toBe(
            VERSION,
        );
    });
});

describe('incrementMinor', () => {
    it('should only increment minor', () => {
        expect(versionUpdater.incrementMinor(2, 3)).toStrictEqual('2.4.0');
    });
    it('should increment major', () => {
        expect(versionUpdater.incrementMinor(2, versionUpdater.maxIncrements)).toStrictEqual(
            '3.0.0',
        );
    });
});

describe('incrementPatch', () => {
    it('should only increment patch', () => {
        expect(versionUpdater.incrementPatch(2, 3, 5)).toStrictEqual('2.3.6');
    });
    it('should increment minor', () => {
        expect(
            versionUpdater.incrementPatch(2, 3, versionUpdater.maxIncrements),
        ).toStrictEqual('2.4.0');
    });
    it('should increment major', () => {
        expect(
            versionUpdater.incrementPatch(
                2,
                versionUpdater.maxIncrements,
                versionUpdater.maxIncrements,
            ),
        ).toStrictEqual('3.0.0');
    });
});

describe('incrementVersion', () => {
    it('should increment major', () => {
        expect(
            versionUpdater.incrementVersion(
                VERSION, versionUpdater.semanticVersionLevels.major,
            ),
        ).toStrictEqual('3.0.0');
    });
    it('should increment major even above max level', () => {
        expect(
            versionUpdater.incrementVersion(
                `${versionUpdater.maxIncrements}.5.1-80`, versionUpdater.semanticVersionLevels.major,
            ),
        ).toStrictEqual(`${versionUpdater.maxIncrements + 1}.0.0`);
    });
    it('should increment build number', () => {
        expect(versionUpdater.incrementVersion(
            VERSION, versionUpdater.semanticVersionLevels.build,
        )).toStrictEqual('2.3.9-81');
    });
    it('should add build number if there is no build number', () => {
        expect(
            versionUpdater.incrementVersion(VERSION.split('-')[0], versionUpdater.semanticVersionLevels.build),
        ).toStrictEqual('2.3.9-1');
    });
    it('should increment patch if minor is above max level', () => {
        expect(
            versionUpdater.incrementVersion(
                `2.3.9-${versionUpdater.maxIncrements}`,
                versionUpdater.semanticVersionLevels.build,
            ),
        ).toStrictEqual('2.3.10');
    });
});
