import {act, renderHook} from '@testing-library/react-native';

import {DialogLabelProvider, useDialogLabelActions, useDialogLabelData} from '@components/DialogLabelContext';

import type {PropsWithChildren} from 'react';

import React from 'react';

let currentContainerNode: HTMLElement | null = null;

function wrapper({children}: PropsWithChildren) {
    return <DialogLabelProvider containerNode={currentContainerNode}>{children}</DialogLabelProvider>;
}

beforeEach(() => {
    currentContainerNode = null;
});

describe('DialogLabelContext', () => {
    describe('outside provider', () => {
        it('returns defaults when used outside provider', () => {
            const {result} = renderHook(() => useDialogLabelData());

            expect(result.current.isInsideDialog).toBe(false);
        });

        it('claimInitialFocus returns false outside provider', () => {
            const {result} = renderHook(() => useDialogLabelActions());

            expect(result.current.claimInitialFocus()).toBe(false);
        });
    });

    describe('inside provider', () => {
        it('reports isInsideDialog as true only when the container carries dialog semantics (role=dialog or aria-modal)', () => {
            const dialogNode = document.createElement('div');
            dialogNode.setAttribute('aria-modal', 'true');
            currentContainerNode = dialogNode;

            const {result} = renderHook(() => useDialogLabelData(), {wrapper});

            expect(result.current.isInsideDialog).toBe(true);
        });

        it('reports isInsideDialog as false on a narrow-viewport RHP where the container has no dialog role — so useScreenInitialFocus can still land on the back button', () => {
            const bareNode = document.createElement('div');
            currentContainerNode = bareNode;

            const {result} = renderHook(() => useDialogLabelData(), {wrapper});

            expect(result.current.isInsideDialog).toBe(false);
        });

        it('pushLabel sets aria-label on the container element', () => {
            const mockElement = document.createElement('div');
            mockElement.setAttribute('aria-modal', 'true');
            currentContainerNode = mockElement;
            const {result} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});

            act(() => {
                result.current.pushLabel('Settings');
            });

            expect(mockElement.getAttribute('aria-label')).toBe('Settings');
        });

        it('pushLabel does not set aria-label when the container has no dialog semantics', () => {
            const {result} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});
            const mockElement = document.createElement('div');
            (result.current.containerRef as {current: unknown}).current = mockElement;

            act(() => {
                result.current.pushLabel('Settings');
            });

            expect(mockElement.hasAttribute('aria-label')).toBe(false);
        });

        it('pushLabel is safe when containerRef is not set', () => {
            const {result} = renderHook(() => useDialogLabelActions(), {wrapper});

            let id = -1;
            act(() => {
                id = result.current.pushLabel('Settings');
            });

            expect(id).toBeGreaterThanOrEqual(0);
        });

        it('pushLabel does not crash when containerRef.current is a non-DOM object that satisfies `instanceof HTMLElement` but lacks DOM methods (HybridApp native View)', () => {
            const fakeNativeView: Record<string, unknown> = {};
            const originalHasInstance = Object.getOwnPropertyDescriptor(HTMLElement, Symbol.hasInstance);
            Object.defineProperty(HTMLElement, Symbol.hasInstance, {value: (v: unknown) => v === fakeNativeView, configurable: true});

            try {
                const {result} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});
                (result.current.containerRef as {current: unknown}).current = fakeNativeView;

                expect(() =>
                    act(() => {
                        result.current.pushLabel('Settings');
                    }),
                ).not.toThrow();
            } finally {
                if (originalHasInstance) {
                    Object.defineProperty(HTMLElement, Symbol.hasInstance, originalHasInstance);
                } else {
                    Reflect.deleteProperty(HTMLElement, Symbol.hasInstance);
                }
            }
        });

        it('popLabel removes the label and restores the previous one', () => {
            const mockElement = document.createElement('div');
            mockElement.setAttribute('aria-modal', 'true');
            currentContainerNode = mockElement;
            const {result} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});

            let idA: number;
            let idB: number;

            act(() => {
                idA = result.current.pushLabel('Screen A');
            });
            act(() => {
                idB = result.current.pushLabel('Screen B');
            });

            expect(mockElement.getAttribute('aria-label')).toBe('Screen B');

            act(() => {
                result.current.popLabel(idB);
            });

            expect(mockElement.getAttribute('aria-label')).toBe('Screen A');

            act(() => {
                result.current.popLabel(idA);
            });

            expect(mockElement.hasAttribute('aria-label')).toBe(false);
        });

        it('popLabel removes by ID, not by stack position', () => {
            const mockElement = document.createElement('div');
            mockElement.setAttribute('aria-modal', 'true');
            currentContainerNode = mockElement;
            const {result} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});

            let idA: number;
            let idB: number;

            act(() => {
                idA = result.current.pushLabel('Screen A');
            });
            act(() => {
                idB = result.current.pushLabel('Screen B');
            });

            // Pop the bottom entry (Screen A), not the top
            act(() => {
                result.current.popLabel(idA);
            });

            // Screen B should still be the active label
            expect(mockElement.getAttribute('aria-label')).toBe('Screen B');

            act(() => {
                result.current.popLabel(idB);
            });

            expect(mockElement.hasAttribute('aria-label')).toBe(false);
        });

        it('claimInitialFocus returns true on first call, false on subsequent calls', () => {
            const {result} = renderHook(() => useDialogLabelActions(), {wrapper});

            expect(result.current.claimInitialFocus()).toBe(true);
            expect(result.current.claimInitialFocus()).toBe(false);
            expect(result.current.claimInitialFocus()).toBe(false);
        });

        it('pushLabel resets focus claim so each screen can claim', () => {
            const {result} = renderHook(() => useDialogLabelActions(), {wrapper});

            // First screen claims focus
            expect(result.current.claimInitialFocus()).toBe(true);
            expect(result.current.claimInitialFocus()).toBe(false);

            // Inner navigation pushes a new label — claim resets
            act(() => {
                result.current.pushLabel('Screen B');
            });

            expect(result.current.claimInitialFocus()).toBe(true);
            expect(result.current.claimInitialFocus()).toBe(false);
        });

        it('re-applies aria-label when the container gains dialog semantics on viewport resize (MutationObserver path)', async () => {
            const mockElement = document.createElement('div');
            currentContainerNode = mockElement;
            const {result, unmount} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});

            act(() => {
                result.current.pushLabel('Settings');
            });
            expect(mockElement.hasAttribute('aria-label')).toBe(false);

            await act(async () => {
                mockElement.setAttribute('role', 'dialog');
                mockElement.setAttribute('aria-modal', 'true');
                await Promise.resolve();
            });

            expect(mockElement.getAttribute('aria-label')).toBe('Settings');
            unmount();
        });

        it('removes aria-label when the container loses dialog semantics (wide→narrow resize — symmetric to the narrow→wide path)', async () => {
            const mockElement = document.createElement('div');
            mockElement.setAttribute('role', 'dialog');
            mockElement.setAttribute('aria-modal', 'true');
            currentContainerNode = mockElement;
            const {result, unmount} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});

            act(() => {
                result.current.pushLabel('Settings');
            });
            expect(mockElement.getAttribute('aria-label')).toBe('Settings');

            await act(async () => {
                mockElement.removeAttribute('role');
                mockElement.removeAttribute('aria-modal');
                await Promise.resolve();
            });

            expect(mockElement.hasAttribute('aria-label')).toBe(false);
            unmount();
        });

        it('assigns unique IDs to each pushed label', () => {
            const {result} = renderHook(() => useDialogLabelActions(), {wrapper});

            let idA = 0;
            let idB = 0;
            let idC = 0;

            act(() => {
                idA = result.current.pushLabel('A');
            });
            act(() => {
                idB = result.current.pushLabel('B');
            });
            act(() => {
                idC = result.current.pushLabel('C');
            });

            expect(idA).not.toBe(idB);
            expect(idB).not.toBe(idC);
            expect(idA).not.toBe(idC);
        });
    });
});
