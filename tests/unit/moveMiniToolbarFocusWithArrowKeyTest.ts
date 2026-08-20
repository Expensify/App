import getHadTabNavigation, {resetForTests, setupHadTabNavigation} from '@libs/hadTabNavigation';
import moveMiniToolbarFocusWithArrowKey, {getAdjacentHorizontalIndex} from '@libs/moveMiniToolbarFocusWithArrowKey';

import CONST from '@src/CONST';

jest.mock('@libs/DomUtils', () => ({
    __esModule: true,
    default: {
        getActiveElement: () => global.document.activeElement,
    },
}));

setupHadTabNavigation();

const MINI_TOOLBAR_BUTTON_LABELS = ['thumbs up', 'heart', 'laugh', 'Add reaction', 'Reply in thread', 'View thread', 'More'] as const;
const ADD_REACTION_INDEX = 3;
const REPLY_INDEX = 4;
const LAST_BUTTON_INDEX = MINI_TOOLBAR_BUTTON_LABELS.length - 1;

function createMiniToolbar() {
    const toolbar = document.createElement('div');
    for (const label of MINI_TOOLBAR_BUTTON_LABELS) {
        const button = document.createElement('div');
        button.setAttribute('role', CONST.ROLE.BUTTON);
        button.tabIndex = 0;
        button.textContent = label;
        toolbar.appendChild(button);
    }
    document.body.appendChild(toolbar);
    return toolbar;
}

function getToolbarButtons(toolbar: HTMLElement) {
    return Array.from(toolbar.querySelectorAll<HTMLElement>(`[role="${CONST.ROLE.BUTTON}"]`));
}

function getToolbarButton(buttons: HTMLElement[], index: number): HTMLElement {
    const button = buttons.at(index);
    if (!button) {
        throw new Error(`Missing toolbar button at index ${index}`);
    }
    return button;
}

function pressArrow(toolbar: HTMLElement, key: string) {
    const event = new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true});
    Object.defineProperty(event, 'currentTarget', {value: toolbar});
    moveMiniToolbarFocusWithArrowKey(event);
    return event;
}

function simulateTab() {
    document.dispatchEvent(new KeyboardEvent('keydown', {key: CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey, bubbles: true}));
}

function simulateMouseClick() {
    document.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
}

afterEach(() => {
    document.body.innerHTML = '';
    resetForTests();
});

describe('getAdjacentHorizontalIndex', () => {
    it('moves from a quick reaction onto the next toolbar button past Add reaction', () => {
        expect(getAdjacentHorizontalIndex(ADD_REACTION_INDEX, CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey, LAST_BUTTON_INDEX)).toBe(REPLY_INDEX);
    });

    it('stops at the first and last buttons', () => {
        expect(getAdjacentHorizontalIndex(0, CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey, LAST_BUTTON_INDEX)).toBe(0);
        expect(getAdjacentHorizontalIndex(LAST_BUTTON_INDEX, CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey, LAST_BUTTON_INDEX)).toBe(LAST_BUTTON_INDEX);
    });

    it('moves one step toward the adjacent button', () => {
        expect(getAdjacentHorizontalIndex(0, CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey, LAST_BUTTON_INDEX)).toBe(1);
        expect(getAdjacentHorizontalIndex(REPLY_INDEX, CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey, LAST_BUTTON_INDEX)).toBe(ADD_REACTION_INDEX);
    });
});

describe('moveMiniToolbarFocusWithArrowKey', () => {
    it('moves focus to the next button with ArrowRight after Tab', () => {
        simulateTab();
        expect(getHadTabNavigation()).toBe(true);

        const toolbar = createMiniToolbar();
        const buttons = getToolbarButtons(toolbar);
        getToolbarButton(buttons, 0).focus();

        pressArrow(toolbar, CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey);

        expect(document.activeElement).toBe(getToolbarButton(buttons, 1));
    });

    it('moves from Add reaction onto Reply in thread', () => {
        simulateTab();
        const toolbar = createMiniToolbar();
        const buttons = getToolbarButtons(toolbar);
        getToolbarButton(buttons, ADD_REACTION_INDEX).focus();

        pressArrow(toolbar, CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey);

        expect(document.activeElement).toBe(getToolbarButton(buttons, REPLY_INDEX));
        expect(document.activeElement?.textContent).toBe('Reply in thread');
    });

    it('does not move focus with arrows after a mouse click', () => {
        simulateTab();
        simulateMouseClick();
        expect(getHadTabNavigation()).toBe(false);

        const toolbar = createMiniToolbar();
        const buttons = getToolbarButtons(toolbar);
        getToolbarButton(buttons, 0).focus();

        pressArrow(toolbar, CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey);

        expect(document.activeElement).toBe(getToolbarButton(buttons, 0));
    });

    it('stops at the ends instead of wrapping', () => {
        simulateTab();
        const toolbar = createMiniToolbar();
        const buttons = getToolbarButtons(toolbar);

        getToolbarButton(buttons, 0).focus();
        pressArrow(toolbar, CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey);
        expect(document.activeElement).toBe(getToolbarButton(buttons, 0));

        getToolbarButton(buttons, LAST_BUTTON_INDEX).focus();
        pressArrow(toolbar, CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey);
        expect(document.activeElement).toBe(getToolbarButton(buttons, LAST_BUTTON_INDEX));
    });

    it('treats ArrowDown like ArrowRight and ArrowUp like ArrowLeft', () => {
        simulateTab();
        const toolbar = createMiniToolbar();
        const buttons = getToolbarButtons(toolbar);
        getToolbarButton(buttons, 1).focus();

        pressArrow(toolbar, CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN.shortcutKey);
        expect(document.activeElement).toBe(getToolbarButton(buttons, 2));

        pressArrow(toolbar, CONST.KEYBOARD_SHORTCUTS.ARROW_UP.shortcutKey);
        expect(document.activeElement).toBe(getToolbarButton(buttons, 1));
    });

    it('leaves Tab, Shift+Tab, and Enter to the browser', () => {
        simulateTab();
        const toolbar = createMiniToolbar();
        const buttons = getToolbarButtons(toolbar);
        getToolbarButton(buttons, 0).focus();

        const enterEvent = pressArrow(toolbar, CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey);

        expect(document.activeElement).toBe(getToolbarButton(buttons, 0));
        expect(enterEvent.defaultPrevented).toBe(false);
    });
});
