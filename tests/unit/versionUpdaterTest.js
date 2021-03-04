const { describe } = require('jest-circus');
const functions = require('../../.github/libs/versionUpdater.js');

const version = 'v2.3.9-80';
const versionNumber = [2, 3, 9, 80];

describe('getVersionNumberFromString', () => {
    it('should return a list with version levels numbers', () => {
        expect(functions.getVersionNumberFromString(version)).toStrictEqual(
            versionNumber,
        );
    });
    it('should return build as undefined if not present in string', () => {
        const versionWithNoBuild = [
            versionNumber[0],
            versionNumber[1],
            versionNumber[2],
            undefined,
        ];

        expect(
            functions.getVersionNumberFromString(version.split('-')[0]),
        ).toStrictEqual(versionWithNoBuild);
    });
});

describe('getVersionStringFromNumber', () => {
    it(`should return ${version}`, () => {
        expect(functions.getVersionStringFromNumber(...versionNumber)).toBe(
            version,
        );
    });
});

describe('incrementMinor', () => {
    it('should only increment minor', () => {
        expect(functions.incrementMinor(2, 3)).toStrictEqual('v2.4.0');
    });
    it('should increment major', () => {
        expect(functions.incrementMinor(2, functions.maxIncrements)).toStrictEqual(
            'v3.0.0',
        );
    });
});

describe('incrementPatch', () => {
    it('should only increment patch', () => {
        expect(functions.incrementPatch(2, 3, 5)).toStrictEqual('v2.3.6');
    });
    it('should increment minor', () => {
        expect(
            functions.incrementPatch(2, 3, functions.maxIncrements),
        ).toStrictEqual('v2.4.0');
    });
    it('should increment major', () => {
        expect(
            functions.incrementPatch(
                2,
                functions.maxIncrements,
                functions.maxIncrements,
            ),
        ).toStrictEqual('v3.0.0');
    });
});

describe('incrementVersion', () => {
    it('should increment major', () => {
        expect(
            functions.incrementVersion(
                version, functions.semanticVersionLevels.major,
            ),
        ).toStrictEqual('v3.0.0');
    });
    it('should increment major even above max level', () => {
        expect(
            functions.incrementVersion(
                `v${functions.maxIncrements}.5.1-80`, functions.semanticVersionLevels.major,
            ),
        ).toStrictEqual(`v${functions.maxIncrements + 1}.0.0`);
    });
    it('should increment build number', () => {
        expect(functions.incrementVersion(
            version, functions.semanticVersionLevels.build,
        )).toStrictEqual('v2.3.9-81');
    });
    it('should add build number if there is no build number', () => {
        expect(
            functions.incrementVersion(version.split('-')[0], functions.semanticVersionLevels.build),
        ).toStrictEqual('v2.3.9-1');
    });
    it('should increment patch if minor is above max level', () => {
        expect(
            functions.incrementVersion(`v2.3.9-${functions.maxIncrements}`, functions.semanticVersionLevels.build),
        ).toStrictEqual('v2.3.10');
    });
});
