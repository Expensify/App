import {renderHook} from '@testing-library/react-native';

import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';

import useCollectionDelta from '@hooks/useCollectionDelta';

import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';

type Item = {v: number};

function renderUseCollectionDelta(initialProps: OnyxCollection<Item>) {
    return renderHook((value: OnyxCollection<Item>) => useCollectionDelta(value), {initialProps});
}

describe('useCollectionDelta', () => {
    it('should return undefined on the first render (nothing to diff against)', () => {
        const {result} = renderUseCollectionDelta({a: {v: 1}});
        expect(result.current).toBeUndefined();
    });

    it('should return the members added since the previous render', () => {
        const a: Item = {v: 1};
        const b: Item = {v: 2};
        const {result, rerender} = renderUseCollectionDelta({a});

        rerender({a, b});
        expect(result.current).toStrictEqual({b});
    });

    it('should return a changed member with its current value', () => {
        const a: Item = {v: 1};
        const aNext: Item = {v: 2};
        const {result, rerender} = renderUseCollectionDelta({a});

        rerender({a: aNext});
        expect(result.current).toStrictEqual({a: aNext});
    });

    it('should return a removed member as undefined', () => {
        const a: Item = {v: 1};
        const b: Item = {v: 2};
        const {result, rerender} = renderUseCollectionDelta({a, b});

        rerender({a});
        expect(result.current).toStrictEqual({b: undefined});
    });

    it('should return undefined when the value reference is unchanged between renders', () => {
        const collection: OnyxCollection<Item> = {a: {v: 1}};
        const {result, rerender} = renderUseCollectionDelta(collection);

        rerender(collection);
        expect(result.current).toBeUndefined();
    });

    it('should return undefined when members keep their references across renders (structural sharing)', () => {
        const a: Item = {v: 1};
        const {result, rerender} = renderUseCollectionDelta({a});

        // New container object, same member reference.
        rerender({a});
        expect(result.current).toBeUndefined();
    });

    it('should throw when rendered under Search scope', () => {
        // Given a consumer mounted under SearchScopeProvider, where useOnyx may serve snapshot copies whose members are
        // not the live objects, so a switch between sources would report every member as changed or removed
        const wrapper = ({children}: {children: React.ReactNode}) => <SearchScopeProvider>{children}</SearchScopeProvider>;
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // When the consumer renders
        const renderUnderSearch = () => renderHook(() => useCollectionDelta<Item>({a: {v: 1}}), {wrapper});

        // Then the hook refuses to run, so the misplaced consumer is caught in development and tests
        expect(renderUnderSearch).toThrow('useCollectionDelta');
        consoleErrorSpy.mockRestore();
    });

    it('should not throw when Search scope is turned off for the subtree', () => {
        // Given a consumer under SearchScopeProvider with isOnSearch={false}, which is how Search opts a subtree back into live data
        const wrapper = ({children}: {children: React.ReactNode}) => <SearchScopeProvider isOnSearch={false}>{children}</SearchScopeProvider>;
        const a: Item = {v: 1};
        const b: Item = {v: 2};
        const initialProps: OnyxCollection<Item> = {a};

        // When the consumer renders and then receives a new member
        const {result, rerender} = renderHook((value: OnyxCollection<Item>) => useCollectionDelta(value), {initialProps, wrapper});
        rerender({a, b});

        // Then the guard stays silent and the delta works as it does outside Search
        expect(result.current).toStrictEqual({b});
    });
});
