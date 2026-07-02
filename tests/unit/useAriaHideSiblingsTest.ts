/**
 * @jest-environment jsdom
 */
import {act, renderHook} from '@testing-library/react-native';
import type {RefObject} from 'react';
import useAriaHideSiblings from '@components/Overlay/hooks/useAriaHideSiblings/index.web';
import type {AnchorNode} from '@components/Overlay/libs/measureAnchor';

type AnchorRef = RefObject<AnchorNode | null>;

function createBodyChild(testID: string, opts: {portal?: boolean} = {}): HTMLDivElement {
    const el = document.createElement('div');
    el.dataset.testid = testID;
    if (opts.portal) {
        el.dataset.overlayPortal = 'true';
    }
    document.body.appendChild(el);
    return el;
}

function refTo(el: HTMLDivElement): AnchorRef {
    return {current: el};
}

function attrs(el: HTMLElement): {ariaHidden: string | null; inert: string | null} {
    return {ariaHidden: el.getAttribute('aria-hidden'), inert: el.getAttribute('inert')};
}

beforeEach(() => {
    document.body.innerHTML = '';
});

describe('useAriaHideSiblings (web)', () => {
    describe('Single layer', () => {
        it('hides body-level siblings on mount and restores them on unmount', () => {
            const siblingA = createBodyChild('sibling-A');
            const siblingB = createBodyChild('sibling-B');
            const portalRoot = createBodyChild('portal-root');
            const container = document.createElement('div');
            portalRoot.appendChild(container);

            const {unmount} = renderHook(() => useAriaHideSiblings(refTo(container), true));

            expect(attrs(siblingA)).toEqual({ariaHidden: 'true', inert: ''});
            expect(attrs(siblingB)).toEqual({ariaHidden: 'true', inert: ''});
            expect(attrs(portalRoot)).toEqual({ariaHidden: null, inert: null});

            unmount();
            expect(attrs(siblingA)).toEqual({ariaHidden: null, inert: null});
            expect(attrs(siblingB)).toEqual({ariaHidden: null, inert: null});
        });

        it('preserves prior aria-hidden / inert values when releasing', () => {
            const sibling = createBodyChild('sibling-with-prior');
            sibling.setAttribute('aria-hidden', 'false');
            sibling.setAttribute('inert', 'true');
            const portalRoot = createBodyChild('portal-root');
            const container = document.createElement('div');
            portalRoot.appendChild(container);

            const {unmount} = renderHook(() => useAriaHideSiblings(refTo(container), true));
            expect(attrs(sibling)).toEqual({ariaHidden: 'true', inert: ''});

            unmount();
            expect(attrs(sibling)).toEqual({ariaHidden: 'false', inert: 'true'});
        });

        it('does not clobber a concurrent aria-hidden / inert mutation made by another owner during the lock', () => {
            const sibling = createBodyChild('sibling-concurrent');
            const portalRoot = createBodyChild('portal-root');
            const container = document.createElement('div');
            portalRoot.appendChild(container);

            const {unmount} = renderHook(() => useAriaHideSiblings(refTo(container), true));
            expect(attrs(sibling)).toEqual({ariaHidden: 'true', inert: ''});

            sibling.setAttribute('aria-hidden', 'false');
            sibling.setAttribute('inert', 'concurrent');

            unmount();
            expect(attrs(sibling)).toEqual({ariaHidden: 'false', inert: 'concurrent'});
        });

        it('is a no-op when isActive is false', () => {
            const sibling = createBodyChild('sibling');
            const portalRoot = createBodyChild('portal-root');
            const container = document.createElement('div');
            portalRoot.appendChild(container);

            renderHook(() => useAriaHideSiblings(refTo(container), false));
            expect(attrs(sibling)).toEqual({ariaHidden: null, inert: null});
        });

        it('hides LOWER overlay portals (earlier in DOM order) and exempts HIGHER overlay portals (later in DOM order)', () => {
            const normal = createBodyChild('normal');
            const lowerPortal = createBodyChild('lower-portal', {portal: true});
            const portalRoot = createBodyChild('portal-root');
            const container = document.createElement('div');
            portalRoot.appendChild(container);
            const higherPortal = createBodyChild('higher-portal', {portal: true});

            renderHook(() => useAriaHideSiblings(refTo(container), true));
            expect(attrs(normal)).toEqual({ariaHidden: 'true', inert: ''});
            expect(attrs(lowerPortal)).toEqual({ariaHidden: 'true', inert: ''});
            expect(attrs(higherPortal)).toEqual({ariaHidden: null, inert: null});
        });
    });

    describe('Refcount across nested layers', () => {
        it('keeps siblings hidden while ANY layer is active; restores only after the last layer unmounts', () => {
            const sibling = createBodyChild('shared-sibling');
            const portalA = createBodyChild('portal-A');
            const containerA = document.createElement('div');
            portalA.appendChild(containerA);
            const portalB = createBodyChild('portal-B');
            const containerB = document.createElement('div');
            portalB.appendChild(containerB);

            const layerA = renderHook(() => useAriaHideSiblings(refTo(containerA), true));
            expect(attrs(sibling)).toEqual({ariaHidden: 'true', inert: ''});

            const layerB = renderHook(() => useAriaHideSiblings(refTo(containerB), true));
            expect(attrs(sibling)).toEqual({ariaHidden: 'true', inert: ''});

            layerA.unmount();
            expect(attrs(sibling)).toEqual({ariaHidden: 'true', inert: ''});

            layerB.unmount();
            expect(attrs(sibling)).toEqual({ariaHidden: null, inert: null});
        });
    });

    describe('Observer stack — late-mounted siblings', () => {
        async function tickMutations() {
            await act(async () => {
                await Promise.resolve();
                await Promise.resolve();
            });
        }

        it('hides a sibling appended to body AFTER the hook mounts', async () => {
            createBodyChild('initial-sibling');
            const portalRoot = createBodyChild('portal-root');
            const container = document.createElement('div');
            portalRoot.appendChild(container);

            renderHook(() => useAriaHideSiblings(refTo(container), true));

            const late = createBodyChild('late-sibling');
            await tickMutations();

            expect(attrs(late)).toEqual({ariaHidden: 'true', inert: ''});
        });

        it('reconnects the previous layer when the topmost layer unmounts', async () => {
            const sibling = createBodyChild('sibling');
            const portalA = createBodyChild('portal-A');
            const containerA = document.createElement('div');
            portalA.appendChild(containerA);
            const portalB = createBodyChild('portal-B');
            const containerB = document.createElement('div');
            portalB.appendChild(containerB);

            renderHook(() => useAriaHideSiblings(refTo(containerA), true));
            const layerB = renderHook(() => useAriaHideSiblings(refTo(containerB), true));

            layerB.unmount();

            const lateAfterTopUnmount = createBodyChild('late-after-top-unmount');
            await tickMutations();

            expect(attrs(lateAfterTopUnmount)).toEqual({ariaHidden: 'true', inert: ''});
            expect(attrs(sibling)).toEqual({ariaHidden: 'true', inert: ''});
        });

        it('keeps the observer live after the LOWER of two overlays closes out-of-order, still hiding a late sibling', async () => {
            const sibling = createBodyChild('shared-sibling');
            const portalA = createBodyChild('portal-A', {portal: true});
            const containerA = document.createElement('div');
            portalA.appendChild(containerA);
            const portalB = createBodyChild('portal-B', {portal: true});
            const containerB = document.createElement('div');
            portalB.appendChild(containerB);

            const layerA = renderHook(() => useAriaHideSiblings(refTo(containerA), true));
            const layerB = renderHook(() => useAriaHideSiblings(refTo(containerB), true));

            expect(attrs(sibling)).toEqual({ariaHidden: 'true', inert: ''});
            expect(attrs(portalA)).toEqual({ariaHidden: 'true', inert: ''});
            expect(attrs(portalB)).toEqual({ariaHidden: null, inert: null});

            layerA.unmount();
            expect(attrs(sibling)).toEqual({ariaHidden: 'true', inert: ''});
            expect(attrs(portalA)).toEqual({ariaHidden: 'true', inert: ''});

            const late = createBodyChild('late-sibling');
            await tickMutations();
            expect(attrs(late)).toEqual({ariaHidden: 'true', inert: ''});

            layerB.unmount();
            expect(attrs(sibling)).toEqual({ariaHidden: null, inert: null});
            expect(attrs(portalA)).toEqual({ariaHidden: null, inert: null});
            expect(attrs(late)).toEqual({ariaHidden: null, inert: null});
        });
    });

    describe('Restore guard — concurrent legacy mutations', () => {
        it('leaves aria-hidden alone on release if a concurrent legacy mutation changed it from our value', () => {
            const sibling = createBodyChild('legacy-target');
            const portal = createBodyChild('portal', {portal: true});
            const container = document.createElement('div');
            portal.appendChild(container);

            const layer = renderHook(() => useAriaHideSiblings(refTo(container), true));
            expect(attrs(sibling).ariaHidden).toBe('true');

            sibling.setAttribute('aria-hidden', 'false');

            layer.unmount();

            expect(sibling.getAttribute('aria-hidden')).toBe('false');
        });

        it('restores normally on release when aria-hidden still holds our value', () => {
            const sibling = createBodyChild('untouched-target');
            const portal = createBodyChild('portal', {portal: true});
            const container = document.createElement('div');
            portal.appendChild(container);

            const layer = renderHook(() => useAriaHideSiblings(refTo(container), true));
            expect(attrs(sibling).ariaHidden).toBe('true');

            layer.unmount();

            expect(sibling.getAttribute('aria-hidden')).toBeNull();
        });
    });
});
