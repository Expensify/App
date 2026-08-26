import {act, renderHook} from '@testing-library/react-native';

import {DialogLabelProvider, useDialogLabelActions, useDialogLabelData} from '@components/DialogLabelContext';

import type {PropsWithChildren} from 'react';

import React from 'react';

let currentContainerNode: HTMLElement | null = null;
let currentHasDialogSemantics: boolean | undefined;

function wrapper({children}: PropsWithChildren) {
    return (
        <DialogLabelProvider
            containerNode={currentContainerNode}
            hasDialogSemantics={currentHasDialogSemantics}
        >
            {children}
        </DialogLabelProvider>
    );
}

beforeEach(() => {
    currentContainerNode = null;
    currentHasDialogSemantics = undefined;
});

describe('DialogLabelContext', () => {
    describe('outside provider', () => {
        it('returns defaults when used outside provider', () => {
            const {result} = renderHook(() => useDialogLabelData());

            expect(result.current.isInsideDialog).toBe(false);
            expect(result.current.dialogAriaLabel).toBeUndefined();
        });

        it('claimInitialFocus returns false outside provider', () => {
            const {result} = renderHook(() => useDialogLabelActions());

            expect(result.current.claimInitialFocus()).toBe(false);
        });
    });

    describe('inside provider', () => {
        it('reports isInsideDialog as true when hasDialogSemantics is passed', () => {
            currentHasDialogSemantics = true;

            const {result} = renderHook(() => useDialogLabelData(), {wrapper});

            expect(result.current.isInsideDialog).toBe(true);
        });

        it('reports isInsideDialog as true only when the container carries dialog semantics (role=dialog or aria-modal) — DOM observation fallback', () => {
            const dialogNode = document.createElement('div');
            dialogNode.setAttribute('aria-modal', 'true');
            currentContainerNode = dialogNode;

            const {result} = renderHook(() => useDialogLabelData(), {wrapper});

            expect(result.current.isInsideDialog).toBe(true);
        });

        it('reports isInsideDialog as false on a narrow-viewport RHP where the container has no dialog role — so useScreenInitialFocus can still land on the back button', () => {
            currentHasDialogSemantics = false;
            const bareNode = document.createElement('div');
            currentContainerNode = bareNode;

            const {result} = renderHook(() => useDialogLabelData(), {wrapper});

            expect(result.current.isInsideDialog).toBe(false);
        });

        it('pushLabel exposes dialogAriaLabel via context (declarative — not DOM setAttribute)', () => {
            currentHasDialogSemantics = true;
            const {result} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});

            act(() => {
                result.current.pushLabel('Settings');
            });

            expect(result.current.dialogAriaLabel).toBe('Settings');
        });

        it('pushLabel does not expose a dialog name when the container has no dialog semantics', () => {
            currentHasDialogSemantics = false;
            const {result} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});

            act(() => {
                result.current.pushLabel('Settings');
            });

            expect(result.current.dialogAriaLabel).toBeUndefined();
        });

        it('pushLabel is safe when containerRef is not set', () => {
            currentHasDialogSemantics = true;
            const {result} = renderHook(() => useDialogLabelActions(), {wrapper});

            let id = -1;
            act(() => {
                id = result.current.pushLabel('Settings');
            });

            expect(id).toBeGreaterThanOrEqual(0);
        });

        it('popLabel removes the label and restores the previous one', () => {
            currentHasDialogSemantics = true;
            const {result} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});

            let idA: number;
            let idB: number;

            act(() => {
                idA = result.current.pushLabel('Screen A');
            });
            act(() => {
                idB = result.current.pushLabel('Screen B');
            });

            expect(result.current.dialogAriaLabel).toBe('Screen B');

            act(() => {
                result.current.popLabel(idB);
            });

            expect(result.current.dialogAriaLabel).toBe('Screen A');

            act(() => {
                result.current.popLabel(idA);
            });

            expect(result.current.dialogAriaLabel).toBeUndefined();
        });

        it('popLabel removes by ID, not by stack position', () => {
            currentHasDialogSemantics = true;
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
            expect(result.current.dialogAriaLabel).toBe('Screen B');

            act(() => {
                result.current.popLabel(idB);
            });

            expect(result.current.dialogAriaLabel).toBeUndefined();
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

        it('exposes dialogAriaLabel when hasDialogSemantics becomes true after a label was pushed (wide resize)', () => {
            currentHasDialogSemantics = false;
            const {result, rerender} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});

            act(() => {
                result.current.pushLabel('Settings');
            });
            expect(result.current.dialogAriaLabel).toBeUndefined();

            currentHasDialogSemantics = true;
            rerender({children: undefined});

            expect(result.current.isInsideDialog).toBe(true);
            expect(result.current.dialogAriaLabel).toBe('Settings');
        });

        it('hides dialogAriaLabel when hasDialogSemantics becomes false (wide→narrow resize)', () => {
            currentHasDialogSemantics = true;
            const {result, rerender} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});

            act(() => {
                result.current.pushLabel('Settings');
            });
            expect(result.current.dialogAriaLabel).toBe('Settings');

            currentHasDialogSemantics = false;
            rerender({children: undefined});

            expect(result.current.isInsideDialog).toBe(false);
            expect(result.current.dialogAriaLabel).toBeUndefined();
        });

        it('re-applies naming when the container gains dialog semantics on viewport resize (MutationObserver path)', async () => {
            const mockElement = document.createElement('div');
            currentContainerNode = mockElement;
            const {result, unmount} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});

            act(() => {
                result.current.pushLabel('Settings');
            });
            expect(result.current.dialogAriaLabel).toBeUndefined();

            await act(async () => {
                mockElement.setAttribute('role', 'dialog');
                mockElement.setAttribute('aria-modal', 'true');
                await Promise.resolve();
            });

            expect(result.current.dialogAriaLabel).toBe('Settings');
            unmount();
        });

        it('hides naming when the container loses dialog semantics (MutationObserver path)', async () => {
            const mockElement = document.createElement('div');
            mockElement.setAttribute('role', 'dialog');
            mockElement.setAttribute('aria-modal', 'true');
            currentContainerNode = mockElement;
            const {result, unmount} = renderHook(() => ({...useDialogLabelData(), ...useDialogLabelActions()}), {wrapper});

            act(() => {
                result.current.pushLabel('Settings');
            });
            expect(result.current.dialogAriaLabel).toBe('Settings');

            await act(async () => {
                mockElement.removeAttribute('role');
                mockElement.removeAttribute('aria-modal');
                await Promise.resolve();
            });

            expect(result.current.dialogAriaLabel).toBeUndefined();
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
