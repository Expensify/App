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

/** Rows a filter is picked from, which come after the "Is" and "Is not" buttons of a negatable filter. */
const FILTER_ROW_SELECTOR = '[role="option"], [role="checkbox"], [role="radio"]';

/**
 * Focuses the text or first row of the shown content, or else its first control. Hidden filter contents stay in the
 * DOM, so only a laid out element counts.
 */
function focusFirstShownControl(container: HTMLElement): boolean {
    const findFirstShown = (selector: string) => Array.from(container.querySelectorAll<HTMLElement>(selector)).find((element) => element.getClientRects().length > 0);
    const firstControl = findFirstShown(FILTER_TEXT_SELECTOR) ?? findFirstShown(FILTER_ROW_SELECTOR) ?? findFirstShown(FOCUSABLE_SELECTOR);
    if (!firstControl) {
        return false;
    }
    firstControl.focus();
    return true;
}

export {getAdjacentRow, isCaretAtEdge, focusFirstShownControl};
