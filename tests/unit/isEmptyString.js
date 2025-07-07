"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var en_1 = require("@assets/emojis/en");
var StringUtils_1 = require("@libs/StringUtils");
describe('libs/StringUtils.isEmptyString', function () {
    it('basic tests', function () {
        expect(StringUtils_1.default.isEmptyString('test')).toBe(false);
        expect(StringUtils_1.default.isEmptyString('test test')).toBe(false);
        expect(StringUtils_1.default.isEmptyString('test test test')).toBe(false);
        expect(StringUtils_1.default.isEmptyString(' ')).toBe(true);
    });
    it('trim spaces', function () {
        expect(StringUtils_1.default.isEmptyString(' test')).toBe(false);
        expect(StringUtils_1.default.isEmptyString('test ')).toBe(false);
        expect(StringUtils_1.default.isEmptyString(' test ')).toBe(false);
    });
    it('remove invisible characters', function () {
        expect(StringUtils_1.default.isEmptyString('\u200B')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u200B')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u200B ')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u200B \u200B')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u200B \u200B ')).toBe(true);
    });
    it('remove invisible characters (Cc)', function () {
        expect(StringUtils_1.default.isEmptyString('\u0000')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u0001')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u0009')).toBe(true);
    });
    it('remove invisible characters (Cf)', function () {
        expect(StringUtils_1.default.isEmptyString('\u200E')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u200F')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u2060')).toBe(true);
    });
    it('remove invisible characters (Cs)', function () {
        expect(StringUtils_1.default.isEmptyString('\uD800')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\uD801')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\uD802')).toBe(true);
    });
    it('remove invisible characters (Co)', function () {
        expect(StringUtils_1.default.isEmptyString('\uE000')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\uE001')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\uE002')).toBe(true);
    });
    it('remove invisible characters (Zl)', function () {
        expect(StringUtils_1.default.isEmptyString('\u2028')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u2029')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u202A')).toBe(true);
    });
    it('basic check emojis not removed', function () {
        expect(StringUtils_1.default.isEmptyString('😀')).toBe(false);
    });
    it('all emojis not removed', function () {
        Object.keys(en_1.default).forEach(function (key) {
            expect(StringUtils_1.default.isEmptyString(key)).toBe(false);
        });
    });
    it('remove invisible characters (edit pad)', function () {
        expect(StringUtils_1.default.isEmptyString('\u0020')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u00A0')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u2000')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u2001')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u2002')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u2003')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u2004')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u2005')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u2006')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u2007')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u2008')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u2009')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u200A')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u2028')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u205F')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\u3000')).toBe(true);
        expect(StringUtils_1.default.isEmptyString(' ')).toBe(true);
    });
    it('other tests', function () {
        expect(StringUtils_1.default.isEmptyString('\u200D')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F')).toBe(false);
        expect(StringUtils_1.default.isEmptyString('\uD83C')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\uDFF4')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\uDB40')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\uDC67')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\uDC62')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\uDC65')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\uDC6E')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\uDC67')).toBe(true);
        expect(StringUtils_1.default.isEmptyString('\uDC7F')).toBe(true);
        // A special test, an invisible character from other Unicode categories than format and control
        expect(StringUtils_1.default.isEmptyString('\u3164')).toBe(true);
    });
});
