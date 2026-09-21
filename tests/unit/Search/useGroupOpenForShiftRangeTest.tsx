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
        // Given a row that owns whether its own group is expanded
        const {addGroupToRange, removeGroupFromRange, wrapper} = setup();

        // When it renders expanded
        renderHook(() => useGroupOpenForShiftRange('group-1', true), {wrapper});

        // Then a range may reach that group's children, and nothing was closed on the way in
        expect(addGroupToRange).toHaveBeenCalledWith('group-1');
        expect(removeGroupFromRange).not.toHaveBeenCalled();
    });

    it('opens nothing while it is collapsed', () => {
        // Given the same row with its children hidden
        const {addGroupToRange, removeGroupFromRange, wrapper} = setup();

        // When it renders collapsed
        renderHook(() => useGroupOpenForShiftRange('group-1', false), {wrapper});

        // Then the registry is untouched, since a range must reach only rows the user can see
        expect(addGroupToRange).not.toHaveBeenCalled();
        expect(removeGroupFromRange).not.toHaveBeenCalled();
    });

    it('closes the group when it collapses', () => {
        // Given a group a range can reach into
        const {removeGroupFromRange, wrapper} = setup();
        const {rerender} = renderHook(({isOpen}) => useGroupOpenForShiftRange('group-1', isOpen), {wrapper, initialProps: {isOpen: true}});

        // When the user collapses it
        rerender({isOpen: false});

        // Then the registry closes it, so the next range stops at the header rather than spanning rows off screen
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-1');
    });

    it('closes the group when the row goes away, since its expanded state goes with it', () => {
        // Given a group this row opened
        const {removeGroupFromRange, wrapper} = setup();
        const {unmount} = renderHook(() => useGroupOpenForShiftRange('group-1', true), {wrapper});
        expect(removeGroupFromRange).not.toHaveBeenCalled();

        // When the row leaves the list
        unmount();

        // Then it closes what it opened, since the registry outlives the row that registered it
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-1');
    });

    it('closes the group it had open when the row is recycled to render another', () => {
        // Given a virtualized row holding one group open
        const {addGroupToRange, removeGroupFromRange, wrapper} = setup();
        const {rerender} = renderHook(({groupKey}) => useGroupOpenForShiftRange(groupKey, true), {wrapper, initialProps: {groupKey: 'group-1'}});

        // When the list recycles it onto a different group
        rerender({groupKey: 'group-2'});

        // Then the group it left closes and the one it took opens, rather than both reading as open
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-1');
        expect(addGroupToRange).toHaveBeenLastCalledWith('group-2');
    });
});
