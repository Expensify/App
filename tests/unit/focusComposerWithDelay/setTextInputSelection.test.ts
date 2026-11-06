import setTextInputSelection from '@libs/focusComposerWithDelay/setTextInputSelection';

import type {ComponentRef} from 'react';
import type {TextInput} from 'react-native';

import createMock from '../../utils/createMock';

let mockUseWebSelection = false;
jest.mock('@libs/shouldSetSelectionRange', () => ({
    __esModule: true,
    default: () => mockUseWebSelection,
}));

function loadSelectionHelper(useWebSelection: boolean): typeof setTextInputSelection {
    mockUseWebSelection = useWebSelection;
    let helper = setTextInputSelection;
    jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        helper = require('@libs/focusComposerWithDelay/setTextInputSelection').default;
    });
    return helper;
}

describe('setTextInputSelection', () => {
    it('uses the browser range method with unchanged endpoints', () => {
        // Given a web textarea selected at module load
        // When a forced range is applied
        // Then only the browser method receives the original endpoints
        const helper = loadSelectionHelper(true);
        const textarea = document.createElement('textarea');
        const setSelectionRange = jest.spyOn(textarea, 'setSelectionRange');
        helper(textarea, {start: 2, end: 5});
        expect(setSelectionRange).toHaveBeenCalledWith(2, 5);
    });

    it('uses the native selection method with unchanged endpoints', () => {
        // Given a native input selected at module load
        // When a forced range is applied
        // Then its native method receives the original endpoints
        const helper = loadSelectionHelper(false);
        const setSelection = jest.fn();
        const input = createMock<ComponentRef<typeof TextInput>>({setSelection});
        helper(input, {start: 4, end: 9});
        expect(setSelection).toHaveBeenCalledWith(4, 9);
    });

    it('accepts inputs without the selected optional capability', () => {
        // Given a native input without setSelection and a textarea without setSelectionRange
        // When each platform-selected helper applies a range
        // Then the optional capability stays optional and neither call throws
        const nativeInput = createMock<ComponentRef<typeof TextInput>>({});
        expect(() => loadSelectionHelper(false)(nativeInput, {start: 0, end: 1})).not.toThrow();
        const textarea = document.createElement('textarea');
        Object.defineProperty(textarea, 'setSelectionRange', {configurable: true, value: undefined});
        expect(() => loadSelectionHelper(true)(textarea, {start: 0, end: 1})).not.toThrow();
    });
});
