import {tableColumnWidthsSelector} from '@src/selectors/TableColumnWidths';

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

    // Given a table that hasn't opted into resizing, which is most of them and every table on native
    // When its widths are selected
    // Then there are none regardless of what is stored, so another table's drag never re-renders them
    it('returns nothing for a table that has not opted into resizing', () => {
        expect(tableColumnWidthsSelector(undefined)(storedWidths)).toBeUndefined();
    });
});
