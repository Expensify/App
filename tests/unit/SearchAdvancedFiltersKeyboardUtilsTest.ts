import {focusAdjacentShownRow, focusFirstShownControl, getAdjacentRow, isCaretAtEdge} from '@libs/SearchAdvancedFiltersKeyboardUtils';

import CONST from '@src/CONST';

const ROWS = ['describeSearch', 'type', 'status', 'date'];

/** jsdom lays nothing out, so a control counts as shown only when the test says so. */
function setShown(element: HTMLElement, isShown: boolean) {
    Object.defineProperty(element, 'getClientRects', {value: () => ({length: isShown ? 1 : 0})});
}

function createInput(value: string, selectionStart: number, selectionEnd = selectionStart) {
    const input = document.createElement('input');
    input.value = value;
    document.body.appendChild(input);
    input.setSelectionRange(selectionStart, selectionEnd);
    return input;
}

afterEach(() => {
    document.body.innerHTML = '';
});

describe('getAdjacentRow', () => {
    it('moves to the next and previous rows', () => {
        // Given the selection on a row in the middle of the list
        // When the arrow keys move it either way
        // Then it lands on the neighboring rows
        expect(getAdjacentRow(ROWS, 'status', 1)).toBe('date');
        expect(getAdjacentRow(ROWS, 'status', -1)).toBe('type');
    });

    it('wraps around the ends of the list', () => {
        // Given the selection on the first or last row
        // When an arrow key moves it past that end
        // Then it continues from the other end, so every row stays reachable in either direction
        expect(getAdjacentRow(ROWS, 'date', 1)).toBe('describeSearch');
        expect(getAdjacentRow(ROWS, 'describeSearch', -1)).toBe('date');
    });

    it('starts from the end the arrow points away from when the selected row is not listed', () => {
        // Given a search that hides the selected row
        // When an arrow key is pressed
        // Then down starts at the top and up at the bottom
        expect(getAdjacentRow(ROWS, 'merchant', 1)).toBe('describeSearch');
        expect(getAdjacentRow(ROWS, 'merchant', -1)).toBe('date');
    });

    it('returns nothing when no row is listed', () => {
        // Given a search that matches no row
        // When an arrow key is pressed
        // Then there is no row to move to
        expect(getAdjacentRow([], 'type', 1)).toBeUndefined();
    });
});

describe('isCaretAtEdge', () => {
    it('treats an element without text as being at both edges', () => {
        // Given the focus on a row rather than in a text input
        const row = document.createElement('div');

        // When the left or right arrow key is pressed
        // Then the key is free to move between the panes
        expect(isCaretAtEdge(row, 'start')).toBe(true);
        expect(isCaretAtEdge(row, 'end')).toBe(true);
    });

    it('is at an edge only when the caret sits at that end of the text', () => {
        // Given carets at the start, middle and end of the search text
        // When the arrow key toward each end is checked
        // Then only a caret already at that end leaves the text, so the arrow keys still move the caret within it
        expect(isCaretAtEdge(createInput('paid', 0), 'start')).toBe(true);
        expect(isCaretAtEdge(createInput('paid', 2), 'start')).toBe(false);
        expect(isCaretAtEdge(createInput('paid', 2), 'end')).toBe(false);
        expect(isCaretAtEdge(createInput('paid', 4), 'end')).toBe(true);
    });

    it('is not at an edge while text is selected', () => {
        // Given the whole search text selected
        const input = createInput('paid', 0, 4);

        // When the arrow keys are checked
        // Then they collapse the selection rather than move between the panes
        expect(isCaretAtEdge(input, 'start')).toBe(false);
        expect(isCaretAtEdge(input, 'end')).toBe(false);
    });
});

