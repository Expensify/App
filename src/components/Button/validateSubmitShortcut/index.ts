import type ValidateSubmitShortcut from './types';

const IGNORED_NODE_NAMES = ['TEXTAREA', 'INPUT'];

/**
 * Validate if the submit shortcut should be triggered depending on the button state
 *
 * @param isDisabled Indicates whether the button should be disabled
 * @param isLoading Indicates whether the button should be disabled and in the loading state
 * @param event Focused input event
 * @returns Returns `true` if the shortcut should be triggered
 */

const validateSubmitShortcut: ValidateSubmitShortcut = (isDisabled, isLoading, event) => {
    const eventTarget = event?.target as HTMLElement;

    // If the event target node is for an input, such as when there's a stray "Enter" event from an autocomplete input, then ignore it because it's not meant for this button
    if (isDisabled || isLoading || IGNORED_NODE_NAMES.includes(eventTarget.nodeName) || (eventTarget?.contentEditable === 'true' && eventTarget.ariaMultiLine)) {
        return false;
    }

    event?.preventDefault();
    return true;
};

export default validateSubmitShortcut;
