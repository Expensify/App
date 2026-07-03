/**
 * @jest-environment jsdom
 */
import {act, renderHook} from '@testing-library/react-native';

import useDismissOnAnchorMove from '@components/Overlay/hooks/useDismissOnAnchorMove/index.web';

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

    it('dismisses on resize', () => {
        const {anchor, cleanup} = setupAnchor();
        const onDismiss = jest.fn();
        renderHook(() => useDismissOnAnchorMove(anchor, onDismiss, true));
        act(() => {
            window.dispatchEvent(new Event('resize'));
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
