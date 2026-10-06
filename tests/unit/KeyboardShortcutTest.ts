import KeyboardShortcut from '@libs/KeyboardShortcut';
import bindHandlerToKeydownEvent from '@libs/KeyboardShortcut/bindHandlerToKeydownEvent';

import CONST from '@src/CONST';

import * as KeyCommand from 'react-native-key-command';

jest.mock('@libs/getOperatingSystem', () => () => 'Mac OS');
jest.mock('@libs/KeyboardShortcut/bindHandlerToKeydownEvent', () => jest.fn());
jest.mock('react-native-key-command', () => ({
    constants: {},
    addListener: jest.fn(),
}));

const mockedBindHandler = jest.mocked(bindHandlerToKeydownEvent);

describe('KeyboardShortcut', () => {
    beforeEach(() => {
        mockedBindHandler.mockClear();
    });

    it('keeps normalized display text and unknown modifier text', () => {
        // Given mixed case and an undocumented modifier.
        // When the exported display formatter runs.
        // Then known tokens map and unknown text survives.
        expect(KeyboardShortcut.getDisplayName('escape', ['meta', 'custom'])).toBe('custom + CMD + ESC');
        expect(KeyboardShortcut.getDisplayName(' ', 'shift')).toBe('Shift + SPACE');
    });

    it('maps platform modifiers without changing the exported tuple contract', () => {
        // Given macOS and CTRL plus SHIFT.
        // When the exported platform mapper runs.
        // Then only CTRL changes to meta.
        expect(KeyboardShortcut.getPlatformEquivalentForKeys(['CTRL', 'SHIFT'])).toEqual(['meta', 'shift']);
    });

    it('registers OS triggers and maintains priority and callback identity on unsubscribe', () => {
        // Given two handlers for one key.
        // When the first subscription is removed.
        // Then the second retains its callback identity and priority.
        const first = jest.fn();
        const second = jest.fn();
        const unsubscribeFirst = KeyboardShortcut.subscribe('q', first, 'first', ['CTRL'], false, false, 0);
        const unsubscribeSecond = KeyboardShortcut.subscribe('q', second, 'second', ['CTRL'], false, false, 1);
        const listener = jest.mocked(KeyCommand.addListener).mock.calls.at(0)?.[1];
        expect(jest.mocked(KeyCommand.addListener).mock.calls.length).toBeGreaterThan(0);
        listener?.({input: 'q'}, new KeyboardEvent('keydown'));
        const handlers = mockedBindHandler.mock.calls.at(-1)?.[1];
        expect(handlers?.['CMD + Q'].map(({callback}) => callback)).toEqual([first, second]);
        unsubscribeFirst();
        listener?.({input: 'q'}, new KeyboardEvent('keydown'));
        expect(mockedBindHandler.mock.calls.at(-1)?.[1]?.['CMD + Q'].map(({callback}) => callback)).toEqual([second]);
        unsubscribeSecond();
    });

    it.each([
        ['Mac OS', CONST.KEYBOARD_SHORTCUTS.SEARCH.trigger['Mac OS'], 'meta', 'CMD + Shift + K'],
        ['Windows', CONST.KEYBOARD_SHORTCUTS.SEARCH.trigger.DEFAULT, 'control', 'CTRL + Shift + K'],
        [undefined, CONST.KEYBOARD_SHORTCUTS.SEARCH.trigger.DEFAULT, 'control', 'CTRL + Shift + K'],
    ])('selects the real trigger and modifier fallback for %s', (os, searchTrigger, controlModifier, displayName) => {
        // Given a fresh shortcut module for the selected operating system.
        // When module initialization registers real CONST triggers and maps modifiers.
        // Then the OS trigger or default and ordered display name match that system.
        jest.resetModules();
        jest.doMock('@libs/getOperatingSystem', () => () => os);
        jest.isolateModules(() => {
            const isolatedKeyCommand = require<typeof KeyCommand>('react-native-key-command');
            jest.mocked(isolatedKeyCommand.addListener).mockClear();
            const isolatedShortcut = require<{
                default: typeof KeyboardShortcut;
            }>('@libs/KeyboardShortcut').default;
            const triggers = jest.mocked(isolatedKeyCommand.addListener).mock.calls.map(([trigger]) => trigger);
            expect(triggers).toContainEqual(searchTrigger);
            expect(triggers).toContainEqual(CONST.KEYBOARD_SHORTCUTS.MARK_ALL_MESSAGES_AS_READ.trigger.DEFAULT);
            expect(triggers).not.toContain(undefined);
            expect(triggers).toHaveLength(Object.values(CONST.KEYBOARD_SHORTCUTS).filter((shortcut) => 'trigger' in shortcut).length);
            expect(isolatedShortcut.getPlatformEquivalentForKeys(['CTRL', 'SHIFT'])).toEqual([controlModifier, 'shift']);
            expect(isolatedShortcut.getDisplayName('k', ['shift', controlModifier])).toBe(displayName);
        });
    });
});
