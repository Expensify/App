import {hasTableColumnWidthsSelector, tableColumnWidthsSelector} from '@src/selectors/TableColumnWidths';

const TAGS_TABLE_ID = 'workspaceTags';
const TAXES_TABLE_ID = 'workspaceTaxes';

describe('tableColumnWidthsSelector', () => {
    const storedWidths = {
        [TAGS_TABLE_ID]: {name: 240, enabled: 120},
        [TAXES_TABLE_ID]: {name: 300},
    };

    // Given a table that has opted into resizing
    // When its widths are selected out of the record holding every table's
    // Then it gets only its own, so the table never lays out from another table's columns
    it('picks out the widths stored for the table', () => {
        expect(tableColumnWidthsSelector(TAGS_TABLE_ID)(storedWidths)).toEqual({name: 240, enabled: 120});
    });

    // Given a resizable table the user has never dragged
    // When its widths are selected
    // Then there are none, so it lays out from its column defaults instead of another table's widths
    it('returns nothing for a table with no stored widths', () => {
        expect(tableColumnWidthsSelector('workspaceCategories')(storedWidths)).toBeUndefined();
    });
});

describe('hasTableColumnWidthsSelector', () => {
    const storedWidths = {
        [TAGS_TABLE_ID]: {name: 240},
    };

    // Given a table with one dragged column
    // When the Display menu checks whether it has anything to reset
    // Then it does, so "Reset columns" shows
    it('is true for a table with a stored width', () => {
        expect(hasTableColumnWidthsSelector(TAGS_TABLE_ID)(storedWidths)).toBe(true);
    });

    // Given a table that was never resized while another table was
    // When the Display menu checks whether it has anything to reset
    // Then it doesn't, so another table's drag never offers a reset here
    it('is false for a table whose columns were never resized', () => {
        expect(hasTableColumnWidthsSelector(TAXES_TABLE_ID)(storedWidths)).toBe(false);
    });
});
