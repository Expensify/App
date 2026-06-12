/**
 * Tests for the `useReceiptHoverZoom` hook.
 *
 * The hook attaches pointer-event listeners to a real DOM element and mutates inline styles
 * imperatively, so we test through react-dom + jsdom rather than @testing-library/react-native
 * (which renders via react-test-renderer and would not produce HTMLElement refs).
 */
/* eslint-disable testing-library/no-unnecessary-act -- we drive react-dom roots manually, not Testing Library, so `act` is required around render/event dispatch. */
/* eslint-disable @typescript-eslint/naming-convention -- the Probe fixture passes kebab-case `data-*` attributes through `React.createElement`, which requires string keys that don't fit the camelCase/PascalCase rule. */
import {act, createElement} from 'react';
import type {RefObject} from 'react';
import {createRoot} from 'react-dom/client';
import type {Root} from 'react-dom/client';
import type {View} from 'react-native';
import useReceiptHoverZoom from '@components/ReceiptHoverZoom/useReceiptHoverZoom';
import {hasHoverSupport} from '@libs/DeviceCapabilities';

jest.mock('@libs/DeviceCapabilities', () => ({
    __esModule: true,
    hasHoverSupport: jest.fn(),
}));

const mockHasHoverSupport = hasHoverSupport as jest.MockedFunction<typeof hasHoverSupport>;

type ProbeProps = {
    isEnabled: boolean;
    scale: number;
    hoverContainerRef?: RefObject<View | null>;
};

// The Probe surfaces `isActive` via a `data-active` attribute on the wrapper, and the test
// queries the rendered DOM rather than capturing the hook's return value through a module-level
// holder. Mutating outer state from a component body would violate React Compiler's rules.
const WRAPPER_TEST_ID = 'rhz-wrapper';
const INNER_TEST_ID = 'rhz-inner';

function Probe({isEnabled, scale, hoverContainerRef}: ProbeProps) {
    const result = useReceiptHoverZoom({isEnabled, scale, hoverContainerRef});
    return createElement(
        'div',
        {ref: result.wrapperRef, 'data-testid': WRAPPER_TEST_ID, 'data-active': String(result.isActive)},
        createElement('div', {ref: result.innerRef, 'data-testid': INNER_TEST_ID}),
    );
}

function wrapper(): HTMLDivElement {
    const el = document.querySelector<HTMLDivElement>(`[data-testid="${WRAPPER_TEST_ID}"]`);
    if (!el) {
        throw new Error('Probe wrapper was not rendered');
    }
    return el;
}

function inner(): HTMLDivElement {
    const el = document.querySelector<HTMLDivElement>(`[data-testid="${INNER_TEST_ID}"]`);
    if (!el) {
        throw new Error('Probe inner was not rendered');
    }
    return el;
}

function isActive(): boolean {
    return wrapper().dataset.active === 'true';
}

function makeRect(overrides: Partial<DOMRect> = {}): DOMRect {
    return {
        left: 0,
        top: 0,
        right: 200,
        bottom: 100,
        width: 200,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => undefined,
        ...overrides,
    } as DOMRect;
}

