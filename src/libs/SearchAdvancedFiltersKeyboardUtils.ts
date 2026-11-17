import CONST from '@src/CONST';

import FOCUSABLE_SELECTOR from './focusableSelector';

/** Returns the row an arrow key moves to, wrapping around the ends. With no current row, down starts at the top and up at the bottom. */
function getAdjacentRow<Row>(rows: Row[], currentRow: Row, step: 1 | -1): Row | undefined {
    if (rows.length === 0) {
        return undefined;
    }
    const currentIndex = rows.indexOf(currentRow);
    if (currentIndex === -1) {
        return step === 1 ? rows.at(0) : rows.at(-1);
    }
    return rows.at((currentIndex + step + rows.length) % rows.length);
}

/** Whether a left or right arrow key would leave the text the caret is in, so it can move between the panes instead. */
function isCaretAtEdge(target: EventTarget | null, edge: 'start' | 'end'): boolean {
    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) {
        return true;
    }
    if (target.selectionStart !== target.selectionEnd) {
        return false;
    }
    return edge === 'start' ? target.selectionStart === 0 : target.selectionEnd === target.value.length;
}

/** The text a filter is typed into. It can sit below the rows that pick how it applies, like "Equal to" above an amount. */
const FILTER_TEXT_SELECTOR = 'input, textarea, [role="textbox"]';

/** Rows outside a selection list, like the date presets. A row can hold a checkbox that only a pointer reaches, so a row has to be a tab stop. */
const FILTER_ROW_SELECTOR = '[role="option"][tabindex="0"], [role="checkbox"][tabindex="0"], [role="radio"][tabindex="0"]';

const BUTTON_ROW_SELECTOR = `[data-${CONST.ADVANCED_FILTERS_ARROW_ROWS_ELEMENT}] [role="button"][tabindex="0"]`;

const findShown = (container: HTMLElement, selector: string) => Array.from(container.querySelectorAll<HTMLElement>(selector)).filter((element) => element.getClientRects().length > 0);

const isOutsideNegationToggle = (element: HTMLElement) => !element.closest(`[data-${CONST.ADVANCED_FILTERS_NEGATION_TOGGLE_ELEMENT}]`);

/**
 * Focuses the text of the shown content, or else its first row, or else its first control past the "Is" and "Is not"
 * buttons. A row comes before a header's back button, so the arrow keys can go on from it. Hidden filter contents stay in
 * the DOM, so only a laid out element counts.
 */
function focusFirstShownControl(container: HTMLElement): boolean {
    const shownControls = findShown(container, FOCUSABLE_SELECTOR);
    const firstControl =
        findShown(container, FILTER_TEXT_SELECTOR).at(0) ??
        findShown(container, `${FILTER_ROW_SELECTOR}, ${BUTTON_ROW_SELECTOR}`).at(0) ??
        shownControls.find(isOutsideNegationToggle) ??
        shownControls.at(0);
    if (!firstControl) {
        return false;
    }
    firstControl.focus();
    return true;
}

/**
 * Focuses the shown row next to the given one, among the rows of its kind, and wraps around the ends like a selection list. A single line input
 * between the rows, like the amount under "Equal to", is a stop too, since the arrow keys have no lines to move through in it.
 * Button rows go with the rows around them, like "Custom date" under the date presets.
 */
function focusAdjacentShownRow(container: HTMLElement, row: HTMLElement, step: 1 | -1): boolean {
    const isInput = row instanceof HTMLInputElement;
    const isButtonRow = row.matches(BUTTON_ROW_SELECTOR);
    if (!isInput && !isButtonRow && !row.matches(FILTER_ROW_SELECTOR)) {
        return false;
    }
    const rowsOfKind = findShown(container, `${FILTER_ROW_SELECTOR}, ${BUTTON_ROW_SELECTOR}, input`).filter(
        (element) => isInput || isButtonRow || element instanceof HTMLInputElement || element.matches(BUTTON_ROW_SELECTOR) || element.getAttribute('role') === row.getAttribute('role'),
    );
    const adjacentRow = getAdjacentRow(rowsOfKind, row, step);
    if (!adjacentRow || adjacentRow === row) {
        return false;
    }
    adjacentRow.focus();
    return true;
}

export {getAdjacentRow, isCaretAtEdge, focusFirstShownControl, focusAdjacentShownRow};
