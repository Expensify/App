import {AccessibilityInfo} from 'react-native';

const mockSendAccessibilityEvent = jest.fn();
let mockHandle: number | null = 1;

jest.mock('@src/utils/findNodeHandle', () => ({
    __esModule: true,
    default: () => mockHandle,
}));

AccessibilityInfo.sendAccessibilityEvent = mockSendAccessibilityEvent;

// eslint-disable-next-line import/extensions
const fireFocusEvent = require<{default: (view: unknown) => void}>('../../src/libs/Accessibility/fireFocusEvent/index.android').default;

beforeEach(() => {
    mockSendAccessibilityEvent.mockClear();
    mockHandle = 1;
});

describe('fireFocusEvent (Android)', () => {
    it('dispatches sendAccessibilityEvent with `focus` when the view is attached', () => {
        const view = {label: 'pressable'};
        fireFocusEvent(view);
        expect(mockSendAccessibilityEvent).toHaveBeenCalledTimes(1);
        expect(mockSendAccessibilityEvent).toHaveBeenCalledWith(view, 'focus');
    });

    it('skips when findNodeHandle returns null (detached view) — no event dispatched', () => {
        mockHandle = null;
        fireFocusEvent({label: 'detached'});
        expect(mockSendAccessibilityEvent).not.toHaveBeenCalled();
    });
});
