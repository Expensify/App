import {AccessibilityInfo} from 'react-native';

const mockLogWarn = jest.fn();
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        warn: (...args: unknown[]): void => {
            mockLogWarn(...args);
        },
        info: jest.fn(),
        alert: jest.fn(),
        hmmm: jest.fn(),
        client: jest.fn(),
    },
}));

const mockSendAccessibilityEvent = jest.fn();
AccessibilityInfo.sendAccessibilityEvent = mockSendAccessibilityEvent;

const fireFocusEvent = require<{default: (view: unknown) => boolean}>('../../src/libs/Accessibility/fireFocusEvent/index.native').default;

beforeEach(() => {
    mockSendAccessibilityEvent.mockClear();
    mockLogWarn.mockClear();
});

describe('fireFocusEvent (native)', () => {
    it('dispatches sendAccessibilityEvent with `focus` for the given view and returns true', () => {
        const view = {label: 'pressable'};
        expect(fireFocusEvent(view)).toBe(true);
        expect(mockSendAccessibilityEvent).toHaveBeenCalledTimes(1);
        expect(mockSendAccessibilityEvent).toHaveBeenCalledWith(view, 'focus');
    });

    it('returns false and logs (does not rethrow) when sendAccessibilityEvent throws on a stale native handle', () => {
        mockSendAccessibilityEvent.mockImplementationOnce(() => {
            throw new Error('View has been removed');
        });
        const view = {label: 'detached'};

        expect(fireFocusEvent(view)).toBe(false);
        expect(mockLogWarn).toHaveBeenCalled();
    });
});
