/**
 * @jest-environment jsdom
 */
import {NavigationContext} from '@react-navigation/core';
import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import {act, renderHook} from '@testing-library/react-native';
import React from 'react';
import type {ReactNode} from 'react';
import useCloseOnScreenBlur from '@components/PopoverMenu/v2/content/useCloseOnScreenBlur';

type MockNav = {
    blurListeners: Set<() => void>;
    isFocused: boolean;
    navigation: NavigationProp<ParamListBase>;
};

function makeMockNavigation(): MockNav {
    const blurListeners = new Set<() => void>();
    const state = {isFocused: false};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- structural test stub mirrors react-navigation's NavigationProp shape; full typing isn't useful here.
    const navigation = {
        addListener: (event: string, listener: () => void) => {
            if (event !== 'blur') {
                return () => {};
            }
            blurListeners.add(listener);
            return () => blurListeners.delete(listener);
        },
        isFocused: () => state.isFocused,
    } as unknown as NavigationProp<ParamListBase>;
    return {
        blurListeners,
        get isFocused() {
            return state.isFocused;
        },
        set isFocused(value) {
            state.isFocused = value;
        },
        navigation,
    };
}

function makeWrapper(navigation: NavigationProp<ParamListBase> | null) {
    function Wrapper({children}: {children: ReactNode}) {
        return <NavigationContext.Provider value={navigation ?? undefined}>{children}</NavigationContext.Provider>;
    }
    return Wrapper;
}

describe('useCloseOnScreenBlur', () => {
    it('subscribes to blur while isOpen=true', () => {
        const mock = makeMockNavigation();
        const close = jest.fn();
        renderHook(() => useCloseOnScreenBlur(close, true), {wrapper: makeWrapper(mock.navigation)});
        expect(mock.blurListeners.size).toBe(1);
    });

    it('does not subscribe while isOpen=false (avoids self-close on the open-tick)', () => {
        const mock = makeMockNavigation();
        const close = jest.fn();
        renderHook(() => useCloseOnScreenBlur(close, false), {wrapper: makeWrapper(mock.navigation)});
        expect(mock.blurListeners.size).toBe(0);
    });

    it('unsubscribes when isOpen transitions true → false', () => {
        const mock = makeMockNavigation();
        const close = jest.fn();
        const {rerender} = renderHook(({open}: {open: boolean}) => useCloseOnScreenBlur(close, open), {
            wrapper: makeWrapper(mock.navigation),
            initialProps: {open: true},
        });
        expect(mock.blurListeners.size).toBe(1);
        rerender({open: false});
        expect(mock.blurListeners.size).toBe(0);
    });

    it('calls close on a real screen-blur event (navigation.isFocused returns false)', () => {
        const mock = makeMockNavigation();
        const close = jest.fn();
        renderHook(() => useCloseOnScreenBlur(close, true), {wrapper: makeWrapper(mock.navigation)});
        mock.isFocused = false;
        act(() => {
            for (const fn of mock.blurListeners) {
                fn();
            }
        });
        expect(close).toHaveBeenCalledTimes(1);
    });

    it('ignores spurious blur when the screen is still focused (focus-shuffle within the same screen)', () => {
        const mock = makeMockNavigation();
        const close = jest.fn();
        renderHook(() => useCloseOnScreenBlur(close, true), {wrapper: makeWrapper(mock.navigation)});
        mock.isFocused = true;
        act(() => {
            for (const fn of mock.blurListeners) {
                fn();
            }
        });
        expect(close).not.toHaveBeenCalled();
    });

    it('is a no-op when no NavigationContext is in scope (renders outside a navigator)', () => {
        const close = jest.fn();
        expect(() => renderHook(() => useCloseOnScreenBlur(close, true), {wrapper: makeWrapper(null)})).not.toThrow();
        expect(close).not.toHaveBeenCalled();
    });
});
