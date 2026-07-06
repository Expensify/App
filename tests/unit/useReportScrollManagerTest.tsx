import {act, renderHook} from '@testing-library/react-native';

import type FlatListRefType from '@components/FlashList/types';

import useReportScrollManager from '@hooks/useReportScrollManager';

import {ActionListContext, useActionListContext} from '@pages/inbox/ActionListContext';

import type {ReactNode} from 'react';

/**
 * `useReportScrollManager` resolves the list ref via `getListRef()` at call time (never captured at
 * init). `scrollToIndex` takes an options object — ReportActionItemMessageEdit's Android Chrome
 * keyboard hack passes `{animated: false}` to scroll instantly while the composer is focused.
 */

// Returns the ref to register plus a typed handle to the spies for assertions. The spy object
// implements only the methods the scroll handlers invoke.
function buildMockListRef() {
    const methods = {
        scrollToIndex: jest.fn(),
        scrollToOffset: jest.fn(),
        scrollToEnd: jest.fn(),
        getNativeScrollRef: jest.fn(() => undefined),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const ref = {current: methods} as unknown as FlatListRefType;
    return {ref, methods};
}

// Context value backed by a closure holder so registering a ref is visible to the manager's getListRef().
function buildContextValue() {
    let held: FlatListRefType = null;
    return {
        scrollPositionRef: {current: {}},
        scrollOffsetRef: {current: 0},
        getScrollOffset: () => 0,
        registerListRef: (ref: FlatListRefType) => {
            held = ref;
        },
        getListRef: () => held,
    };
}

function renderManager() {
    const contextValue = buildContextValue();
    function Wrapper({children}: {children: ReactNode}) {
        return <ActionListContext.Provider value={contextValue}>{children}</ActionListContext.Provider>;
    }
    return renderHook(
        () => {
            const manager = useReportScrollManager();
            const {registerListRef} = useActionListContext();
            return {manager, registerListRef};
        },
        {wrapper: Wrapper},
    );
}

describe('useReportScrollManager', () => {
    it('resolves the list ref at call time, not at init (register AFTER the manager is created)', () => {
        const {result} = renderManager();
        const {ref, methods} = buildMockListRef();

        // Register only after the manager hook has already run once.
        act(() => {
            result.current.registerListRef(ref);
        });

        act(() => {
            result.current.manager.scrollToEnd();
        });

        // The ref was resolved lazily — the method on the later-registered ref fired.
        expect(methods.scrollToEnd).toHaveBeenCalled();
    });

    it('no-ops when no ref is registered', () => {
        const {result} = renderManager();

        expect(() => {
            act(() => {
                result.current.manager.scrollToEnd();
                result.current.manager.scrollToIndex(3);
                result.current.manager.scrollToOffset(100);
                result.current.manager.scrollToIndex(1, {animated: false});
            });
        }).not.toThrow();
    });

    it('scrollToIndex calls through to the registered ref and defaults to a non-animated (instant) scroll on native', () => {
        const {result} = renderManager();
        const {ref, methods} = buildMockListRef();
        act(() => result.current.registerListRef(ref));

        act(() => result.current.manager.scrollToIndex(5));

        expect(methods.scrollToIndex).toHaveBeenCalledWith({index: 5, animated: false});
    });

    it('scrollToOffset calls through to the registered ref', () => {
        const {result} = renderManager();
        const {ref, methods} = buildMockListRef();
        act(() => result.current.registerListRef(ref));

        act(() => result.current.manager.scrollToOffset(250));

        expect(methods.scrollToOffset).toHaveBeenCalledWith(expect.objectContaining({offset: 250}));
    });

    it('scrollToIndex forwards the animated option to the registered ref (Android Chrome keyboard hack)', () => {
        const {result} = renderManager();
        const {ref, methods} = buildMockListRef();
        act(() => result.current.registerListRef(ref));

        act(() => result.current.manager.scrollToIndex(2, {animated: false}));

        expect(methods.scrollToIndex).toHaveBeenCalledWith({index: 2, animated: false});
    });
});
