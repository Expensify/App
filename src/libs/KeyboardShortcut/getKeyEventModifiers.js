import * as KeyCommand from 'react-native-key-command';
import lodashGet from 'lodash/get';

/**
 * Gets modifiers from a keyboard event.
 *
 * @param {Event} event
 * @returns {Array<String>}
 */
function getKeyEventModifiers(event) {
    if (event.modifierFlags === lodashGet(KeyCommand, 'constants.keyModifierControl', 'keyModifierControl')) {
        return ['CONTROL'];
    }
    if (event.modifierFlags === lodashGet(KeyCommand, 'constants.keyModifierCommand', 'keyModifierCommand')) {
        return ['META'];
    }
    if (event.modifierFlags === lodashGet(KeyCommand, 'constants.keyModifierShiftControl', 'keyModifierShiftControl')) {
        return ['CONTROL', 'Shift'];
    }
    if (event.modifierFlags === lodashGet(KeyCommand, 'constants.keyModifierShiftCommand', 'keyModifierShiftCommand')) {
        return ['META', 'Shift'];
    }

    return [];
}

export default getKeyEventModifiers;
