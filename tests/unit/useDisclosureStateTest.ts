/**
 * @jest-environment jsdom
 */
import {act, renderHook} from '@testing-library/react-native';

import useDisclosureState from '@hooks/useDisclosureState';

jest.mock('@libs/Log', () => ({warn: jest.fn(), alert: jest.fn(), info: jest.fn()}));

describe('useDisclosureState', () => {
    describe('Uncontrolled', () => {
        it('is closed by default', () => {
            const {result} = renderHook(() => useDisclosureState({}));
            expect(result.current.isOpen).toBe(false);
        });

        it('seeds the initial state with defaultOpen', () => {
            const {result} = renderHook(() => useDisclosureState({defaultOpen: true}));
            expect(result.current.isOpen).toBe(true);
        });

        it('open() flips state to true', () => {
            const {result} = renderHook(() => useDisclosureState({}));
            act(() => result.current.open());
            expect(result.current.isOpen).toBe(true);
        });

        it('close() flips state to false', () => {
            const {result} = renderHook(() => useDisclosureState({defaultOpen: true}));
            act(() => result.current.close());
            expect(result.current.isOpen).toBe(false);
        });

        it('toggle() inverts state and round-trips correctly with two synchronous calls', () => {
            const {result} = renderHook(() => useDisclosureState({}));
            act(() => {
                result.current.toggle();
                result.current.toggle();
            });
            expect(result.current.isOpen).toBe(false);
            act(() => result.current.toggle());
            expect(result.current.isOpen).toBe(true);
        });
    });

    describe('Controlled', () => {
        it('prop drives the visible state', () => {
            const {result} = renderHook(({open}: {open: boolean}) => useDisclosureState({isOpen: open}), {
                initialProps: {open: false},
            });
            expect(result.current.isOpen).toBe(false);
        });

        it('open() fires onOpenChange but does NOT flip the controlled value', () => {
            const onOpenChange = jest.fn();
            const {result} = renderHook(() => useDisclosureState({isOpen: false, onOpenChange}));
            act(() => result.current.open());
            expect(onOpenChange).toHaveBeenCalledWith(true);
            expect(result.current.isOpen).toBe(false);
        });

        it('setOpen(updater) reflects the controlled value in the updater argument', () => {
            const onOpenChange = jest.fn();
            const {result} = renderHook(({open}: {open: boolean}) => useDisclosureState({isOpen: open, onOpenChange}), {
                initialProps: {open: true},
            });
            act(() => result.current.setOpen((previous) => !previous));
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });
    });

    describe('Stability', () => {
        it('returns stable open/close/toggle identities across renders', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars -- renderHook's rerender(props) signature requires the wrapper to accept a props param even when unused.
            const {result, rerender} = renderHook((_props: Record<string, never>) => useDisclosureState({}), {initialProps: {}});
            const first = {open: result.current.open, close: result.current.close, toggle: result.current.toggle};
            rerender({});
            expect(result.current.open).toBe(first.open);
            expect(result.current.close).toBe(first.close);
            expect(result.current.toggle).toBe(first.toggle);
        });
    });
});
