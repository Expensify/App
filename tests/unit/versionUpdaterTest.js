"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var versionUpdater = require("../../.github/libs/versionUpdater");
var VERSION = '2.3.9-80';
var VERSION_NUMBER = [2, 3, 9, 80];
describe('versionUpdater', function () {
    describe('getVersionNumberFromString', function () {
        it('should return a list with version levels numbers', function () {
            expect(versionUpdater.getVersionNumberFromString(VERSION)).toStrictEqual(VERSION_NUMBER);
        });
        it('should return build as zero if not present in string', function () {
            var _a;
            var versionWithZeroBuild = [VERSION_NUMBER[0], VERSION_NUMBER[1], VERSION_NUMBER[2], 0];
            expect(versionUpdater.getVersionNumberFromString((_a = VERSION.split('-').at(0)) !== null && _a !== void 0 ? _a : '')).toStrictEqual(versionWithZeroBuild);
        });
    });
    describe('getVersionStringFromNumber', function () {
        it("should return ".concat(VERSION), function () {
            expect(versionUpdater.getVersionStringFromNumber.apply(versionUpdater, VERSION_NUMBER)).toBe(VERSION);
        });
    });
    describe('incrementMinor', function () {
        it('should only increment minor', function () {
            expect(versionUpdater.incrementMinor(2, 3)).toStrictEqual('2.4.0-0');
        });
        it('should increment major', function () {
            expect(versionUpdater.incrementMinor(2, versionUpdater.MAX_INCREMENTS)).toStrictEqual('3.0.0-0');
        });
    });
    describe('incrementPatch', function () {
        it('should only increment patch', function () {
            expect(versionUpdater.incrementPatch(2, 3, 5)).toStrictEqual('2.3.6-0');
        });
        it('should increment minor', function () {
            expect(versionUpdater.incrementPatch(2, 3, versionUpdater.MAX_INCREMENTS)).toStrictEqual('2.4.0-0');
        });
        it('should increment major', function () {
            expect(versionUpdater.incrementPatch(2, versionUpdater.MAX_INCREMENTS, versionUpdater.MAX_INCREMENTS)).toStrictEqual('3.0.0-0');
        });
    });
    describe('incrementVersion', function () {
        it('should increment MAJOR', function () {
            expect(versionUpdater.incrementVersion(VERSION, versionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR)).toStrictEqual('3.0.0-0');
        });
        it('should increment MAJOR even above max level', function () {
            expect(versionUpdater.incrementVersion("".concat(versionUpdater.MAX_INCREMENTS, ".5.1-80"), versionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR)).toStrictEqual("".concat(versionUpdater.MAX_INCREMENTS + 1, ".0.0-0"));
        });
        it('should increment BUILD number', function () {
            expect(versionUpdater.incrementVersion(VERSION, versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD)).toStrictEqual('2.3.9-81');
        });
        it('should add BUILD number if there is no BUILD number', function () {
            var _a;
            expect(versionUpdater.incrementVersion((_a = VERSION.split('-').at(0)) !== null && _a !== void 0 ? _a : '', versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD)).toStrictEqual('2.3.9-1');
        });
        it('should increment patch if MINOR is above max level', function () {
            expect(versionUpdater.incrementVersion("2.3.9-".concat(versionUpdater.MAX_INCREMENTS), versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD)).toStrictEqual('2.3.10-0');
        });
        it('should increment the MAJOR', function () {
            expect(versionUpdater.incrementVersion("2.".concat(versionUpdater.MAX_INCREMENTS, ".").concat(versionUpdater.MAX_INCREMENTS, "-").concat(versionUpdater.MAX_INCREMENTS), versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD)).toStrictEqual('3.0.0-0');
        });
    });
    describe('getPreviousVersion', function () {
        test.each([
            ['1.0.0-0', versionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR, '1.0.0-0'],
            ['1.0.0-0', versionUpdater.SEMANTIC_VERSION_LEVELS.MINOR, '1.0.0-0'],
            ['1.0.0-0', versionUpdater.SEMANTIC_VERSION_LEVELS.PATCH, '1.0.0-0'],
            ['1.0.0-0', versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD, '1.0.0-0'],
            ['2.0.0-0', versionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR, '1.0.0-0'],
            ['1.1.0-0', versionUpdater.SEMANTIC_VERSION_LEVELS.MINOR, '1.0.0-0'],
            ['1.0.1-0', versionUpdater.SEMANTIC_VERSION_LEVELS.PATCH, '1.0.0-0'],
            ['1.0.0-1', versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD, '1.0.0-0'],
        ])('%s – get previous %s version', function (input, level, expectedOutput) {
            expect(versionUpdater.getPreviousVersion(input, level)).toBe(expectedOutput);
        });
    });
});
