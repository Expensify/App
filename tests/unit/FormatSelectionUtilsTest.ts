import toggleSelectionFormat from '@libs/FormatSelectionUtils';

jest.unmock('@expensify/react-native-live-markdown');

describe('FormatSelectionUtils', () => {
    it('add bold formatting', () => {
        const result = toggleSelectionFormat('*aaa* bbb *ccc*', 6, 9, 'formatBold');
        expect(result).toEqual({updatedText: '*aaa* *bbb* *ccc*', cursorOffset: 2});
    });

    it('remove bold formatting', () => {
        const result = toggleSelectionFormat('*aaa* *bbb* *ccc*', 7, 10, 'formatBold');
        expect(result).toEqual({updatedText: '*aaa* bbb *ccc*', cursorOffset: -1});
    });

    it('remove bold formatting from word and markdown symbols', () => {
        const result = toggleSelectionFormat('*aaa* *bbb* *ccc*', 6, 11, 'formatBold');
        expect(result).toEqual({updatedText: '*aaa* bbb *ccc*', cursorOffset: -2});
    });

    it('add italic formatting', () => {
        const result = toggleSelectionFormat('_aaa_ bbb _ccc_', 6, 9, 'formatItalic');
        expect(result).toEqual({updatedText: '_aaa_ _bbb_ _ccc_', cursorOffset: 2});
    });

    it('remove italic formatting', () => {
        const result = toggleSelectionFormat('_aaa_ _bbb_ _ccc_', 7, 10, 'formatItalic');
        expect(result).toEqual({updatedText: '_aaa_ bbb _ccc_', cursorOffset: -1});
    });

    it('remove italic formatting from word and markdown symbols', () => {
        const result = toggleSelectionFormat('_aaa_ _bbb_ _ccc_', 6, 11, 'formatItalic');
        expect(result).toEqual({updatedText: '_aaa_ bbb _ccc_', cursorOffset: -2});
    });

    it('add bold formatting to italic word', () => {
        const result = toggleSelectionFormat('_aaa_ _bbb_ _ccc_', 7, 10, 'formatBold');
        expect(result).toEqual({updatedText: '_aaa_ _*bbb*_ _ccc_', cursorOffset: 2});
    });

    it('add bold formatting to italic word and markdown symbols', () => {
        const result = toggleSelectionFormat('*aaa* _bbb_ *ccc*', 6, 11, 'formatBold');
        expect(result).toEqual({updatedText: '*aaa* *_bbb_* *ccc*', cursorOffset: 2});
    });

    it('remove bold formatting from bold-italic word', () => {
        const result = toggleSelectionFormat('*aaa* *_bbb_* *ccc*', 7, 12, 'formatBold');
        expect(result).toEqual({updatedText: '*aaa* _bbb_ *ccc*', cursorOffset: -1});
    });

    it('remove bold formatting from bold-italic word and markdown symbols', () => {
        const result = toggleSelectionFormat('_aaa *bbb*_', 6, 9, 'formatBold');
        expect(result).toEqual({updatedText: '_aaa bbb_', cursorOffset: -1});
    });

    it('add italic formatting to bold word', () => {
        const result = toggleSelectionFormat('*aaa* *bbb* *ccc*', 7, 10, 'formatItalic');
        expect(result).toEqual({updatedText: '*aaa* *_bbb_* *ccc*', cursorOffset: 2});
    });

    it('add italic formatting to bold word and markdown symbols', () => {
        const result = toggleSelectionFormat('_aaa_ *bbb* _ccc_', 6, 11, 'formatItalic');
        expect(result).toEqual({updatedText: '_aaa_ _*bbb*_ _ccc_', cursorOffset: 2});
    });

    it('remove italic formatting from bold-italic word', () => {
        const result = toggleSelectionFormat('_aaa_ _*bbb*_ _ccc_', 7, 12, 'formatItalic');
        expect(result).toEqual({updatedText: '_aaa_ *bbb* _ccc_', cursorOffset: -1});
    });

    it('remove italic formatting from bold-italic word and markdown symbols', () => {
        const result = toggleSelectionFormat('*aaa _bbb_*', 6, 9, 'formatItalic');
        expect(result).toEqual({updatedText: '*aaa bbb*', cursorOffset: -1});
    });
});
