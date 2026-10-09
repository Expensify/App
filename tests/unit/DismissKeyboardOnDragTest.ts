import {Keyboard} from 'react-native';

type DismissKeyboardOnDragModule = {default: () => void};

// Explicit extensions exercise both implementations without relying on Jest's default native resolver.
const dismissKeyboardOnDragWeb = jest.requireActual<DismissKeyboardOnDragModule>('@components/Table/dismissKeyboardOnDrag.ts').default;
const dismissKeyboardOnDragNative = jest.requireActual<DismissKeyboardOnDragModule>('@components/Table/dismissKeyboardOnDrag.native.ts').default;

describe('dismissKeyboardOnDrag', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('preserves web input focus by leaving the keyboard untouched', () => {
        // Given the web implementation, a table drag must preserve the existing focus behavior.
        const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});

        // When the table requests keyboard dismissal on drag.
        dismissKeyboardOnDragWeb();

        // Then the web implementation does not call the native keyboard API.
        expect(dismiss).not.toHaveBeenCalled();
    });

    it('dismisses the native keyboard once per drag request', () => {
        // Given the native implementation, table dragging must match SelectionList's keyboard behavior.
        const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});

        // When the table requests keyboard dismissal on drag.
        dismissKeyboardOnDragNative();

        // Then the native keyboard is dismissed once without changing the caller's event contract.
        expect(dismiss).toHaveBeenCalledTimes(1);
        expect(dismiss).toHaveBeenCalledWith();
    });
});
