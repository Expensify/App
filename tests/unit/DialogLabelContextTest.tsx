import {act, renderHook} from '@testing-library/react-native';
import React from 'react';
import type {PropsWithChildren} from 'react';
import {DialogLabelProvider, useDialogLabelActions, useDialogLabelValue} from '@components/DialogLabelContext';

function wrapper({children}: PropsWithChildren) {
    return <DialogLabelProvider>{children}</DialogLabelProvider>;
}

describe('DialogLabelContext', () => {
    describe('outside provider', () => {
        it('returns defaults when used outside provider', () => {
            const {result: actionsResult} = renderHook(() => useDialogLabelActions());
            const {result: valueResult} = renderHook(() => useDialogLabelValue());

            expect(actionsResult.current.isInsideDialog).toBe(false);
            expect(valueResult.current.labelText).toBeUndefined();
        });
    });

    describe('inside provider', () => {
        it('reports isInsideDialog as true', () => {
            const {result} = renderHook(() => useDialogLabelActions(), {wrapper});

            expect(result.current.isInsideDialog).toBe(true);
        });

        it('pushLabel sets the labelText', () => {
            const {result} = renderHook(
                () => ({
                    actions: useDialogLabelActions(),
                    value: useDialogLabelValue(),
                }),
                {wrapper},
            );

            act(() => {
                result.current.actions.pushLabel('Settings');
            });

            expect(result.current.value.labelText).toBe('Settings');
        });

        it('popLabel removes the label and restores the previous one', () => {
            const {result} = renderHook(
                () => ({
                    actions: useDialogLabelActions(),
                    value: useDialogLabelValue(),
                }),
                {wrapper},
            );

            let idA: number;
            let idB: number;

            act(() => {
                idA = result.current.actions.pushLabel('Screen A');
            });
            act(() => {
                idB = result.current.actions.pushLabel('Screen B');
            });

            expect(result.current.value.labelText).toBe('Screen B');

            act(() => {
                result.current.actions.popLabel(idB);
            });

            expect(result.current.value.labelText).toBe('Screen A');

            act(() => {
                result.current.actions.popLabel(idA);
            });

            expect(result.current.value.labelText).toBeUndefined();
        });

        it('popLabel removes by ID, not by stack position', () => {
            const {result} = renderHook(
                () => ({
                    actions: useDialogLabelActions(),
                    value: useDialogLabelValue(),
                }),
                {wrapper},
            );

            let idA: number;
            let idB: number;

            act(() => {
                idA = result.current.actions.pushLabel('Screen A');
            });
            act(() => {
                idB = result.current.actions.pushLabel('Screen B');
            });

            // Pop the bottom entry (Screen A), not the top
            act(() => {
                result.current.actions.popLabel(idA);
            });

            // Screen B should still be the active label
            expect(result.current.value.labelText).toBe('Screen B');

            act(() => {
                result.current.actions.popLabel(idB);
            });

            expect(result.current.value.labelText).toBeUndefined();
        });

        it('updateLabel changes an existing entry without reordering', () => {
            const {result} = renderHook(
                () => ({
                    actions: useDialogLabelActions(),
                    value: useDialogLabelValue(),
                }),
                {wrapper},
            );

            let idA: number;

            act(() => {
                idA = result.current.actions.pushLabel('Screen A');
            });
            act(() => {
                result.current.actions.pushLabel('Screen B');
            });

            expect(result.current.value.labelText).toBe('Screen B');

            // Update Screen A (bottom of stack) — should not change labelText
            act(() => {
                result.current.actions.updateLabel(idA, 'Screen A Updated');
            });

            expect(result.current.value.labelText).toBe('Screen B');
        });

        it('updateLabel updates the top entry', () => {
            const {result} = renderHook(
                () => ({
                    actions: useDialogLabelActions(),
                    value: useDialogLabelValue(),
                }),
                {wrapper},
            );

            let idA: number;

            act(() => {
                idA = result.current.actions.pushLabel('Settings');
            });

            act(() => {
                result.current.actions.updateLabel(idA, 'About');
            });

            expect(result.current.value.labelText).toBe('About');
        });

        it('actions and value contexts are independent', () => {
            const {result: actionsResult} = renderHook(() => useDialogLabelActions(), {wrapper});
            const {result: valueResult} = renderHook(() => useDialogLabelValue());

            // Actions from provider, value from outside — should be independent
            expect(actionsResult.current.isInsideDialog).toBe(true);
            expect(valueResult.current.labelText).toBeUndefined();
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
