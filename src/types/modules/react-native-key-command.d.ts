declare module 'react-native-key-command' {
    declare const constants = {
        keyInputDownArrow: 'keyInputDownArrow',
        keyInputEscape: 'keyInputEscape',
        keyInputLeftArrow: 'keyInputLeftArrow',
        keyInputRightArrow: 'keyInputRightArrow',
        keyInputUpArrow: 'keyInputUpArrow',
        keyInputEnter: 'keyInputEnter',
        keyModifierCapsLock: 'keyModifierCapsLock',
        keyModifierCommand: 'keyModifierCommand',
        keyModifierControl: 'keyModifierControl',
        keyModifierControlCommand: 'keyModifierControlCommand',
        keyModifierControlOption: 'keyModifierControlOption',
        keyModifierControlOptionCommand: 'keyModifierControlOptionCommand',
        keyModifierNumericPad: 'keyModifierNumericPad',
        keyModifierOption: 'keyModifierOption',
        keyModifierOptionCommand: 'keyModifierOptionCommand',
        keyModifierShift: 'keyModifierShift',
        keyModifierShiftCommand: 'keyModifierShiftCommand',
        keyModifierShiftControl: 'keyModifierShiftControl',
        keyModifierAlternate: 'keyModifierAlternate',
    } as const;

    type KeyCommand = {input: string; modifierFlags: string};

    declare function addListener(keyCommand: KeyCommand, callback: (keycommandEvent: KeyCommand, event: Event) => void): () => void;

    // eslint-disable-next-line import/prefer-default-export
    export {constants, addListener};
}
