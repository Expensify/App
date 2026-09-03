import getHadTabNavigation, {resetForTests, setupHadTabNavigation} from '@libs/hadTabNavigation';
import moveMiniToolbarFocusWithArrowKey, {getAdjacentHorizontalIndex, moveFullContextMenuFocusWithArrowKey, TOOLBAR_BUTTON_SELECTOR} from '@libs/moveContextMenuFocusWithArrowKey';

import CONST from '@src/CONST';

jest.mock('@libs/DomUtils', () => ({
    __esModule: true,
    default: {
        getActiveElement: () => global.document.activeElement,
    },
}));

setupHadTabNavigation();

const MINI_TOOLBAR_BUTTON_LABELS = ['thumbs up', 'heart', 'laugh', 'Add reaction', 'Reply in thread', 'View thread', 'More'] as const;
const REACTION_ROW_BUTTON_LABELS = ['thumbs up', 'heart', 'laugh', 'fire', 'Add reaction'] as const;
const FULL_MENU_LIST_LABELS = ['Reply in thread', 'Mark as unread', 'Edit comment'] as const;
const ADD_REACTION_INDEX = 3;
const REPLY_INDEX = 4;
const LAST_BUTTON_INDEX = MINI_TOOLBAR_BUTTON_LABELS.length - 1;
const LAST_REACTION_INDEX = REACTION_ROW_BUTTON_LABELS.length - 1;
const FULL_MENU_REPLY_INDEX = REACTION_ROW_BUTTON_LABELS.length;

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
    return Array.from(toolbar.querySelectorAll<HTMLElement>(TOOLBAR_BUTTON_SELECTOR));
}

function getToolbarButton(buttons: HTMLElement[], index: number): HTMLElement {
    const button = buttons.at(index);
    if (!button) {
        throw new Error(`Missing toolbar button at index ${index}`);
    }
    return button;
}

function createFullContextMenu() {
    const menu = document.createElement('div');
    const reactionRow = document.createElement('div');
    for (const label of REACTION_ROW_BUTTON_LABELS) {
        const button = document.createElement('div');
        button.setAttribute('role', CONST.ROLE.BUTTON);
        button.tabIndex = 0;
        button.textContent = label;
        reactionRow.appendChild(button);
    }
    menu.appendChild(reactionRow);
    for (const label of FULL_MENU_LIST_LABELS) {
        const button = document.createElement('div');
        button.setAttribute('role', CONST.ROLE.BUTTON);
        button.tabIndex = 0;
        button.textContent = label;
        menu.appendChild(button);
    }
    document.body.appendChild(menu);
    return {menu, reactionRow};
}

function pressArrow(toolbar: HTMLElement, key: string, eventInit?: KeyboardEventInit) {
    const event = new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true, ...eventInit});
    Object.defineProperty(event, 'currentTarget', {value: toolbar});
    moveMiniToolbarFocusWithArrowKey(event);
    return event;
}

function pressFullMenuArrow(menu: HTMLElement, key: string) {
    const event = new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true});
    Object.defineProperty(event, 'currentTarget', {value: menu});
    moveFullContextMenuFocusWithArrowKey(event);
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

    it('wraps from the first button to the last and from the last button to the first', () => {
        expect(getAdjacentHorizontalIndex(0, CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey, LAST_BUTTON_INDEX)).toBe(LAST_BUTTON_INDEX);
        expect(getAdjacentHorizontalIndex(LAST_BUTTON_INDEX, CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey, LAST_BUTTON_INDEX)).toBe(0);
    });

    it('moves one step toward the adjacent button', () => {
        expect(getAdjacentHorizontalIndex(0, CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey, LAST_BUTTON_INDEX)).toBe(1);
        expect(getAdjacentHorizontalIndex(REPLY_INDEX, CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey, LAST_BUTTON_INDEX)).toBe(ADD_REACTION_INDEX);
    });

    it('keeps the current index for vertical arrow keys', () => {
        expect(getAdjacentHorizontalIndex(1, CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN.shortcutKey, LAST_BUTTON_INDEX)).toBe(1);
        expect(getAdjacentHorizontalIndex(1, CONST.KEYBOARD_SHORTCUTS.ARROW_UP.shortcutKey, LAST_BUTTON_INDEX)).toBe(1);
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

    it('wraps from the first button to the last and from the last button to the first', () => {
        simulateTab();
        const toolbar = createMiniToolbar();
        const buttons = getToolbarButtons(toolbar);

        getToolbarButton(buttons, 0).focus();
        pressArrow(toolbar, CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey);
        expect(document.activeElement).toBe(getToolbarButton(buttons, LAST_BUTTON_INDEX));

        getToolbarButton(buttons, LAST_BUTTON_INDEX).focus();
        pressArrow(toolbar, CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey);
        expect(document.activeElement).toBe(getToolbarButton(buttons, 0));
    });

    it('does not move focus with ArrowDown or ArrowUp', () => {
        simulateTab();
        const toolbar = createMiniToolbar();
        const buttons = getToolbarButtons(toolbar);
        getToolbarButton(buttons, 1).focus();

        pressArrow(toolbar, CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN.shortcutKey);
        expect(document.activeElement).toBe(getToolbarButton(buttons, 1));

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

    it('does not move focus or preventDefault for modified arrow keys', () => {
        simulateTab();
        const toolbar = createMiniToolbar();
        const buttons = getToolbarButtons(toolbar);
        getToolbarButton(buttons, 0).focus();

        const event = pressArrow(toolbar, CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey, {altKey: true});

        expect(document.activeElement).toBe(getToolbarButton(buttons, 0));
        expect(event.defaultPrevented).toBe(false);
    });
});

describe('moveFullContextMenuFocusWithArrowKey', () => {
    it('moves focus with ArrowRight after Tab', () => {
        simulateTab();
        const {menu, reactionRow} = createFullContextMenu();
        const reactionButtons = getToolbarButtons(reactionRow);
        getToolbarButton(reactionButtons, 0).focus();

        pressFullMenuArrow(menu, CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey);

        expect(document.activeElement).toBe(getToolbarButton(reactionButtons, 1));
    });

    it('wraps from the last reaction back to the first instead of moving onto Reply in thread', () => {
        simulateTab();
        const {menu, reactionRow} = createFullContextMenu();
        const reactionButtons = getToolbarButtons(reactionRow);
        getToolbarButton(reactionButtons, LAST_REACTION_INDEX).focus();

        pressFullMenuArrow(menu, CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey);

        expect(document.activeElement).toBe(getToolbarButton(reactionButtons, 0));
        expect(document.activeElement?.textContent).toBe('thumbs up');
    });

    it('does not move focus with ArrowDown so the vertical list manager can handle it', () => {
        simulateTab();
        const {menu} = createFullContextMenu();
        const reply = getToolbarButton(getToolbarButtons(menu), FULL_MENU_REPLY_INDEX);
        expect(reply.textContent).toBe('Reply in thread');
        reply.focus();

        const event = pressFullMenuArrow(menu, CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN.shortcutKey);

        expect(document.activeElement).toBe(reply);
        expect(event.defaultPrevented).toBe(false);
    });
});
