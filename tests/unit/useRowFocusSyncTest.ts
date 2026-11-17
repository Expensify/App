import {renderHook} from '@testing-library/react-native';

import useRowFocusSync from '@components/SelectionList/hooks/useRowFocusSync/index.web';

import CONST from '@src/CONST';

/** Builds a list with a search input and two rows, and a control outside it. */
function createList() {
    const container = document.createElement('div');
    const searchInput = document.createElement('input');
    const rows = ['first', 'second'].map((key) => {
        const row = document.createElement('div');
        row.tabIndex = 0;
        row.setAttribute('data-testid', `${CONST.BASE_LIST_ITEM_TEST_ID}${key}`);
        return row;
    });
    container.append(searchInput, ...rows);
    const outsideControl = document.createElement('button');
    document.body.append(container, outsideControl);
    const [firstRow, secondRow] = rows;
    if (!firstRow || !secondRow) {
        throw new Error('Rows were not created');
    }
    return {container, searchInput, firstRow, secondRow, outsideControl};
}

/** jsdom does not track how the focus arrived, so the test says whether a row shows the keyboard focus ring. */
function setFocusVisible(element: HTMLElement, isFocusVisible: boolean) {
    const matches = element.matches.bind(element);
    jest.spyOn(element, 'matches').mockImplementation((selector) => (selector === ':focus-visible' ? isFocusVisible : matches(selector)));
}

function renderRowFocusSync(container: HTMLElement) {
    const showKeyboardHighlight = jest.fn();
    const setFocusedIndex = jest.fn();
    renderHook(() => useRowFocusSync({containerRef: {current: container}, showKeyboardHighlight, setFocusedIndex}));
    return {showKeyboardHighlight, setFocusedIndex};
}

afterEach(() => {
    document.body.innerHTML = '';
});

describe('useRowFocusSync', () => {
    it.each([
        ['shows the highlight when the keyboard moves the focus onto a row', true, 1],
        ['leaves the highlight off when a click focuses a row', false, 0],
    ])('%s', (_case, isFocusVisible, expectedCalls) => {
        // Given a list whose rows have not been reached with an arrow key
        const {container, firstRow} = createList();
        const {showKeyboardHighlight} = renderRowFocusSync(container);
        setFocusVisible(firstRow, isFocusVisible);

        // When a row takes the focus
        firstRow.focus();

        // Then only a focus from the keyboard lights the row
        expect(showKeyboardHighlight).toHaveBeenCalledTimes(expectedCalls);
    });

    it('clears the highlight when the focus leaves the list', () => {
        // Given the focus on a row
        const {container, firstRow, outsideControl} = createList();
        const {setFocusedIndex} = renderRowFocusSync(container);
        firstRow.focus();

        // When the focus moves to a control outside the list
        outsideControl.focus();

        // Then no row stays lit
        expect(setFocusedIndex).toHaveBeenCalledWith(-1);
    });

    it('keeps the highlight while the focus moves within the list', () => {
        // Given the focus on a row
        const {container, searchInput, firstRow, secondRow} = createList();
        const {setFocusedIndex} = renderRowFocusSync(container);
        firstRow.focus();

        // When the focus moves to another row and to the list's search input
        secondRow.focus();
        searchInput.focus();

        // Then the list keeps its highlight, which the arrow keys still move from the search input
        expect(setFocusedIndex).not.toHaveBeenCalled();
    });
});
