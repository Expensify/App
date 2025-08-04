import getKeyEventModifiers from '@libs/KeyboardShortcut/getKeyEventModifiers';

// Mock react-native-key-command constants
jest.mock('react-native-key-command', () => ({
    constants: {
        keyModifierControl: 'keyModifierControl',
        keyModifierCommand: 'keyModifierCommand',
        keyModifierShift: 'keyModifierShift',
        keyModifierShiftControl: 'keyModifierShiftControl',
        keyModifierShiftCommand: 'keyModifierShiftCommand',
    },
}));

describe('getKeyEventModifiers', () => {
    it('should return CONTROL for control modifier', () => {
        const event = {
            input: 'c',
            modifierFlags: 'keyModifierControl',
        };

        const result = getKeyEventModifiers(event);

        expect(result).toEqual(['CONTROL']);
    });

    it('should return META for command modifier', () => {
        const event = {
            input: 'c',
            modifierFlags: 'keyModifierCommand',
        };

        const result = getKeyEventModifiers(event);

        expect(result).toEqual(['META']);
    });

    it('should return CONTROL and Shift for shift+control modifier', () => {
        const event = {
            input: 'c',
            modifierFlags: 'keyModifierShiftControl',
        };

        const result = getKeyEventModifiers(event);

        expect(result).toEqual(['CONTROL', 'Shift']);
    });

    it('should return META and Shift for shift+command modifier', () => {
        const event = {
            input: 'c',
            modifierFlags: 'keyModifierShiftCommand',
        };

        const result = getKeyEventModifiers(event);

        expect(result).toEqual(['META', 'Shift']);
    });

    it('should return Shift for shift modifier', () => {
        const event = {
            input: 'c',
            modifierFlags: 'keyModifierShift',
        };

        const result = getKeyEventModifiers(event);

        expect(result).toEqual(['Shift']);
    });

    it('should return empty array for no modifiers', () => {
        const event = {
            input: 'c',
            modifierFlags: '',
        };

        const result = getKeyEventModifiers(event);

        expect(result).toEqual([]);
    });

    it('should return empty array for unknown modifier', () => {
        const event = {
            input: 'c',
            modifierFlags: 'unknownModifier',
        };

        const result = getKeyEventModifiers(event);

        expect(result).toEqual([]);
    });

    it('should return empty array for undefined modifierFlags', () => {
        const event = {
            input: 'c',
            modifierFlags: undefined,
        };

        const result = getKeyEventModifiers(event);

        expect(result).toEqual([]);
    });
});
