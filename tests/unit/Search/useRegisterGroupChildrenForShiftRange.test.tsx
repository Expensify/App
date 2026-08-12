import {renderHook} from '@testing-library/react-native';

import {SearchShiftRangeChildrenContext} from '@components/Search/SearchContextDefinitions';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import useRegisterGroupChildrenForShiftRange from '@components/Search/SearchList/ListItem/useRegisterGroupChildrenForShiftRange';

import React from 'react';

import {buildTransactionRow} from '../../utils/collections/searchListItems';

const CHILDREN: TransactionListItemType[] = [buildTransactionRow(1, 'a'), buildTransactionRow(2, 'b')];

function setup() {
    const registerGroupChildren = jest.fn();
    const addGroupToRange = jest.fn();
    const removeGroupFromRange = jest.fn();
    let registryGeneration: number | undefined = 1;
    const dropRegistry = () => {
        registryGeneration = (registryGeneration ?? 0) + 1;
    };
    const wrapper = ({children}: {children: React.ReactNode}) => (
        <SearchShiftRangeChildrenContext value={{registerGroupChildren, addGroupToRange, removeGroupFromRange, registryGeneration}}>{children}</SearchShiftRangeChildrenContext>
    );
    return {registerGroupChildren, addGroupToRange, removeGroupFromRange, dropRegistry, wrapper};
}

describe('useRegisterGroupChildrenForShiftRange', () => {
    it('publishes the children under the group key', () => {
        const {registerGroupChildren, wrapper} = setup();
        renderHook(() => useRegisterGroupChildrenForShiftRange('group-1', CHILDREN, true), {wrapper});
        expect(registerGroupChildren).toHaveBeenCalledWith('group-1', CHILDREN);
    });

    it('publishes nothing where the rows are already part of the list', () => {
        const {registerGroupChildren, wrapper} = setup();
        renderHook(() => useRegisterGroupChildrenForShiftRange('group-1', CHILDREN, false), {wrapper});
        expect(registerGroupChildren).not.toHaveBeenCalled();
    });

    it('publishes an empty list, so children that go away are not left behind', () => {
        const {registerGroupChildren, wrapper} = setup();
        renderHook(() => useRegisterGroupChildrenForShiftRange('group-1', [], true), {wrapper});
        expect(registerGroupChildren).toHaveBeenCalledWith('group-1', []);
    });

    it('republishes when the children change', () => {
        const {registerGroupChildren, wrapper} = setup();
        const {rerender} = renderHook(({children}) => useRegisterGroupChildrenForShiftRange('group-1', children, true), {wrapper, initialProps: {children: CHILDREN}});
        const nextChildren: TransactionListItemType[] = [...CHILDREN, buildTransactionRow(3, 'c')];
        rerender({children: nextChildren});
        expect(registerGroupChildren).toHaveBeenLastCalledWith('group-1', nextChildren);
    });

    it('publishes under the new key when the row is recycled to render another group', () => {
        const {registerGroupChildren, wrapper} = setup();
        const {rerender} = renderHook(({groupKey}) => useRegisterGroupChildrenForShiftRange(groupKey, CHILDREN, true), {wrapper, initialProps: {groupKey: 'group-1'}});
        rerender({groupKey: 'group-2'});
        expect(registerGroupChildren).toHaveBeenLastCalledWith('group-2', CHILDREN);
    });

    it('republishes when the registry is dropped for a new search, even though the children never changed', () => {
        const {registerGroupChildren, dropRegistry, wrapper} = setup();
        const {rerender} = renderHook(() => useRegisterGroupChildrenForShiftRange('group-1', CHILDREN, true), {wrapper});
        registerGroupChildren.mockClear();
        rerender({});
        expect(registerGroupChildren).not.toHaveBeenCalled();
        dropRegistry();
        rerender({});
        expect(registerGroupChildren).toHaveBeenCalledWith('group-1', CHILDREN);
    });

    it('leaves the published children in place when the row unmounts, since the group may still be open', () => {
        const {registerGroupChildren, addGroupToRange, removeGroupFromRange, wrapper} = setup();
        const {unmount} = renderHook(() => useRegisterGroupChildrenForShiftRange('group-1', CHILDREN, true), {wrapper});
        registerGroupChildren.mockClear();
        unmount();
        expect(registerGroupChildren).not.toHaveBeenCalled();
        expect(removeGroupFromRange).not.toHaveBeenCalled();
        expect(addGroupToRange).not.toHaveBeenCalled();
    });
});
