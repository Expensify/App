"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var convertToLTRForComposer_1 = require("@libs/convertToLTRForComposer");
var CONST_1 = require("@src/CONST");
describe('convertToLTRForComposer', function () {
    test('Input without RTL characters remains unchanged', function () {
        // Test when input contains no RTL characters
        var inputText = 'Hello, world!';
        var result = (0, convertToLTRForComposer_1.default)(inputText);
        expect(result).toBe(inputText);
    });
    test('Input with RTL characters is prefixed with LTR marker', function () {
        // Test when input contains RTL characters
        var inputText = 'مثال';
        var result = (0, convertToLTRForComposer_1.default)(inputText);
        expect(result).toBe("".concat(CONST_1.default.UNICODE.LTR).concat(inputText));
    });
    test('Input with mixed RTL and LTR characters is prefixed with LTR marker', function () {
        // Test when input contains mix of RTL and LTR characters
        var inputText = 'مثال test ';
        var result = (0, convertToLTRForComposer_1.default)(inputText);
        expect(result).toBe("".concat(CONST_1.default.UNICODE.LTR).concat(inputText));
    });
    test('Input with only space remains unchanged', function () {
        // Test when input contains only spaces
        var inputText = '   ';
        var result = (0, convertToLTRForComposer_1.default)(inputText);
        expect(result).toBe(inputText);
    });
    test('Input with existing LTR marker remains unchanged', function () {
        // Test when input already starts with the LTR marker
        var inputText = "".concat(CONST_1.default.UNICODE.LTR, "\u0645\u062B\u0627\u0644");
        var result = (0, convertToLTRForComposer_1.default)(inputText);
        expect(result).toBe(inputText);
    });
    test('Input starting with native emojis remains unchanged', function () {
        // Test when input starts with the native emojis
        var inputText = '🧶';
        var result = (0, convertToLTRForComposer_1.default)(inputText);
        expect(result).toBe(inputText);
    });
    test('Input is empty', function () {
        // Test when input is empty to check for draft comments
        var inputText = '';
        var result = (0, convertToLTRForComposer_1.default)(inputText);
        expect(result.length).toBe(0);
    });
    test('input with special characters remains unchanged', function () {
        // Test when input contains special characters
        var specialCharacters = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '=', '{', '}', '[', ']', '"', ':', ';', '<', '>', '?', '`', '~'];
        specialCharacters.forEach(function (character) {
            var result = (0, convertToLTRForComposer_1.default)(character);
            expect(result).toBe(character);
        });
    });
});
