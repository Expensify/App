/* eslint-disable @typescript-eslint/naming-convention */
declare module 'react-native-key-command' {
    // eslint-disable-next-line no-restricted-syntax
    enum constants {
        keyInputDownArrow = 'keyInputDownArrow',
        keyInputEscape = 'keyInputEscape',
        keyInputLeftArrow = 'keyInputLeftArrow',
        keyInputRightArrow = 'keyInputRightArrow',
        keyInputUpArrow = 'keyInputUpArrow',
        keyInputEnter = 'keyInputEnter',
        keyModifierCapsLock = 'keyModifierCapsLock',
        keyModifierCommand = 'keyModifierCommand',
        keyModifierControl = 'keyModifierControl',
        keyModifierControlCommand = 'keyModifierControlCommand',
        keyModifierControlOption = 'keyModifierControlOption',
        keyModifierControlOptionCommand = 'keyModifierControlOptionCommand',
        keyModifierNumericPad = 'keyModifierNumericPad',
        keyModifierOption = 'keyModifierOption',
        keyModifierOptionCommand = 'keyModifierOptionCommand',
        keyModifierShift = 'keyModifierShift',
        keyModifierShiftCommand = 'keyModifierShiftCommand',
        keyModifierShiftControl = 'keyModifierShiftControl',
        keyModifierAlternate = 'keyModifierAlternate',
    }

    type KeyCommand = {input: string; modifierFlags?: string};

    declare function addListener(keyCommand: KeyCommand, callback: (keycommandEvent: KeyCommand, event: KeyboardEvent) => void): () => void;
    declare function registerKeyCommands(): void;
    declare function unregisterKeyCommands(): void;
    declare function eventEmitter(): void;

    // eslint-disable-next-line import/prefer-default-export
    export {constants, addListener, registerKeyCommands, unregisterKeyCommands, eventEmitter};
}
