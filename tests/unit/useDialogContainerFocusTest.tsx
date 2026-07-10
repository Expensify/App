import {renderHook} from '@testing-library/react-native';

import type {View} from 'react-native';

import {createRef} from 'react';

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: jest.fn(() => ({cancel: jest.fn()})),
    },
}));

// Force the web variant — jest-expo's RN resolver prefers `index.native.ts` by default.
const useDialogContainerFocus = require<{
    default: (ref: {current: View | null}, isReady: boolean, gate?: () => boolean, skip?: boolean) => void;
}>('../../src/hooks/useDialogContainerFocus/index.ts').default;

beforeEach(() => {
    jest.clearAllMocks();
});

describe('useDialogContainerFocus — short-circuit order', () => {
    it('does NOT invoke `claimInitialFocusGate` when `skipDialogContainerFocus` is true (gate is one-shot — bail path must not burn it)', () => {
        const ref = createRef<View>();
        const gate = jest.fn(() => true);
        renderHook(() => useDialogContainerFocus(ref, true, gate, true));
        expect(gate).not.toHaveBeenCalled();
    });

    it('invokes the gate when `skip: false` (baseline — gate is the load-bearing claim primitive)', () => {
        const ref = createRef<View>();
        const gate = jest.fn(() => true);
        renderHook(() => useDialogContainerFocus(ref, true, gate, false));
        expect(gate).toHaveBeenCalledTimes(1);
    });

    it('preserves the gate across a skip→unskip cycle so a later `skip: false` render can still claim', () => {
        const ref = createRef<View>();
        const gate = jest.fn(() => true);
        const {rerender} = renderHook(({skip}: {skip: boolean}) => useDialogContainerFocus(ref, true, gate, skip), {initialProps: {skip: true}});
        expect(gate).not.toHaveBeenCalled();

        rerender({skip: false});
        expect(gate).toHaveBeenCalledTimes(1);
    });

    it('does not invoke the gate when `isReady` is false even with `skip: false`', () => {
        const ref = createRef<View>();
        const gate = jest.fn(() => true);
        renderHook(() => useDialogContainerFocus(ref, false, gate, false));
        expect(gate).not.toHaveBeenCalled();
    });

    it('does not schedule `runAfterTransitions` when the gate returns false (claim was already consumed by another path)', () => {
        const ref = createRef<View>();
        const gate = jest.fn(() => false);
        const TransitionTracker = require<{default: {runAfterTransitions: jest.Mock}}>('../../src/libs/Navigation/TransitionTracker').default;

        renderHook(() => useDialogContainerFocus(ref, true, gate, false));
        expect(gate).toHaveBeenCalledTimes(1);
        expect(TransitionTracker.runAfterTransitions).not.toHaveBeenCalled();
    });

    it('cancels the scheduled `runAfterTransitions` on unmount so a destroyed ref does not receive late focus', () => {
        const ref = createRef<View>();
        const gate = jest.fn(() => true);
        const cancel = jest.fn();
        const TransitionTracker = require<{default: {runAfterTransitions: jest.Mock}}>('../../src/libs/Navigation/TransitionTracker').default;
        TransitionTracker.runAfterTransitions.mockImplementationOnce(() => ({cancel}));

        const {unmount} = renderHook(() => useDialogContainerFocus(ref, true, gate, false));
        expect(TransitionTracker.runAfterTransitions).toHaveBeenCalledTimes(1);

        unmount();
        expect(cancel).toHaveBeenCalledTimes(1);
    });
});
