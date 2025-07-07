"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ImportOnyxStateUtils_1 = require("../../src/libs/ImportOnyxStateUtils");
describe('transformNumericKeysToArray', function () {
    it('converts object with numeric keys to array', function () {
        var input = { '0': 'a', '1': 'b', '2': 'c' };
        expect((0, ImportOnyxStateUtils_1.transformNumericKeysToArray)(input)).toEqual(['a', 'b', 'c']);
    });
    it('handles nested numeric objects', function () {
        var input = {
            '0': { '0': 'a', '1': 'b' },
            '1': { '0': 'c', '1': 'd' },
        };
        expect((0, ImportOnyxStateUtils_1.transformNumericKeysToArray)(input)).toEqual([
            ['a', 'b'],
            ['c', 'd'],
        ]);
    });
    it('preserves non-numeric keys', function () {
        var input = { foo: 'bar', baz: { '0': 'qux' } };
        expect((0, ImportOnyxStateUtils_1.transformNumericKeysToArray)(input)).toEqual({ foo: 'bar', baz: ['qux'] });
    });
    it('handles empty objects', function () {
        expect((0, ImportOnyxStateUtils_1.transformNumericKeysToArray)({})).toEqual({});
    });
    it('handles non-sequential numeric keys', function () {
        var input = { '0': 'a', '2': 'b', '5': 'c' };
        expect((0, ImportOnyxStateUtils_1.transformNumericKeysToArray)(input)).toEqual({ '0': 'a', '2': 'b', '5': 'c' });
    });
});
describe('cleanAndTransformState', function () {
    it('removes omitted keys and transforms numeric objects', function () {
        var _a;
        var input = JSON.stringify((_a = {},
            _a[ONYXKEYS_1.default.NETWORK] = 'should be removed',
            _a.someKey = { '0': 'a', '1': 'b' },
            _a.otherKey = 'value',
            _a));
        expect((0, ImportOnyxStateUtils_1.cleanAndTransformState)(input)).toEqual({
            someKey: ['a', 'b'],
            otherKey: 'value',
        });
    });
    it('handles empty state', function () {
        expect((0, ImportOnyxStateUtils_1.cleanAndTransformState)('{}')).toEqual({});
    });
    it('removes keys that start with omitted keys', function () {
        var _a;
        var input = JSON.stringify((_a = {},
            _a["".concat(ONYXKEYS_1.default.NETWORK, "_something")] = 'should be removed',
            _a.validKey = 'keep this',
            _a));
        expect((0, ImportOnyxStateUtils_1.cleanAndTransformState)(input)).toEqual({
            validKey: 'keep this',
        });
    });
    it('throws on invalid JSON', function () {
        expect(function () { return (0, ImportOnyxStateUtils_1.cleanAndTransformState)('invalid json'); }).toThrow();
    });
    it('removes all specified ONYXKEYS', function () {
        var _a;
        var input = JSON.stringify((_a = {},
            _a[ONYXKEYS_1.default.ACTIVE_CLIENTS] = 'remove1',
            _a[ONYXKEYS_1.default.FREQUENTLY_USED_EMOJIS] = 'remove2',
            _a[ONYXKEYS_1.default.NETWORK] = 'remove3',
            _a[ONYXKEYS_1.default.CREDENTIALS] = 'remove4',
            _a[ONYXKEYS_1.default.PREFERRED_THEME] = 'remove5',
            _a.keepThis = 'value',
            _a));
        var result = (0, ImportOnyxStateUtils_1.cleanAndTransformState)(input);
        expect(result).toEqual({
            keepThis: 'value',
        });
        // Verify each key is removed
        expect(result).not.toHaveProperty(ONYXKEYS_1.default.ACTIVE_CLIENTS);
        expect(result).not.toHaveProperty(ONYXKEYS_1.default.FREQUENTLY_USED_EMOJIS);
        expect(result).not.toHaveProperty(ONYXKEYS_1.default.NETWORK);
        expect(result).not.toHaveProperty(ONYXKEYS_1.default.CREDENTIALS);
        expect(result).not.toHaveProperty(ONYXKEYS_1.default.PREFERRED_THEME);
    });
});
