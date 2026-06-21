/**
 * @jest-environment jsdom
 */
import {renderHook} from '@testing-library/react-native';
import useModalOverlay from '@components/Overlay/hooks/useModalOverlay';

const mockEscapeRecorder: {isActive: boolean; callback?: () => void} = {isActive: false};
jest.mock('@components/Overlay/hooks/useEscapeKeydown', () => (callback: () => void, options: {isActive: boolean}) => {
    mockEscapeRecorder.isActive = options.isActive;
    mockEscapeRecorder.callback = callback;
});

const mockPointerOutsideRecorder: {isActive: boolean; callback?: () => void} = {isActive: false};
jest.mock('@components/Overlay/hooks/usePointerDownOutside', () => (callback: () => void, _contains: (target: EventTarget | null) => boolean, options: {isActive: boolean}) => {
    mockPointerOutsideRecorder.isActive = options.isActive;
    mockPointerOutsideRecorder.callback = callback;
});

const mockAriaHideRecorder: {isActive: boolean} = {isActive: false};
jest.mock('@components/Overlay/hooks/useAriaHideSiblings', () => (_ref: unknown, isActive: boolean) => {
    mockAriaHideRecorder.isActive = isActive;
});

const mockScrollLockRecorder: {isActive: boolean} = {isActive: false};
jest.mock('@components/Overlay/hooks/useBodyScrollLock', () => (isActive: boolean) => {
    mockScrollLockRecorder.isActive = isActive;
});

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

beforeEach(() => {
    mockEscapeRecorder.isActive = false;
    mockEscapeRecorder.callback = undefined;
    mockPointerOutsideRecorder.isActive = false;
    mockPointerOutsideRecorder.callback = undefined;
    mockAriaHideRecorder.isActive = false;
    mockScrollLockRecorder.isActive = false;
});

describe('useModalOverlay', () => {
    describe('Composition activation gates', () => {
        it('activates Escape, pointer-down-outside, aria-hide-siblings and scroll-lock when isOpen=true and defaults apply', () => {
            renderHook(() => useModalOverlay({isOpen: true, onClose: () => {}}));
            expect(mockEscapeRecorder.isActive).toBe(true);
            expect(mockPointerOutsideRecorder.isActive).toBe(true);
            expect(mockAriaHideRecorder.isActive).toBe(true);
            expect(mockScrollLockRecorder.isActive).toBe(true);
        });

        it('deactivates every effect when isOpen=false', () => {
            renderHook(() => useModalOverlay({isOpen: false, onClose: () => {}}));
            expect(mockEscapeRecorder.isActive).toBe(false);
            expect(mockPointerOutsideRecorder.isActive).toBe(false);
            expect(mockAriaHideRecorder.isActive).toBe(false);
            expect(mockScrollLockRecorder.isActive).toBe(false);
        });

        it('isKeyboardDismissDisabled disables Escape but keeps the other effects active', () => {
            renderHook(() => useModalOverlay({isOpen: true, onClose: () => {}, isKeyboardDismissDisabled: true}));
            expect(mockEscapeRecorder.isActive).toBe(false);
            expect(mockPointerOutsideRecorder.isActive).toBe(true);
        });

        it('isDismissable=false disables pointer-down-outside but keeps Escape active', () => {
            renderHook(() => useModalOverlay({isOpen: true, onClose: () => {}, isDismissable: false}));
            expect(mockPointerOutsideRecorder.isActive).toBe(false);
            expect(mockEscapeRecorder.isActive).toBe(true);
        });

        it('modal=false disables aria-hide and scroll-lock (non-modal mode) but keeps the dismissal channels', () => {
            renderHook(() => useModalOverlay({isOpen: true, onClose: () => {}, modal: false}));
            expect(mockAriaHideRecorder.isActive).toBe(false);
            expect(mockScrollLockRecorder.isActive).toBe(false);
            expect(mockEscapeRecorder.isActive).toBe(true);
            expect(mockPointerOutsideRecorder.isActive).toBe(true);
        });
    });

    describe('underlayProps — backdrop', () => {
        it('routes underlay onPress to onClose when isDismissable and no override', () => {
            const onClose = jest.fn();
            const {result} = renderHook(() => useModalOverlay({isOpen: true, onClose}));
            result.current.underlayProps.onPress?.();
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('uses onBackdropPress override over onClose', () => {
            const onClose = jest.fn();
            const onBackdropPress = jest.fn();
            const {result} = renderHook(() => useModalOverlay({isOpen: true, onClose, onBackdropPress}));
            result.current.underlayProps.onPress?.();
            expect(onBackdropPress).toHaveBeenCalledTimes(1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('clears underlay.onPress (and accessibility metadata) when isDismissable=false and no onBackdropPress is provided', () => {
            const onClose = jest.fn();
            const {result} = renderHook(() => useModalOverlay({isOpen: true, onClose, isDismissable: false}));
            expect(result.current.underlayProps.onPress).toBeUndefined();
            expect(result.current.underlayProps.accessibilityLabel).toBeUndefined();
        });

        it('sets accessibilityLabel via translate when a backdrop press is configured', () => {
            const {result} = renderHook(() => useModalOverlay({isOpen: true, onClose: () => {}}));
            expect(result.current.underlayProps.accessibilityLabel).toBe('modal.backdropLabel');
            expect(result.current.underlayProps.accessible).toBe(true);
        });
    });

    describe('Result shape', () => {
        it('returns a stable containerRef across renders', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars -- renderHook's rerender(props) signature requires the wrapper to accept a props param even when unused.
            const {result, rerender} = renderHook((_props: Record<string, never>) => useModalOverlay({isOpen: true, onClose: () => {}}), {initialProps: {}});
            const first = result.current.containerRef;
            rerender({});
            expect(result.current.containerRef).toBe(first);
        });
    });
});
