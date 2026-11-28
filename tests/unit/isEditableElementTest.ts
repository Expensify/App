import isEditableElement from '@libs/isEditableElement';

describe('isEditableElement', () => {
    it('returns true for text inputs and text areas', () => {
        // Given a text input and a textarea, which open the soft keyboard when focused
        const input = document.createElement('input');
        const textarea = document.createElement('textarea');

        // When they are checked
        // Then both count as editable, so the landscape keyboard layout turns on for them
        expect(isEditableElement(input)).toBe(true);
        expect(isEditableElement(textarea)).toBe(true);
    });

    it('returns false for inputs that take no text', () => {
        // Given focusable inputs of types that never open the soft keyboard
        const inputs = ['checkbox', 'radio', 'file', 'button', 'range'].map((type) => {
            const input = document.createElement('input');
            input.type = type;
            return input;
        });

        // When they are checked
        // Then none counts as editable, otherwise focusing them would hide the tab bar with no keyboard shown
        for (const input of inputs) {
            expect(isEditableElement(input)).toBe(false);
        }
    });

    it('returns false for inputs that cannot open the keyboard', () => {
        // Given inputs that are read-only, disabled, or have `inputMode` 'none' like the in-app number pad's amount field
        const readOnlyInput = document.createElement('input');
        readOnlyInput.readOnly = true;
        const disabledInput = document.createElement('input');
        disabledInput.disabled = true;
        const noKeyboardInput = document.createElement('input');
        noKeyboardInput.inputMode = 'none';

        // When they are checked
        // Then none counts as editable, because the browser keeps the keyboard closed for them
        expect(isEditableElement(readOnlyInput)).toBe(false);
        expect(isEditableElement(disabledInput)).toBe(false);
        expect(isEditableElement(noKeyboardInput)).toBe(false);
    });

    it('returns false for elements that are not inputs and for no element', () => {
        // Given a plain element, and the null a focus event carries when focus leaves the page
        const div = document.createElement('div');

        // When they are checked
        // Then neither counts as editable, so the layout returns to normal when the input loses focus
        expect(isEditableElement(div)).toBe(false);
        expect(isEditableElement(null)).toBe(false);
    });
});
