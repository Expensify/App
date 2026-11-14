import isEnterWhileComposition from '@libs/KeyboardShortcut/isEnterWhileComposition';
import {focusFirstShownControl, getAdjacentRow, isCaretAtEdge} from '@libs/SearchAdvancedFiltersKeyboardUtils';

import CONST from '@src/CONST';

import type {RefObject} from 'react';

import {useEffect, useEffectEvent, useLayoutEffect, useRef} from 'react';

type UseFilterPanesKeyboardNavigationParams<Row> = {
    /** The pane holding the filter search input and the filter rows. */
    listContainerRef: RefObject<unknown>;

    /** The pane showing the selected filter. */
    contentContainerRef: RefObject<unknown>;

    /** The rows the arrow keys move through, in the order they are listed. */
    rows: Row[];

    /** The row whose content is shown. */
    selectedRow: Row;

    /** The accessibility label a row is rendered with, used to find it in the list. */
    getRowLabel: (row: Row) => string;

    /** Shows the content of a row. */
    onSelectRow: (row: Row) => void;

    /** Whether the search text has yet to pick its row, so the content shown still belongs to the previous one. */
    isRowSelectionPending: boolean;
};

/**
 * The open popover closes when Escape is released, so the release of an Escape that only left the content is kept from
 * it. The window hears the release before the popover's listener on the document.
 */
function swallowEscapeRelease(event: KeyboardEvent) {
    if (event.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
        event.stopImmediatePropagation();
    }
    window.removeEventListener('keyup', swallowEscapeRelease, true);
}

/**
 * Lets the keyboard move between a list of filters and the content of the selected one. Up and down move through the
 * rows, right or Enter moves into the content, and left or Escape goes back to the filter search. Web only.
 */
function useFilterPanesKeyboardNavigation<Row>({
    listContainerRef,
    contentContainerRef,
    rows,
    selectedRow,
    getRowLabel,
    onSelectRow,
    isRowSelectionPending,
}: UseFilterPanesKeyboardNavigationParams<Row>) {
    const focusToKeepRef = useRef<HTMLElement | null>(null);
    const shouldFocusContentRef = useRef(false);

    const findRowElement = (listContainer: HTMLElement, row: Row) => {
        const rowLabel = getRowLabel(row);
        return Array.from(listContainer.querySelectorAll<HTMLElement>('[aria-label]')).find((element) => element.getAttribute('aria-label') === rowLabel);
    };

    const moveRowSelection = (event: KeyboardEvent, listContainer: HTMLElement) => {
        const nextRow = getAdjacentRow(rows, selectedRow, event.key === CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN.shortcutKey ? 1 : -1);
        // Staying on the same row renders nothing, so no layout effect would take back the focus kept below.
        if (nextRow === undefined || nextRow === selectedRow) {
            return;
        }

        onSelectRow(nextRow);

        // The caret stays in the search so typing goes on, while a row the keyboard is on hands the focus down the list.
        const rowElement = findRowElement(listContainer, nextRow);
        if (!rowElement) {
            return;
        }
        if (event.target instanceof HTMLInputElement) {
            rowElement.scrollIntoView({block: 'nearest'});
            focusToKeepRef.current = event.target;
            return;
        }
        rowElement.focus();
        focusToKeepRef.current = rowElement;
    };

    // A content list the keyboard has been used in focuses its row again when it is shown, which would pull the focus
    // out of the filter list. This runs after the content's effects, so the focus goes back to where the arrow key left it.
    useLayoutEffect(() => {
        const elementToKeepFocused = focusToKeepRef.current;
        focusToKeepRef.current = null;
        if (!elementToKeepFocused || document.activeElement === elementToKeepFocused) {
            return;
        }
        elementToKeepFocused.focus({preventScroll: true});
    });

    useEffect(() => {
        const contentContainer = contentContainerRef.current;
        if (isRowSelectionPending || !shouldFocusContentRef.current || !(contentContainer instanceof HTMLElement)) {
            return;
        }
        shouldFocusContentRef.current = false;
        focusFirstShownControl(contentContainer);
    }, [isRowSelectionPending, contentContainerRef]);

    // The keyboard library listens on the document in the capture phase, and the content lists take the arrow keys
    // through it. Listening on the window comes first, so the pane holding the focus decides where an arrow key goes.
    const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
        const listContainer = listContainerRef.current;
        const contentContainer = contentContainerRef.current;
        if (!(listContainer instanceof HTMLElement) || !(contentContainer instanceof HTMLElement) || !(event.target instanceof Element)) {
            return;
        }
        // The arrow keys and Enter pick and confirm the text of an input method, so they are left to it while it composes.
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.isComposing || isEnterWhileComposition(event)) {
            return;
        }

        if (listContainer.contains(event.target)) {
            // Other controls in the list, like the clear button of the search, keep their own keys.
            const targetLabel = event.target.getAttribute('aria-label');
            const isOnSearchOrRow = event.target instanceof HTMLInputElement || rows.some((row) => getRowLabel(row) === targetLabel);
            if (!isOnSearchOrRow) {
                return;
            }
            switch (event.key) {
                case CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN.shortcutKey:
                case CONST.KEYBOARD_SHORTCUTS.ARROW_UP.shortcutKey:
                    moveRowSelection(event, listContainer);
                    break;
                case CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey:
                case CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey:
                    if (event.key === CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey && !isCaretAtEdge(event.target, 'end')) {
                        return;
                    }
                    // The content shown before the search picks its row is about to be hidden, and the focus would go with it.
                    if (isRowSelectionPending) {
                        shouldFocusContentRef.current = true;
                        break;
                    }
                    focusFirstShownControl(contentContainer);
                    break;
                default:
                    return;
            }
        } else if (contentContainer.contains(event.target)) {
            const isLeavingContent =
                event.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey || (event.key === CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey && isCaretAtEdge(event.target, 'start'));
            if (!isLeavingContent) {
                return;
            }
            listContainer.querySelector('input')?.focus();
            if (event.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
                // Adding the same listener again does nothing, so a release that never came cannot stack them.
                window.addEventListener('keyup', swallowEscapeRelease, true);
            }
        } else {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
    });

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => handleKeyDown(event);
        window.addEventListener('keydown', onKeyDown, true);
        return () => window.removeEventListener('keydown', onKeyDown, true);
    }, []);
}

export default useFilterPanesKeyboardNavigation;
