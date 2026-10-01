import {tableColumnWidthsSelector} from '@src/selectors/TableColumnWidths';

const TAGS_TABLE_ID = 'workspaceTags';
const TAXES_TABLE_ID = 'workspaceTaxes';
const AGENTS_TABLE_ID = 'agents';

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

    // Given a table that has opted into resizing but that the user has never resized
    // When its widths are selected
    // Then there are none, and the resolver sizes every column from its content
    it('returns nothing for a table with no stored widths', () => {
        expect(tableColumnWidthsSelector(AGENTS_TABLE_ID)(storedWidths)).toBeUndefined();
    });

    // Given a table that hasn't opted into resizing, which is most of them and every table on native
    // When its widths are selected
    // Then there are none regardless of what is stored, so another table's drag never re-renders them
    it('returns nothing for a table that has not opted into resizing', () => {
        expect(tableColumnWidthsSelector(undefined)(storedWidths)).toBeUndefined();
    });

    // Given nothing stored at all, which is every device until the first drag
    // When widths are selected
    // Then there are none rather than a crash on reading into a missing record
    it('returns nothing when no table has been resized yet', () => {
        expect(tableColumnWidthsSelector(TAGS_TABLE_ID)(undefined)).toBeUndefined();
    });

    // Given a drag in one table, which rewrites the root object holding every table's widths
    // When another table re-selects its own
    // Then it gets back the very same object, so other tables don't re-render on every drag
    it('returns the same entry when a different table is resized', () => {
        const selectTagWidths = tableColumnWidthsSelector(TAGS_TABLE_ID);
        const storedWidthsAfterOtherTableResized = {...storedWidths, [TAXES_TABLE_ID]: {name: 420}};

        expect(selectTagWidths(storedWidthsAfterOtherTableResized)).toBe(selectTagWidths(storedWidths));
    });
});