describe('useReceiptHoverZoom', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        mockHasHoverSupport.mockReturnValue(true);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        jest.restoreAllMocks();
    });

    const mount = (props: ProbeProps) => {
        act(() => {
            root.render(createElement(Probe, props));
        });
    };

    describe('isActive flag', () => {
        it('returns false when isEnabled=false even if hover is supported', () => {
            mount({isEnabled: false, scale: 2.5});
            expect(isActive()).toBe(false);
        });

        it('returns false when the device lacks hover support', () => {
            mockHasHoverSupport.mockReturnValue(false);
            mount({isEnabled: true, scale: 2.5});
            expect(isActive()).toBe(false);
        });

        it('returns true when enabled and hover is supported', () => {
            mount({isEnabled: true, scale: 2.5});
            expect(isActive()).toBe(true);
        });
    });

    describe('pointer interactions', () => {
        it('applies scale and transformOrigin on the first pointermove', () => {
            mount({isEnabled: true, scale: 2.5});
            const target = wrapper();
            target.getBoundingClientRect = jest.fn(() => makeRect({width: 200, height: 100}));

            act(() => {
                target.dispatchEvent(new MouseEvent('pointermove', {clientX: 50, clientY: 25}));
            });

            expect(inner().style.transform).toBe('scale(2.5)');
            expect(inner().style.transformOrigin).toBe('25% 25%');
        });

        it('does not apply zoom until pointermove fires (no zoom on mount, no pointerenter listener)', () => {
            mount({isEnabled: true, scale: 2.5});
            // Mount-time `:hover` would previously trigger zoom from center; now it should stay idle.
            jest.spyOn(HTMLElement.prototype, 'matches').mockImplementation((selector: string) => selector === ':hover');
            expect(inner().style.transform).toBe('');
            expect(inner().style.transformOrigin).toBe('');

            act(() => {
                wrapper().dispatchEvent(new Event('pointerenter'));
            });
            expect(inner().style.transform).toBe('');
            expect(inner().style.transformOrigin).toBe('');
        });

        it('resets scale to 1 on pointerleave', () => {
            mount({isEnabled: true, scale: 3});
            const target = wrapper();
            target.getBoundingClientRect = jest.fn(() => makeRect({width: 200, height: 100}));

            act(() => {
                target.dispatchEvent(new MouseEvent('pointermove', {clientX: 50, clientY: 25}));
                target.dispatchEvent(new Event('pointerleave'));
            });
            expect(inner().style.transform).toBe('scale(1)');
        });

        it('skips pointermove updates when the cached rect has no area', () => {
            mount({isEnabled: true, scale: 2.5});
            const target = wrapper();
            // jsdom default rect is all zeros — exercise the early return.
            act(() => {
                target.dispatchEvent(new MouseEvent('pointermove', {clientX: 10, clientY: 10}));
            });
            expect(inner().style.transform).toBe('');
            expect(inner().style.transformOrigin).toBe('');
        });
    });

    describe('cleanup on unmount', () => {
        it('removes listeners and clears inline transform/origin', () => {
            mount({isEnabled: true, scale: 2.5});
            const target = wrapper();
            const innerEl = inner();
            target.getBoundingClientRect = jest.fn(() => makeRect());
            const removeSpy = jest.spyOn(target, 'removeEventListener');

            act(() => {
                target.dispatchEvent(new MouseEvent('pointermove', {clientX: 100, clientY: 50}));
            });
            expect(innerEl.style.transform).toBe('scale(2.5)');

            act(() => {
                root.unmount();
            });
            // Re-create the root so the shared afterEach can unmount cleanly.
            root = createRoot(container);

            expect(removeSpy).toHaveBeenCalledWith('pointerleave', expect.any(Function));
            expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
            expect(innerEl.style.transform).toBe('');
            expect(innerEl.style.transformOrigin).toBe('');
        });
    });

    describe('external hoverContainerRef precedence', () => {
        it('attaches listeners to the external ref when provided, not the auto-wrapper', () => {
            const external = document.createElement('div');
            document.body.appendChild(external);
            const externalAdd = jest.spyOn(external, 'addEventListener');

            try {
                const externalRef = {current: external} as unknown as RefObject<View | null>;
                mount({isEnabled: true, scale: 2.5, hoverContainerRef: externalRef});

                expect(externalAdd).toHaveBeenCalledWith('pointerleave', expect.any(Function));
                expect(externalAdd).toHaveBeenCalledWith('pointermove', expect.any(Function));

                external.getBoundingClientRect = jest.fn(() => makeRect());
                act(() => {
                    external.dispatchEvent(new MouseEvent('pointermove', {clientX: 100, clientY: 50}));
                });
                expect(inner().style.transform).toBe('scale(2.5)');
            } finally {
                external.remove();
            }
        });

        it('falls back to the auto-wrapper when the external ref has no current element', () => {
            const externalRef = {current: null} as unknown as RefObject<View | null>;
            mount({isEnabled: true, scale: 2.5, hoverContainerRef: externalRef});
            const target = wrapper();
            target.getBoundingClientRect = jest.fn(() => makeRect());

            act(() => {
                target.dispatchEvent(new MouseEvent('pointermove', {clientX: 100, clientY: 50}));
            });
            expect(inner().style.transform).toBe('scale(2.5)');
        });
    });

    describe('inactive state', () => {
        it('does not attach pointer listeners when disabled', () => {
            const addSpy = jest.spyOn(HTMLDivElement.prototype, 'addEventListener');
            mount({isEnabled: false, scale: 2.5});
            const pointerCalls = addSpy.mock.calls.filter(([eventName]) => typeof eventName === 'string' && eventName.startsWith('pointer'));
            expect(pointerCalls).toHaveLength(0);
        });
    });
});
