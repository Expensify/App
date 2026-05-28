import {AccessibilityInfo} from 'react-native';

const mockSendAccessibilityEvent = jest.fn();
AccessibilityInfo.sendAccessibilityEvent = mockSendAccessibilityEvent;

const fireFocusEvent = require<{default: (view: unknown) => void}>('../../src/libs/Accessibility/fireFocusEvent/index.native').default;

beforeEach(() => {
    mockSendAccessibilityEvent.mockClear();
});

describe('fireFocusEvent (native)', () => {
    it('dispatches sendAccessibilityEvent with `focus` for the given view', () => {
        const view = {label: 'pressable'};
        fireFocusEvent(view);
        expect(mockSendAccessibilityEvent).toHaveBeenCalledTimes(1);
        expect(mockSendAccessibilityEvent).toHaveBeenCalledWith(view, 'focus');
    });
});
