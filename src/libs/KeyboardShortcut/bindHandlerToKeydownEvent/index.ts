import getKeyEventModifiers from '../getKeyEventModifiers';
import isEnterWhileComposition from '../isEnterWhileComposition';
import BindHandlerToKeydownEvent from './types';

/**
 * Checks if an event for that key is configured and if so, runs it.
 */
const bindHandlerToKeydownEvent: BindHandlerToKeydownEvent = (getDisplayName, eventHandlers, keyCommandEvent, event) => {
    if (!(event instanceof KeyboardEvent) || isEnterWhileComposition(event)) {
        return;
    }

    const eventModifiers = getKeyEventModifiers(keyCommandEvent);
    const displayName = getDisplayName(keyCommandEvent.input, eventModifiers);

    // Loop over all the callbacks
    Object.values(eventHandlers[displayName]).every((callback) => {
        const textArea = event.target as HTMLTextAreaElement;
        const contentEditable = textArea?.contentEditable;
        const nodeName = textArea?.nodeName;

        // Early return for excludedNodes
        if (callback.excludedNodes.includes(nodeName)) {
            return true;
        }

        // If configured to do so, prevent input text control to trigger this event
        if (!callback.captureOnInputs && (nodeName === 'INPUT' || nodeName === 'TEXTAREA' || contentEditable === 'true')) {
            return true;
        }

        // Determine if the event should bubble before executing the callback (which may have side-effects)
        let shouldBubble: boolean | (() => void) | void = callback.shouldBubble || false;
        if (typeof callback.shouldBubble === 'function') {
            shouldBubble = callback.shouldBubble();
        }

        if (typeof callback.callback === 'function') {
            callback.callback(event);
        }

        if (callback.shouldPreventDefault) {
            event.preventDefault();
        }

        // If the event should not bubble, short-circuit the loop
        return shouldBubble;
    });
};

export default bindHandlerToKeydownEvent;
