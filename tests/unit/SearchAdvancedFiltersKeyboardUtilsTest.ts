import {focusFirstShownControl, getAdjacentRow, isCaretAtEdge} from '@libs/SearchAdvancedFiltersKeyboardUtils';

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
