import {renderHook} from '@testing-library/react-native';

import {SearchShiftRangeGroupsContext} from '@components/Search/SearchContextDefinitions';
import useGroupOpenForShiftRange from '@components/Search/SearchList/ListItem/useGroupOpenForShiftRange';

import React from 'react';

function setup() {
    const addGroupToRange = jest.fn();
    const removeGroupFromRange = jest.fn();
    const wrapper = ({children}: {children: React.ReactNode}) => (
        <SearchShiftRangeGroupsContext value={{addGroupToRange, removeGroupFromRange, registryGeneration: 1}}>{children}</SearchShiftRangeGroupsContext>
    );
    return {addGroupToRange, removeGroupFromRange, wrapper};
}

describe('useGroupOpenForShiftRange', () => {
    it('opens the group while it is expanded', () => {
        const {addGroupToRange, removeGroupFromRange, wrapper} = setup();
        renderHook(() => useGroupOpenForShiftRange('group-1', true), {wrapper});
        expect(addGroupToRange).toHaveBeenCalledWith('group-1');
        expect(removeGroupFromRange).not.toHaveBeenCalled();
    });

    it('opens nothing while it is collapsed', () => {
        const {addGroupToRange, removeGroupFromRange, wrapper} = setup();
        renderHook(() => useGroupOpenForShiftRange('group-1', false), {wrapper});
        expect(addGroupToRange).not.toHaveBeenCalled();
        expect(removeGroupFromRange).not.toHaveBeenCalled();
    });

    it('closes the group when it collapses', () => {
        const {removeGroupFromRange, wrapper} = setup();
        const {rerender} = renderHook(({isOpen}) => useGroupOpenForShiftRange('group-1', isOpen), {wrapper, initialProps: {isOpen: true}});
        rerender({isOpen: false});
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-1');
    });

    it('closes the group when the row goes away, since its expanded state goes with it', () => {
        const {removeGroupFromRange, wrapper} = setup();
        const {unmount} = renderHook(() => useGroupOpenForShiftRange('group-1', true), {wrapper});
        expect(removeGroupFromRange).not.toHaveBeenCalled();
        unmount();
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-1');
    });

    it('closes the group it had open when the row is recycled to render another', () => {
        const {addGroupToRange, removeGroupFromRange, wrapper} = setup();
        const {rerender} = renderHook(({groupKey}) => useGroupOpenForShiftRange(groupKey, true), {wrapper, initialProps: {groupKey: 'group-1'}});
        rerender({groupKey: 'group-2'});
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-1');
        expect(addGroupToRange).toHaveBeenLastCalledWith('group-2');
    });
});
