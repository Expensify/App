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

/** Focuses the first control in the container. Hidden filter contents stay in the DOM, so only a laid out control counts. */
function focusFirstShownControl(container: HTMLElement): boolean {
    const firstControl = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).find((element) => element.getClientRects().length > 0);
    if (!firstControl) {
        return false;
    }
    firstControl.focus();
    return true;
}

export {getAdjacentRow, isCaretAtEdge, focusFirstShownControl};
