import {act, renderHook} from '@testing-library/react-native';
import React, {createRef} from 'react';
import type {PropsWithChildren} from 'react';
import type {View} from 'react-native';
import {DialogLabelProvider, useDialogLabelActions, useDialogLabelData} from '@components/DialogLabelContext';

const testContainerRef = createRef<View>();

function wrapper({children}: PropsWithChildren) {
    return <DialogLabelProvider containerRef={testContainerRef}>{children}</DialogLabelProvider>;
}

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
        it('reports isInsideDialog as true', () => {
            const {result} = renderHook(() => useDialogLabelData(), {wrapper});

            expect(result.current.isInsideDialog).toBe(true);
        });

        it('pushLabel sets aria-label on the container element', () => {
            const {result} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});
            const mockElement = document.createElement('div');
            (result.current.containerRef as {current: unknown}).current = mockElement;

            act(() => {
                result.current.pushLabel('Settings');
            });

            expect(mockElement.getAttribute('aria-label')).toBe('Settings');
        });

        it('pushLabel is safe when containerRef is not set', () => {
            const {result} = renderHook(() => useDialogLabelActions(), {wrapper});

            let id = -1;
            act(() => {
                id = result.current.pushLabel('Settings');
            });

            expect(id).toBeGreaterThanOrEqual(0);
        });

        it('popLabel removes the label and restores the previous one', () => {
            const {result} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});
            const mockElement = document.createElement('div');
            (result.current.containerRef as {current: unknown}).current = mockElement;

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
            const {result} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});
            const mockElement = document.createElement('div');
            (result.current.containerRef as {current: unknown}).current = mockElement;

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
