import {renderHook} from '@testing-library/react-native';

import {SearchShiftRangeGroupsContext} from '@components/Search/SearchContextDefinitions';
import useOpenGroupsForShiftRange from '@components/Search/SearchList/ListItem/useOpenGroupsForShiftRange';

import React from 'react';

function setup() {
    const addGroupToRange = jest.fn();
    const removeGroupFromRange = jest.fn();
    let registryGeneration: number | undefined = 1;
    const dropRegistry = () => {
        registryGeneration = (registryGeneration ?? 0) + 1;
    };
    const wrapper = ({children}: {children: React.ReactNode}) => (
        <SearchShiftRangeGroupsContext value={{addGroupToRange, removeGroupFromRange, registryGeneration}}>{children}</SearchShiftRangeGroupsContext>
    );
    return {addGroupToRange, removeGroupFromRange, dropRegistry, wrapper};
}

describe('useOpenGroupsForShiftRange', () => {
    it('opens every group in the set', () => {
        // Given the view that owns the expanded state for the rows it recycles
        const {addGroupToRange, wrapper} = setup();

        // When it renders with two groups expanded
        renderHook(() => useOpenGroupsForShiftRange(new Set(['group-1', 'group-2'])), {wrapper});

        // Then both reach the registry, since the rows themselves never registered them
        expect(addGroupToRange).toHaveBeenCalledWith('group-1');
        expect(addGroupToRange).toHaveBeenCalledWith('group-2');
    });

    it('closes only the group that collapsed, leaving the ones that stayed open alone', () => {
        // Given two groups open
        const {addGroupToRange, removeGroupFromRange, wrapper} = setup();
        const {rerender} = renderHook(({openGroupKeys}) => useOpenGroupsForShiftRange(openGroupKeys), {
            wrapper,
            initialProps: {openGroupKeys: new Set(['group-1', 'group-2'])},
        });
        addGroupToRange.mockClear();

        // When one of them collapses
        rerender({openGroupKeys: new Set(['group-2'])});

        // Then only that one is closed: closing and reopening the set would drop a group another owner still holds
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-1');
        expect(removeGroupFromRange).not.toHaveBeenCalledWith('group-2');
        expect(addGroupToRange).not.toHaveBeenCalled();
    });

    it('opens only the group that expanded, rather than churning the whole set', () => {
        // Given two groups open
        const {addGroupToRange, removeGroupFromRange, wrapper} = setup();
        const {rerender} = renderHook(({openGroupKeys}) => useOpenGroupsForShiftRange(openGroupKeys), {
            wrapper,
            initialProps: {openGroupKeys: new Set(['group-1', 'group-2'])},
        });
        addGroupToRange.mockClear();

        // When a third expands
        rerender({openGroupKeys: new Set(['group-1', 'group-2', 'group-3'])});

        // Then one registration happens, so an expand costs the group it opened and nothing else
        expect(addGroupToRange).toHaveBeenCalledTimes(1);
        expect(addGroupToRange).toHaveBeenCalledWith('group-3');
        expect(removeGroupFromRange).not.toHaveBeenCalled();
    });

    it('opens its groups again when the registry is dropped for a new search', () => {
        // Given a group registered under the search that has just ended
        const {addGroupToRange, dropRegistry, wrapper} = setup();
        const openGroupKeys = new Set(['group-1']);
        const {rerender} = renderHook(({groupKeys}) => useOpenGroupsForShiftRange(groupKeys), {wrapper, initialProps: {groupKeys: openGroupKeys}});
        addGroupToRange.mockClear();

        // When the registry is dropped and says so through its generation
        dropRegistry();
        rerender({groupKeys: openGroupKeys});

        // Then the view registers again, since its own expanded state never changed and would otherwise stay inert
        expect(addGroupToRange).toHaveBeenCalledWith('group-1');
    });

    it('closes every open group when the view goes away, since the provider outlives it', () => {
        // Given two groups this view opened
        const {removeGroupFromRange, wrapper} = setup();
        const {unmount} = renderHook(() => useOpenGroupsForShiftRange(new Set(['group-1', 'group-2'])), {wrapper});
        expect(removeGroupFromRange).not.toHaveBeenCalled();

        // When the view unmounts
        unmount();

        // Then both close, rather than leaving the registry holding rows nothing renders
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-1');
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-2');
    });

    it('closes everything when the layout stops rendering children as rows', () => {
        // Given open groups in the layout that splits each group into a header and its children
        const {removeGroupFromRange, wrapper} = setup();
        const openGroupKeys = new Set(['group-1', 'group-2']);
        const {rerender} = renderHook(({groupKeys}) => useOpenGroupsForShiftRange(groupKeys), {wrapper, initialProps: {groupKeys: openGroupKeys}});

        // When the layout changes and the rows carry their own children again
        rerender({groupKeys: new Set<string>()});

        // Then this owner releases all of them, so the two owners cannot both claim the same groups
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-1');
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-2');
    });

    it('leaves the open groups alone while the set holds still', () => {
        // Given a set of open groups that has not changed
        const {removeGroupFromRange, wrapper} = setup();
        const openGroupKeys = new Set(['group-1']);
        const {rerender} = renderHook(({groupKeys}) => useOpenGroupsForShiftRange(groupKeys), {wrapper, initialProps: {groupKeys: openGroupKeys}});

        // When the view re-renders for an unrelated reason
        rerender({groupKeys: openGroupKeys});

        // Then nothing closes, or a render elsewhere would shrink what a live range can reach
        expect(removeGroupFromRange).not.toHaveBeenCalled();
    });
});
