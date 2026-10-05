import {getSearchColumnEditButtonReserve} from '@libs/getSearchColumnContentToMeasure';

import variables from '@styles/variables';

import CONST from '@src/CONST';

const {TOTAL_AMOUNT, MERCHANT, STATUS} = CONST.SEARCH.TABLE_COLUMNS;

/** A value comfortably wider than the width below which a leading-edge cell is covered by its edit button. */
const WIDE_VALUE_WIDTH = variables.narrowEditableContentWidth * 2;

/** A value narrow enough that the edit button would sit on top of it. */
const NARROW_VALUE_WIDTH = variables.narrowEditableContentWidth / 2;

describe('getSearchColumnEditButtonReserve', () => {
    describe('a column that renders its value from the leading edge', () => {
        it('reserves the button for a value too narrow to clear it', () => {
            // Given a merchant short enough that the edit button would cover it
            // When the reserve is resolved
            const reserve = getSearchColumnEditButtonReserve(MERCHANT, NARROW_VALUE_WIDTH);

            // Then the column is widened by the button, so the value stays readable while the row is hovered
            expect(reserve).toBe(variables.editableCellEditButtonWidth);
        });

        it('reserves nothing for a value that already clears the button', () => {
            // Given a merchant long enough that the column is wider than the button on its own
            // When the reserve is resolved
            const reserve = getSearchColumnEditButtonReserve(MERCHANT, WIDE_VALUE_WIDTH);

            // Then nothing is added, since the value's tail truncating under the button still reads as a merchant name
            expect(reserve).toBe(0);
        });
    });

    describe('the amount column, which renders its value from the trailing edge', () => {
        it('reserves the button however wide the amount is', () => {
            // Given amounts on either side of the width that decides it for every other editable column
            // When the reserve is resolved for each
            const narrowAmountReserve = getSearchColumnEditButtonReserve(TOTAL_AMOUNT, NARROW_VALUE_WIDTH);
            const wideAmountReserve = getSearchColumnEditButtonReserve(TOTAL_AMOUNT, WIDE_VALUE_WIDTH);

            // Then both reserve the button, because it sits on the edge the amount is rendered from, and an amount
            // with its leading digits covered reads as a different amount rather than as a truncation
            expect(narrowAmountReserve).toBe(variables.editableCellEditButtonWidth);
            expect(wideAmountReserve).toBe(variables.editableCellEditButtonWidth);
        });
    });

    describe('a column with no edit button', () => {
        it('reserves nothing', () => {
            // Given the status column, whose cell is never edited in place
            // When the reserve is resolved
            const reserve = getSearchColumnEditButtonReserve(STATUS, NARROW_VALUE_WIDTH);

            // Then there is no button to make room for
            expect(reserve).toBe(0);
        });
    });
});
