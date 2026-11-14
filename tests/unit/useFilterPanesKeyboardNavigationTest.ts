import {renderHook} from '@testing-library/react-native';

import useFilterPanesKeyboardNavigation from '@components/Search/hooks/useFilterPanesKeyboardNavigation';

import CONST from '@src/CONST';

const ROWS = ['type', 'status', 'date'];

/** jsdom lays nothing out, so every control in the content counts as shown. */
function markShown(element: HTMLElement) {
    Object.defineProperty(element, 'getClientRects', {value: () => ({length: 1})});
}

/** Builds the two panes the popover renders: the filter search with its clear button and rows, and the shown content. */
function createPanes() {
    const listContainer = document.createElement('div');
    const searchInput = document.createElement('input');
    const clearButton = document.createElement('button');
    listContainer.append(searchInput, clearButton);
    for (const row of ROWS) {
        const rowElement = document.createElement('div');
        rowElement.tabIndex = 0;
        rowElement.setAttribute('aria-label', row);
        listContainer.appendChild(rowElement);
    }

    const contentContainer = document.createElement('div');
    const contentInput = document.createElement('input');
    markShown(contentInput);
    contentContainer.appendChild(contentInput);

    document.body.append(listContainer, contentContainer);
    return {listContainer, contentContainer, searchInput, clearButton, contentInput};
}

function pressKey(target: HTMLElement, key: string, init: KeyboardEventInit = {}) {
    const event = new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true, ...init});
    target.dispatchEvent(event);
    return event;
}

function renderNavigation(panes: ReturnType<typeof createPanes>, onSelectRow = jest.fn(), isRowSelectionPending = false) {
    const listContainerRef = {current: panes.listContainer};
    const contentContainerRef = {current: panes.contentContainer};
    const {rerender} = renderHook(
        ({isPending}: {isPending: boolean}) =>
            useFilterPanesKeyboardNavigation({
                listContainerRef,
                contentContainerRef,
                rows: ROWS,
                selectedRow: 'type',
                getRowLabel: (row) => row,
                onSelectRow,
                isRowSelectionPending: isPending,
            }),
        {initialProps: {isPending: isRowSelectionPending}},
    );
    return {onSelectRow, setRowSelectionPending: (isPending: boolean) => rerender({isPending})};
}

beforeAll(() => {
    // jsdom has no layout, so it does not scroll.
    Element.prototype.scrollIntoView = jest.fn();
});

afterEach(() => {
    document.body.innerHTML = '';
});

describe('useFilterPanesKeyboardNavigation', () => {
    it('moves the selection down the rows while the focus stays in the filter search', () => {
        // Given the focus in the filter search
        const panes = createPanes();
        const {onSelectRow} = renderNavigation(panes);
        panes.searchInput.focus();

        // When the down arrow is pressed
        const event = pressKey(panes.searchInput, CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN.shortcutKey);

        // Then the next row is selected and the key does not reach the content lists
        expect(onSelectRow).toHaveBeenCalledWith('status');
        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(panes.searchInput);
    });

    it('moves the focus into the shown content on Enter and back to the filter search on Escape', () => {
        // Given the focus in the filter search
        const panes = createPanes();
        renderNavigation(panes);
        panes.searchInput.focus();

        // When Enter is pressed
        pressKey(panes.searchInput, CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey);

        // Then the focus moves into the content
        expect(document.activeElement).toBe(panes.contentInput);

        // When Escape is pressed in the content
        const escape = pressKey(panes.contentInput, CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey);

        // Then the focus goes back to the filter search, and the popover is not told to close
        expect(document.activeElement).toBe(panes.searchInput);
        expect(escape.defaultPrevented).toBe(true);
    });

    it('keeps the release of that Escape from the popover, which closes on release', () => {
        // Given the popover listening for Escape releases on the document, and the focus in the content
        const panes = createPanes();
        renderNavigation(panes);
        const closePopover = jest.fn();
        document.addEventListener('keyup', closePopover, true);
        panes.contentInput.focus();

        // When Escape is pressed and released in the content
        pressKey(panes.contentInput, CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey);
        panes.searchInput.dispatchEvent(new KeyboardEvent('keyup', {key: CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey, bubbles: true}));

        // Then the popover stays open
        expect(closePopover).not.toHaveBeenCalled();

        // When Escape is pressed and released again in the filter search
        pressKey(panes.searchInput, CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey);
        panes.searchInput.dispatchEvent(new KeyboardEvent('keyup', {key: CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey, bubbles: true}));

        // Then that release reaches the popover, so it closes
        expect(closePopover).toHaveBeenCalledTimes(1);
        document.removeEventListener('keyup', closePopover, true);
    });

    it('waits for the search to pick its row before moving the focus into the content on Enter', () => {
        // Given text typed into the filter search that has yet to pick its row
        const panes = createPanes();
        const {setRowSelectionPending} = renderNavigation(panes, jest.fn(), true);
        panes.searchInput.focus();

        // When Enter is pressed
        const enter = pressKey(panes.searchInput, CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey);

        // Then the focus stays in the search, as the content shown is about to be replaced
        expect(enter.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(panes.searchInput);

        // When the search picks its row
        setRowSelectionPending(false);

        // Then the focus moves into the content of that row
        expect(document.activeElement).toBe(panes.contentInput);
    });

    it.each([
        ['moves the focus to the next row when nothing else took the arrow key', false, true],
        ['leaves the arrow key to a selection list that took it', true, false],
    ])('%s', (_case, isTakenByList, isFocusMoved) => {
        // Given content rows outside the panes' own handling, like the date presets, with the focus on the first
        const panes = createPanes();
        renderNavigation(panes);
        const [firstRow, nextRow] = ['This week', 'This month'].map((label) => {
            const row = document.createElement('div');
            row.tabIndex = 0;
            row.setAttribute('role', CONST.ROLE.OPTION);
            row.setAttribute('aria-label', label);
            markShown(row);
            panes.contentContainer.appendChild(row);
            return row;
        });
        if (!firstRow || !nextRow) {
            throw new Error('Rows were not created');
        }
        firstRow.focus();
        if (isTakenByList) {
            firstRow.addEventListener('keydown', (event) => event.preventDefault());
        }

        // When the down arrow is pressed
        const event = pressKey(firstRow, CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN.shortcutKey);

        // Then only an arrow key nobody took moves the focus, and it no longer scrolls the content
        expect(document.activeElement).toBe(isFocusMoved ? nextRow : firstRow);
        expect(event.defaultPrevented).toBe(true);
    });

    it('leaves the keys to an input method while it composes text', () => {
        // Given text being composed in the filter search
        const panes = createPanes();
        const {onSelectRow} = renderNavigation(panes);
        panes.searchInput.focus();

        // When the arrow keys pick a candidate and Enter confirms it
        const arrow = pressKey(panes.searchInput, CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN.shortcutKey, {isComposing: true});
        const enter = pressKey(panes.searchInput, CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey, {isComposing: true});

        // Then neither changes the selection nor moves the focus, so the composition finishes
        expect(onSelectRow).not.toHaveBeenCalled();
        expect(arrow.defaultPrevented).toBe(false);
        expect(enter.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(panes.searchInput);
    });

    it('lets Enter press the clear button of the filter search', () => {
        // Given the focus on the clear button, which sits in the filter list
        const panes = createPanes();
        renderNavigation(panes);
        panes.clearButton.focus();

        // When Enter is pressed
        const enter = pressKey(panes.clearButton, CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey);

        // Then the button keeps the key, so it clears the search instead of the focus moving into the content
        expect(enter.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(panes.clearButton);
    });
});
