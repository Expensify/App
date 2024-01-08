import getKeyEventModifiers from '@libs/KeyboardShortcut/getKeyEventModifiers';
import type BindHandlerToKeydownEvent from './types';

/**
 * Checks if an event for that key is configured and if so, runs it.
 */
const bindHandlerToKeydownEvent: BindHandlerToKeydownEvent = (getDisplayName, eventHandlers, keyCommandEvent, event) => {
    const eventModifiers = getKeyEventModifiers(keyCommandEvent);
    const displayName = getDisplayName(keyCommandEvent.input, eventModifiers);

    // If we didn't register any event handlers for a key we ignore it
    if (!eventHandlers[displayName]) {
        return;
    }

    // Loop over all the callbacks
    Object.values(eventHandlers[displayName]).every((callback) => {
        // Determine if the event should bubble before executing the callback (which may have side-effects)
        let shouldBubble: boolean | (() => void) | void = callback.shouldBubble || false;
        if (typeof callback.shouldBubble === 'function') {
            shouldBubble = callback.shouldBubble();
        }

        if (typeof callback.callback === 'function') {
            callback.callback(event);
        }

        // If the event should not bubble, short-circuit the loop
        return shouldBubble;
    });
};

export default bindHandlerToKeydownEvent;
