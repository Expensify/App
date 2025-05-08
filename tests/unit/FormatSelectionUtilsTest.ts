import toggleSelectionFormat from '@libs/FormatSelectionUtils';

jest.unmock('@expensify/react-native-live-markdown');

describe('FormatSelectionUtils', () => {
    it('add bold formatting', () => {
        expect(toggleSelectionFormat('aaa', 0, 3, 'formatBold')).toEqual({updatedText: '*aaa*', cursorOffset: 2});
        expect(toggleSelectionFormat('*aaa* bbb *ccc*', 6, 9, 'formatBold')).toEqual({updatedText: '*aaa* *bbb* *ccc*', cursorOffset: 2});
        expect(toggleSelectionFormat('a\nb\nc', 0, 5, 'formatBold')).toEqual({updatedText: '*a\nb\nc*', cursorOffset: 2});
    });

    it('remove bold formatting', () => {
        expect(toggleSelectionFormat('*aaa*', 1, 4, 'formatBold')).toEqual({updatedText: 'aaa', cursorOffset: -1});
        expect(toggleSelectionFormat('*aaa* *bbb* *ccc*', 7, 10, 'formatBold')).toEqual({updatedText: '*aaa* bbb *ccc*', cursorOffset: -1});
        expect(toggleSelectionFormat('*a\nb\nc*', 1, 6, 'formatBold')).toEqual({updatedText: 'a\nb\nc', cursorOffset: -1});
    });

    it('remove bold formatting from word and asterisks', () => {
        expect(toggleSelectionFormat('*aaa*', 0, 5, 'formatBold')).toEqual({updatedText: 'aaa', cursorOffset: -2});
        expect(toggleSelectionFormat('*aaa* *bbb* *ccc*', 6, 11, 'formatBold')).toEqual({updatedText: '*aaa* bbb *ccc*', cursorOffset: -2});
        expect(toggleSelectionFormat('*a\nb\nc*', 0, 7, 'formatBold')).toEqual({updatedText: 'a\nb\nc', cursorOffset: -2});
    });

    it('add italic formatting', () => {
        expect(toggleSelectionFormat('aaa', 0, 3, 'formatItalic')).toEqual({updatedText: '_aaa_', cursorOffset: 2});
        expect(toggleSelectionFormat('_aaa_ bbb _ccc_', 6, 9, 'formatItalic')).toEqual({updatedText: '_aaa_ _bbb_ _ccc_', cursorOffset: 2});
        expect(toggleSelectionFormat('a\nb\nc', 0, 5, 'formatItalic')).toEqual({updatedText: '_a\nb\nc_', cursorOffset: 2});
    });

    it('remove italic formatting', () => {
        expect(toggleSelectionFormat('_aaa_', 1, 4, 'formatItalic')).toEqual({updatedText: 'aaa', cursorOffset: -1});
        expect(toggleSelectionFormat('_aaa_ _bbb_ _ccc_', 7, 10, 'formatItalic')).toEqual({updatedText: '_aaa_ bbb _ccc_', cursorOffset: -1});
        expect(toggleSelectionFormat('_a\nb\nc_', 1, 6, 'formatItalic')).toEqual({updatedText: 'a\nb\nc', cursorOffset: -1});
    });

    it('remove italic formatting from word and underscores', () => {
        expect(toggleSelectionFormat('_aaa_', 0, 5, 'formatItalic')).toEqual({updatedText: 'aaa', cursorOffset: -2});
        expect(toggleSelectionFormat('_aaa_ _bbb_ _ccc_', 6, 11, 'formatItalic')).toEqual({updatedText: '_aaa_ bbb _ccc_', cursorOffset: -2});
        expect(toggleSelectionFormat('_a\nb\nc_', 0, 7, 'formatItalic')).toEqual({updatedText: 'a\nb\nc', cursorOffset: -2});
    });

    it('add bold formatting to italic word', () => {
        expect(toggleSelectionFormat('_aaa_', 1, 4, 'formatBold')).toEqual({updatedText: '_*aaa*_', cursorOffset: 2});
        expect(toggleSelectionFormat('_aaa_ _bbb_ _ccc_', 7, 10, 'formatBold')).toEqual({updatedText: '_aaa_ _*bbb*_ _ccc_', cursorOffset: 2});
    });

    it('add bold formatting to italic word and underscores', () => {
        expect(toggleSelectionFormat('_aaa_', 0, 5, 'formatBold')).toEqual({updatedText: '*_aaa_*', cursorOffset: 2});
        expect(toggleSelectionFormat('*aaa* _bbb_ *ccc*', 6, 11, 'formatBold')).toEqual({updatedText: '*aaa* *_bbb_* *ccc*', cursorOffset: 2});
    });

    it('remove bold formatting from bold-italic word', () => {
        expect(toggleSelectionFormat('_*aaa*_', 2, 5, 'formatBold')).toEqual({updatedText: '_aaa_', cursorOffset: -1});
        expect(toggleSelectionFormat('_aaa *bbb*_', 6, 9, 'formatBold')).toEqual({updatedText: '_aaa bbb_', cursorOffset: -1});
    });

    it('remove bold formatting from bold-italic word and underscores', () => {
        expect(toggleSelectionFormat('*_aaa_*', 1, 6, 'formatBold')).toEqual({updatedText: '_aaa_', cursorOffset: -1});
        expect(toggleSelectionFormat('*aaa* *_bbb_* *ccc*', 7, 12, 'formatBold')).toEqual({updatedText: '*aaa* _bbb_ *ccc*', cursorOffset: -1});
    });

    it('add italic formatting to bold word', () => {
        expect(toggleSelectionFormat('*aaa*', 1, 4, 'formatItalic')).toEqual({updatedText: '*_aaa_*', cursorOffset: 2});
        expect(toggleSelectionFormat('*aaa* *bbb* *ccc*', 7, 10, 'formatItalic')).toEqual({updatedText: '*aaa* *_bbb_* *ccc*', cursorOffset: 2});
    });

    it('add italic formatting to bold word and asterisks', () => {
        expect(toggleSelectionFormat('*aaa*', 0, 5, 'formatItalic')).toEqual({updatedText: '_*aaa*_', cursorOffset: 2});
        expect(toggleSelectionFormat('_aaa_ *bbb* _ccc_', 6, 11, 'formatItalic')).toEqual({updatedText: '_aaa_ _*bbb*_ _ccc_', cursorOffset: 2});
    });

    it('remove italic formatting from bold-italic word', () => {
        expect(toggleSelectionFormat('*_aaa_*', 2, 5, 'formatItalic')).toEqual({updatedText: '*aaa*', cursorOffset: -1});
        expect(toggleSelectionFormat('*aaa _bbb_*', 6, 9, 'formatItalic')).toEqual({updatedText: '*aaa bbb*', cursorOffset: -1});
    });

    it('remove italic formatting from bold-italic word and asterisks', () => {
        expect(toggleSelectionFormat('_*aaa*_', 1, 6, 'formatItalic')).toEqual({updatedText: '*aaa*', cursorOffset: -1});
        expect(toggleSelectionFormat('_aaa_ _*bbb*_ _ccc_', 7, 12, 'formatItalic')).toEqual({updatedText: '_aaa_ *bbb* _ccc_', cursorOffset: -1});
    });

    it('do nothing for unsupported command', () => {
        expect(toggleSelectionFormat('aaa', 0, 3, 'formatUnderline')).toEqual({updatedText: 'aaa', cursorOffset: 0});
        expect(toggleSelectionFormat('_aaa_', 1, 4, 'formatUnderline')).toEqual({updatedText: '_aaa_', cursorOffset: 0});
    });
});
