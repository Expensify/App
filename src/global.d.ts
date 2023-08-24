declare module '*.png' {
    const value: import('react-native').ImageSourcePropType;
    export default value;
}
declare module '*.jpg' {
    const value: import('react-native').ImageSourcePropType;
    export default value;
}
declare module '*.svg' {
    import React from 'react';
    import {SvgProps} from 'react-native-svg';

    const content: React.FC<SvgProps>;
    export default content;
}

declare module 'react-native-device-info/jest/react-native-device-info-mock';

declare module 'react-native-onyx' {
    import {OnyxKey, OnyxCollectionKey, OnyxValues} from './ONYXKEYS';

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface CustomTypeOptions {
        keys: OnyxKey;
        collectionKeys: OnyxCollectionKey;
        values: OnyxValues;
    }
}

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