describe('focusFirstShownControl', () => {
    it('focuses the first control of the shown content and skips the hidden ones', () => {
        // Given a hidden filter content kept in the DOM ahead of the shown one
        const container = document.createElement('div');
        const hiddenInput = document.createElement('input');
        const shownInput = document.createElement('input');
        container.append(hiddenInput, shownInput);
        document.body.appendChild(container);
        setShown(hiddenInput, false);
        setShown(shownInput, true);

        // When the focus is moved into the content
        const hasFocused = focusFirstShownControl(container);

        // Then it lands in the shown content
        expect(hasFocused).toBe(true);
        expect(document.activeElement).toBe(shownInput);
    });

    it.each([
        ['search input', 'input', undefined],
        ['list row', 'div', CONST.ROLE.CHECKBOX],
        ['person row', 'button', CONST.ROLE.BUTTON],
    ])('focuses the %s ahead of the "Is" button of a negatable filter', (_case, tagName, role) => {
        // Given a negatable filter whose "Is" button comes before the values it filters by
        const container = document.createElement('div');
        const negationToggle = document.createElement('div');
        negationToggle.setAttribute(`data-${CONST.ADVANCED_FILTERS_NEGATION_TOGGLE_ELEMENT}`, 'true');
        const isButton = document.createElement('button');
        negationToggle.appendChild(isButton);
        const value = document.createElement(tagName);
        value.tabIndex = 0;
        if (role) {
            value.setAttribute('role', role);
        }
        container.append(negationToggle, value);
        document.body.appendChild(container);
        setShown(isButton, true);
        setShown(value, true);

        // When the focus is moved into the content
        focusFirstShownControl(container);

        // Then it lands where the arrow keys pick a value, so the "Is" button is reached with Tab only
        expect(document.activeElement).toBe(value);
    });

    it('focuses a row rather than the checkbox inside it that only a pointer reaches', () => {
        // Given a row holding a checkbox that is not a tab stop
        const container = document.createElement('div');
        const row = document.createElement('div');
        row.tabIndex = 0;
        row.setAttribute('role', CONST.ROLE.BUTTON);
        const checkbox = document.createElement('div');
        checkbox.tabIndex = -1;
        checkbox.setAttribute('role', CONST.ROLE.CHECKBOX);
        row.appendChild(checkbox);
        container.appendChild(row);
        document.body.appendChild(container);
        setShown(row, true);
        setShown(checkbox, true);

        // When the focus is moved into the content
        focusFirstShownControl(container);

        // Then the row takes it, so the next arrow key moves to the next row
        expect(document.activeElement).toBe(row);
    });

    it('focuses the text of a filter ahead of the rows listed above it', () => {
        // Given an amount filter whose "Equal to" row comes before the amount input
        const container = document.createElement('div');
        const equalToRow = document.createElement('div');
        equalToRow.tabIndex = 0;
        equalToRow.setAttribute('role', CONST.ROLE.OPTION);
        const amountInput = document.createElement('input');
        container.append(equalToRow, amountInput);
        document.body.appendChild(container);
        setShown(equalToRow, true);
        setShown(amountInput, true);

        // When the focus is moved into the content
        focusFirstShownControl(container);

        // Then the amount can be typed at once
        expect(document.activeElement).toBe(amountInput);
    });

    it('falls back to the first control when the content has no search or rows', () => {
        // Given content made only of buttons
        const container = document.createElement('div');
        const button = document.createElement('button');
        container.appendChild(button);
        document.body.appendChild(container);
        setShown(button, true);

        // When the focus is moved into the content
        focusFirstShownControl(container);

        // Then the first button takes the focus
        expect(document.activeElement).toBe(button);
    });

    it('leaves the focus where it is when no control is shown', () => {
        // Given content with no control laid out, such as the empty state
        const container = document.createElement('div');
        const hiddenButton = document.createElement('button');
        container.appendChild(hiddenButton);
        document.body.appendChild(container);
        setShown(hiddenButton, false);

        // When the focus is moved into the content
        const hasFocused = focusFirstShownControl(container);

        // Then nothing takes the focus
        expect(hasFocused).toBe(false);
        expect(document.activeElement).toBe(document.body);
    });
});

describe('focusAdjacentShownRow', () => {
    /** Builds rows outside a selection list, like the date presets, followed by a button that is not a row. */
    function createRows() {
        const container = document.createElement('div');
        const createRow = (label: string) => {
            const row = document.createElement('div');
            row.tabIndex = 0;
            row.setAttribute('role', CONST.ROLE.OPTION);
            row.setAttribute('aria-label', label);
            setShown(row, true);
            return row;
        };
        const firstRow = createRow('This week');
        const middleRow = createRow('This month');
        const lastRow = createRow('This year');
        const customDateButton = document.createElement('button');
        setShown(customDateButton, true);
        container.append(firstRow, middleRow, lastRow, customDateButton);
        document.body.appendChild(container);
        return {container, firstRow, middleRow, lastRow, customDateButton};
    }

    it('focuses the next and previous rows', () => {
        // Given the focus on the middle row
        const {container, firstRow, middleRow, lastRow} = createRows();
        middleRow.focus();

        // When moving down and then up twice
        const movedDown = focusAdjacentShownRow(container, middleRow, 1);
        const focusedAfterDown = document.activeElement;
        focusAdjacentShownRow(container, lastRow, -1);
        focusAdjacentShownRow(container, middleRow, -1);

        // Then the focus follows the rows
        expect(movedDown).toBe(true);
        expect(focusedAfterDown).toBe(lastRow);
        expect(document.activeElement).toBe(firstRow);
    });

    it('stops at the ends of the rows', () => {
        // Given the focus on the first row
        const {container, firstRow, lastRow} = createRows();
        firstRow.focus();

        // When moving up from the first row and down from the last
        const movedUp = focusAdjacentShownRow(container, firstRow, -1);
        const movedDown = focusAdjacentShownRow(container, lastRow, 1);

        // Then nothing moves, and the button after the rows is left to Tab
        expect(movedUp).toBe(false);
        expect(movedDown).toBe(false);
        expect(document.activeElement).toBe(firstRow);
    });

    it('leaves a control that is not a row alone', () => {
        // Given the focus on a button below the rows
        const {container, customDateButton} = createRows();
        customDateButton.focus();

        // When moving up
        const moved = focusAdjacentShownRow(container, customDateButton, -1);

        // Then the button keeps the focus
        expect(moved).toBe(false);
        expect(document.activeElement).toBe(customDateButton);
    });
});
