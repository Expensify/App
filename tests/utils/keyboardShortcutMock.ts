import type {KeyCommandEvent} from '@libs/KeyboardShortcut/bindHandlerToKeydownEvent/types';

type KeyCommandListener = (keyCommandEvent: KeyCommandEvent, event: KeyboardEvent) => void;

/**
 * Factory for `jest.mock('react-native-key-command', ...)`. The stock KeyCommand mock is a no-op, so this one captures the
 * listeners `KeyboardShortcut` registers on import, to drive a key press through its real handler stack. They live on the
 * mock itself because the import runs before the test file's body.
 */
function keyCommandMock() {
    const listeners: KeyCommandListener[] = [];
    return {
        constants: {},
        addListener: (_trigger: unknown, listener: KeyCommandListener) => {
            listeners.push(listener);
            return () => {};
        },
        listeners,
    };
}

/** Dispatches Escape through the captured `KeyboardShortcut` listener, optionally from `target` (e.g. a focused input). */
function pressEscape(target?: HTMLElement) {
    const listener = jest.requireMock<{listeners: KeyCommandListener[]}>('react-native-key-command').listeners.at(0);
    if (!listener) {
        throw new Error('KeyboardShortcut registered no KeyCommand listener.');
    }
    const keyCommandEvent = {input: 'keyInputEscape'};
    const event = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true});
    if (!target) {
        listener(keyCommandEvent, event);
        return;
    }
    target.addEventListener('keydown', (dispatched) => listener(keyCommandEvent, dispatched), {once: true});
    target.dispatchEvent(event);
}

export {keyCommandMock, pressEscape};
