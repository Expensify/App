"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FormatSelectionUtils_1 = require("@libs/FormatSelectionUtils");
jest.unmock('@expensify/react-native-live-markdown');
describe('FormatSelectionUtils', function () {
    it('add bold formatting', function () {
        expect((0, FormatSelectionUtils_1.default)('aaa', 0, 3, 'formatBold')).toEqual({ updatedText: '*aaa*', cursorOffset: 2 });
        expect((0, FormatSelectionUtils_1.default)('*aaa* bbb *ccc*', 6, 9, 'formatBold')).toEqual({ updatedText: '*aaa* *bbb* *ccc*', cursorOffset: 2 });
        expect((0, FormatSelectionUtils_1.default)('a\nb\nc', 0, 5, 'formatBold')).toEqual({ updatedText: '*a\nb\nc*', cursorOffset: 2 });
    });
    it('remove bold formatting', function () {
        expect((0, FormatSelectionUtils_1.default)('*aaa*', 1, 4, 'formatBold')).toEqual({ updatedText: 'aaa', cursorOffset: -1 });
        expect((0, FormatSelectionUtils_1.default)('*aaa* *bbb* *ccc*', 7, 10, 'formatBold')).toEqual({ updatedText: '*aaa* bbb *ccc*', cursorOffset: -1 });
        expect((0, FormatSelectionUtils_1.default)('*a\nb\nc*', 1, 6, 'formatBold')).toEqual({ updatedText: 'a\nb\nc', cursorOffset: -1 });
    });
    it('remove bold formatting from word and asterisks', function () {
        expect((0, FormatSelectionUtils_1.default)('*aaa*', 0, 5, 'formatBold')).toEqual({ updatedText: 'aaa', cursorOffset: -2 });
        expect((0, FormatSelectionUtils_1.default)('*aaa* *bbb* *ccc*', 6, 11, 'formatBold')).toEqual({ updatedText: '*aaa* bbb *ccc*', cursorOffset: -2 });
        expect((0, FormatSelectionUtils_1.default)('*a\nb\nc*', 0, 7, 'formatBold')).toEqual({ updatedText: 'a\nb\nc', cursorOffset: -2 });
    });
    it('add italic formatting', function () {
        expect((0, FormatSelectionUtils_1.default)('aaa', 0, 3, 'formatItalic')).toEqual({ updatedText: '_aaa_', cursorOffset: 2 });
        expect((0, FormatSelectionUtils_1.default)('_aaa_ bbb _ccc_', 6, 9, 'formatItalic')).toEqual({ updatedText: '_aaa_ _bbb_ _ccc_', cursorOffset: 2 });
        expect((0, FormatSelectionUtils_1.default)('a\nb\nc', 0, 5, 'formatItalic')).toEqual({ updatedText: '_a\nb\nc_', cursorOffset: 2 });
    });
    it('remove italic formatting', function () {
        expect((0, FormatSelectionUtils_1.default)('_aaa_', 1, 4, 'formatItalic')).toEqual({ updatedText: 'aaa', cursorOffset: -1 });
        expect((0, FormatSelectionUtils_1.default)('_aaa_ _bbb_ _ccc_', 7, 10, 'formatItalic')).toEqual({ updatedText: '_aaa_ bbb _ccc_', cursorOffset: -1 });
        expect((0, FormatSelectionUtils_1.default)('_a\nb\nc_', 1, 6, 'formatItalic')).toEqual({ updatedText: 'a\nb\nc', cursorOffset: -1 });
    });
    it('remove italic formatting from word and underscores', function () {
        expect((0, FormatSelectionUtils_1.default)('_aaa_', 0, 5, 'formatItalic')).toEqual({ updatedText: 'aaa', cursorOffset: -2 });
        expect((0, FormatSelectionUtils_1.default)('_aaa_ _bbb_ _ccc_', 6, 11, 'formatItalic')).toEqual({ updatedText: '_aaa_ bbb _ccc_', cursorOffset: -2 });
        expect((0, FormatSelectionUtils_1.default)('_a\nb\nc_', 0, 7, 'formatItalic')).toEqual({ updatedText: 'a\nb\nc', cursorOffset: -2 });
    });
    it('add bold formatting to italic word', function () {
        expect((0, FormatSelectionUtils_1.default)('_aaa_', 1, 4, 'formatBold')).toEqual({ updatedText: '_*aaa*_', cursorOffset: 2 });
        expect((0, FormatSelectionUtils_1.default)('_aaa_ _bbb_ _ccc_', 7, 10, 'formatBold')).toEqual({ updatedText: '_aaa_ _*bbb*_ _ccc_', cursorOffset: 2 });
    });
    it('add bold formatting to italic word and underscores', function () {
        expect((0, FormatSelectionUtils_1.default)('_aaa_', 0, 5, 'formatBold')).toEqual({ updatedText: '*_aaa_*', cursorOffset: 2 });
        expect((0, FormatSelectionUtils_1.default)('*aaa* _bbb_ *ccc*', 6, 11, 'formatBold')).toEqual({ updatedText: '*aaa* *_bbb_* *ccc*', cursorOffset: 2 });
    });
    it('remove bold formatting from bold-italic word', function () {
        expect((0, FormatSelectionUtils_1.default)('_*aaa*_', 2, 5, 'formatBold')).toEqual({ updatedText: '_aaa_', cursorOffset: -1 });
        expect((0, FormatSelectionUtils_1.default)('_aaa *bbb*_', 6, 9, 'formatBold')).toEqual({ updatedText: '_aaa bbb_', cursorOffset: -1 });
    });
    it('remove bold formatting from bold-italic word and underscores', function () {
        expect((0, FormatSelectionUtils_1.default)('*_aaa_*', 1, 6, 'formatBold')).toEqual({ updatedText: '_aaa_', cursorOffset: -1 });
        expect((0, FormatSelectionUtils_1.default)('*aaa* *_bbb_* *ccc*', 7, 12, 'formatBold')).toEqual({ updatedText: '*aaa* _bbb_ *ccc*', cursorOffset: -1 });
    });
    it('add italic formatting to bold word', function () {
        expect((0, FormatSelectionUtils_1.default)('*aaa*', 1, 4, 'formatItalic')).toEqual({ updatedText: '*_aaa_*', cursorOffset: 2 });
        expect((0, FormatSelectionUtils_1.default)('*aaa* *bbb* *ccc*', 7, 10, 'formatItalic')).toEqual({ updatedText: '*aaa* *_bbb_* *ccc*', cursorOffset: 2 });
    });
    it('add italic formatting to bold word and asterisks', function () {
        expect((0, FormatSelectionUtils_1.default)('*aaa*', 0, 5, 'formatItalic')).toEqual({ updatedText: '_*aaa*_', cursorOffset: 2 });
        expect((0, FormatSelectionUtils_1.default)('_aaa_ *bbb* _ccc_', 6, 11, 'formatItalic')).toEqual({ updatedText: '_aaa_ _*bbb*_ _ccc_', cursorOffset: 2 });
    });
    it('remove italic formatting from bold-italic word', function () {
        expect((0, FormatSelectionUtils_1.default)('*_aaa_*', 2, 5, 'formatItalic')).toEqual({ updatedText: '*aaa*', cursorOffset: -1 });
        expect((0, FormatSelectionUtils_1.default)('*aaa _bbb_*', 6, 9, 'formatItalic')).toEqual({ updatedText: '*aaa bbb*', cursorOffset: -1 });
    });
    it('remove italic formatting from bold-italic word and asterisks', function () {
        expect((0, FormatSelectionUtils_1.default)('_*aaa*_', 1, 6, 'formatItalic')).toEqual({ updatedText: '*aaa*', cursorOffset: -1 });
        expect((0, FormatSelectionUtils_1.default)('_aaa_ _*bbb*_ _ccc_', 7, 12, 'formatItalic')).toEqual({ updatedText: '_aaa_ *bbb* _ccc_', cursorOffset: -1 });
    });
    it('do nothing for unsupported command', function () {
        expect((0, FormatSelectionUtils_1.default)('aaa', 0, 3, 'formatUnderline')).toEqual({ updatedText: 'aaa', cursorOffset: 0 });
        expect((0, FormatSelectionUtils_1.default)('_aaa_', 1, 4, 'formatUnderline')).toEqual({ updatedText: '_aaa_', cursorOffset: 0 });
    });
});
