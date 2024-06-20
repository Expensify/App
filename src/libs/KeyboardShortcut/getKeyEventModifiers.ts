import * as KeyCommand from 'react-native-key-command';
import type {KeyCommandEvent} from './bindHandlerToKeydownEvent/types';

const keyModifierControl = KeyCommand?.constants.keyModifierControl ?? 'keyModifierControl';
const keyModifierCommand = KeyCommand?.constants.keyModifierCommand ?? 'keyModifierCommand';
const keyModifierShiftControl = KeyCommand?.constants.keyModifierShiftControl ?? 'keyModifierShiftControl';
const keyModifierShiftCommand = KeyCommand?.constants.keyModifierShiftCommand ?? 'keyModifierShiftCommand';

/**
 * Gets modifiers from a keyboard event.
 */
function getKeyEventModifiers(event: KeyCommandEvent): string[] {
    if (event.modifierFlags === keyModifierControl) {
        return ['CONTROL'];
    }
    if (event.modifierFlags === keyModifierCommand) {
        return ['META'];
    }
    if (event.modifierFlags === keyModifierShiftControl) {
        return ['CONTROL', 'Shift'];
    }
    if (event.modifierFlags === keyModifierShiftCommand) {
        return ['META', 'Shift'];
    }

    return [];
}

export default getKeyEventModifiers;
