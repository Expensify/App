/**
 * @jest-environment jsdom
 */
import {act, renderHook} from '@testing-library/react-native';

import useDismissOnAnchorMove from '@components/Overlay/hooks/useDismissOnAnchorMove/index.web';
import anchorBoxChanged from '@components/Overlay/hooks/useDismissOnAnchorMove/shared';

function rectAt(left: number, top: number, width = 100, height = 40): DOMRect {
    return {x: left, y: top, left, top, right: left + width, bottom: top + height, width, height, toJSON: () => ({})};
}

function setupAnchor(scrollContainer?: HTMLElement): {anchor: HTMLDivElement; cleanup: () => void} {
    const anchor = document.createElement('div');
    if (scrollContainer) {
        scrollContainer.appendChild(anchor);
    } else {
        document.body.appendChild(anchor);
    }
    return {
        anchor,
        cleanup: () => {
            if (!anchor.parentElement) {
                return;
            }
            anchor.parentElement.removeChild(anchor);
        },
    };
}

describe('useDismissOnAnchorMove (web)', () => {
    it('dismisses on page-level scroll (target = document)', () => {
        const {anchor, cleanup} = setupAnchor();
        const onDismiss = jest.fn();
        renderHook(() => useDismissOnAnchorMove(anchor, onDismiss, true));
        act(() => {
            document.dispatchEvent(new Event('scroll'));
        });
        expect(onDismiss).toHaveBeenCalledTimes(1);
        cleanup();
    });

    it('dismisses on resize when the anchor has reflowed to a new position', () => {
        const {anchor, cleanup} = setupAnchor();
        const onDismiss = jest.fn();
        anchor.getBoundingClientRect = jest.fn(() => rectAt(10, 20));
        renderHook(() => useDismissOnAnchorMove(anchor, onDismiss, true));
        // The anchor moved 180px down between open and resize — a real reflow.
        anchor.getBoundingClientRect = jest.fn(() => rectAt(10, 200));
        act(() => {
            window.dispatchEvent(new Event('resize'));
        });
        expect(onDismiss).toHaveBeenCalledTimes(1);
        cleanup();
    });

    it('does NOT dismiss on resize when the anchor stayed put (mobile soft keyboard / URL-bar viewport resize)', () => {
        const {anchor, cleanup} = setupAnchor();
        const onDismiss = jest.fn();
        anchor.getBoundingClientRect = jest.fn(() => rectAt(10, 20));
        renderHook(() => useDismissOnAnchorMove(anchor, onDismiss, true));
        act(() => {
            window.dispatchEvent(new Event('resize'));
        });
        expect(onDismiss).not.toHaveBeenCalled();
        cleanup();
    });

    it('dismisses on resize when the anchor changed size but not position (right/bottom edges)', () => {
        const {anchor, cleanup} = setupAnchor();
        const onDismiss = jest.fn();
        anchor.getBoundingClientRect = jest.fn(() => rectAt(10, 20, 100, 40));
        renderHook(() => useDismissOnAnchorMove(anchor, onDismiss, true));
        anchor.getBoundingClientRect = jest.fn(() => rectAt(10, 20, 200, 40));
        act(() => {
            window.dispatchEvent(new Event('resize'));
        });
        expect(onDismiss).toHaveBeenCalledTimes(1);
        cleanup();
    });

    it('fires onDismiss at most once across repeated scroll events in a single gesture', () => {
        const {anchor, cleanup} = setupAnchor();
        const onDismiss = jest.fn();
        renderHook(() => useDismissOnAnchorMove(anchor, onDismiss, true));
        act(() => {
            document.dispatchEvent(new Event('scroll'));
            document.dispatchEvent(new Event('scroll'));
            document.dispatchEvent(new Event('scroll'));
        });
        expect(onDismiss).toHaveBeenCalledTimes(1);
        cleanup();
    });

    it('dismisses when a scrollable ancestor of the anchor scrolls', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const {anchor, cleanup} = setupAnchor(container);
        const onDismiss = jest.fn();
        renderHook(() => useDismissOnAnchorMove(anchor, onDismiss, true));
        act(() => {
            container.dispatchEvent(new Event('scroll'));
        });
        expect(onDismiss).toHaveBeenCalledTimes(1);
        cleanup();
        document.body.removeChild(container);
    });

    it('does NOT dismiss when the anchor element itself is the scroll target (target === anchorHost)', () => {
        const {anchor, cleanup} = setupAnchor();
        const onDismiss = jest.fn();
        renderHook(() => useDismissOnAnchorMove(anchor, onDismiss, true));
        act(() => {
            anchor.dispatchEvent(new Event('scroll'));
        });
        expect(onDismiss).not.toHaveBeenCalled();
        cleanup();
    });

    it('does NOT dismiss when an unrelated element scrolls (overlay-internal or sibling)', () => {
        const {anchor, cleanup} = setupAnchor();
        const onDismiss = jest.fn();
        renderHook(() => useDismissOnAnchorMove(anchor, onDismiss, true));
        const unrelated = document.createElement('div');
        document.body.appendChild(unrelated);
        act(() => {
            unrelated.dispatchEvent(new Event('scroll'));
        });
        expect(onDismiss).not.toHaveBeenCalled();
        document.body.removeChild(unrelated);
        cleanup();
    });

    it('does not subscribe when isActive is false', () => {
        const {anchor, cleanup} = setupAnchor();
        const onDismiss = jest.fn();
        renderHook(() => useDismissOnAnchorMove(anchor, onDismiss, false));
        act(() => {
            window.dispatchEvent(new Event('resize'));
        });
        expect(onDismiss).not.toHaveBeenCalled();
        cleanup();
    });

    it('does not subscribe when anchor is null', () => {
        const onDismiss = jest.fn();
        renderHook(() => useDismissOnAnchorMove(null, onDismiss, true));
        act(() => {
            window.dispatchEvent(new Event('resize'));
        });
        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('unsubscribes on unmount', () => {
        const {anchor, cleanup} = setupAnchor();
        const onDismiss = jest.fn();
        const {unmount} = renderHook(() => useDismissOnAnchorMove(anchor, onDismiss, true));
        unmount();
        act(() => {
            window.dispatchEvent(new Event('resize'));
        });
        expect(onDismiss).not.toHaveBeenCalled();
        cleanup();
    });
});

let ioCallback: ((entries: Array<{isIntersecting: boolean}>) => void) | undefined;
const ioObserve = jest.fn();
const ioDisconnect = jest.fn();

class MockIntersectionObserver {
    observe = ioObserve;

    disconnect = ioDisconnect;

    constructor(callback: (entries: Array<{isIntersecting: boolean}>) => void) {
        ioCallback = callback;
    }
}

function installMockIntersectionObserver(): () => void {
    const originalIO = globalThis.IntersectionObserver;
    ioCallback = undefined;
    ioObserve.mockClear();
    ioDisconnect.mockClear();
    Object.defineProperty(globalThis, 'IntersectionObserver', {value: MockIntersectionObserver, configurable: true, writable: true});
    return () => Object.defineProperty(globalThis, 'IntersectionObserver', {value: originalIO, configurable: true, writable: true});
}

describe('useDismissOnAnchorMove (web) — anchor leaves viewport / is removed', () => {
    it('dismisses via IntersectionObserver when the anchor stops intersecting the viewport', () => {
        const restoreIO = installMockIntersectionObserver();
        const {anchor, cleanup} = setupAnchor();
        const onDismiss = jest.fn();
        const {unmount} = renderHook(() => useDismissOnAnchorMove(anchor, onDismiss, true));
        expect(ioObserve).toHaveBeenCalledWith(anchor);

        act(() => ioCallback?.([{isIntersecting: true}]));
        expect(onDismiss).not.toHaveBeenCalled();

        act(() => ioCallback?.([{isIntersecting: false}]));
        expect(onDismiss).toHaveBeenCalledTimes(1);

        unmount();
        expect(ioDisconnect).toHaveBeenCalled();
        restoreIO();
        cleanup();
    });

    it('does NOT dismiss when the initial observer callback reports the anchor already off-screen', () => {
        const restoreIO = installMockIntersectionObserver();
        const {anchor, cleanup} = setupAnchor();
        const onDismiss = jest.fn();
        renderHook(() => useDismissOnAnchorMove(anchor, onDismiss, true));
        act(() => ioCallback?.([{isIntersecting: false}]));
        expect(onDismiss).not.toHaveBeenCalled();
        act(() => ioCallback?.([{isIntersecting: true}]));
        act(() => ioCallback?.([{isIntersecting: false}]));
        expect(onDismiss).toHaveBeenCalledTimes(1);

        restoreIO();
        cleanup();
    });

    it('DOES dismiss on the initial observation when the anchor is already detached (removed before open)', () => {
        const restoreIO = installMockIntersectionObserver();
        const anchor = document.createElement('div');
        const onDismiss = jest.fn();
        renderHook(() => useDismissOnAnchorMove(anchor, onDismiss, true));
        act(() => ioCallback?.([{isIntersecting: false}]));
        expect(onDismiss).toHaveBeenCalledTimes(1);

        restoreIO();
    });
});

// The shared 4-edge comparison drives dismissal on both web (resize) and native (Dimensions change).
describe('anchorBoxChanged (shared web + native)', () => {
    const box = {left: 10, top: 20, right: 110, bottom: 60};

    it('is false when every edge is within the sub-pixel epsilon', () => {
        expect(anchorBoxChanged({left: 10.5, top: 20.5, right: 110.5, bottom: 60.5}, box)).toBe(false);
    });

    it('is true when the position moved (left/top)', () => {
        expect(anchorBoxChanged({left: 10, top: 200, right: 110, bottom: 240}, box)).toBe(true);
    });

    it('is true when only the size changed (right/bottom edges)', () => {
        expect(anchorBoxChanged({left: 10, top: 20, right: 210, bottom: 60}, box)).toBe(true);
    });
});
