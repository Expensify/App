import {AccessibilityInfo} from 'react-native';

const fireFocusEvent = require<{default: (view: unknown) => void}>('../../src/libs/Accessibility/fireFocusEvent/index.android').default;

const mockSendAccessibilityEvent = jest.fn();
AccessibilityInfo.sendAccessibilityEvent = mockSendAccessibilityEvent;

beforeEach(() => {
    mockSendAccessibilityEvent.mockClear();
});

describe('fireFocusEvent (Android)', () => {
    it('fires both `focus` and `viewHoverEnter` so TalkBack honours the focus move', () => {
        const view = {label: 'back-button'};
        fireFocusEvent(view);
        expect(mockSendAccessibilityEvent).toHaveBeenCalledTimes(2);
        expect(mockSendAccessibilityEvent).toHaveBeenNthCalledWith(1, view, 'focus');
        expect(mockSendAccessibilityEvent).toHaveBeenNthCalledWith(2, view, 'viewHoverEnter');
    });
});
