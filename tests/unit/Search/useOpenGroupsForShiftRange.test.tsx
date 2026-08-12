import {renderHook} from '@testing-library/react-native';

import {SearchShiftRangeChildrenContext} from '@components/Search/SearchContextDefinitions';
import useOpenGroupsForShiftRange from '@components/Search/SearchList/ListItem/useOpenGroupsForShiftRange';

import React from 'react';

function setup() {
    const registerGroupChildren = jest.fn();
    const addGroupToRange = jest.fn();
    const removeGroupFromRange = jest.fn();
    const wrapper = ({children}: {children: React.ReactNode}) => (
        <SearchShiftRangeChildrenContext value={{registerGroupChildren, addGroupToRange, removeGroupFromRange}}>{children}</SearchShiftRangeChildrenContext>
    );
    return {addGroupToRange, removeGroupFromRange, wrapper};
}

describe('useOpenGroupsForShiftRange', () => {
    it('opens every group in the set', () => {
        const {addGroupToRange, wrapper} = setup();
        renderHook(() => useOpenGroupsForShiftRange(new Set(['group-1', 'group-2'])), {wrapper});
        expect(addGroupToRange).toHaveBeenCalledWith('group-1');
        expect(addGroupToRange).toHaveBeenCalledWith('group-2');
    });

    it('closes the group that collapsed and reopens the rest', () => {
        const {addGroupToRange, removeGroupFromRange, wrapper} = setup();
        const {rerender} = renderHook(({openGroupKeys}) => useOpenGroupsForShiftRange(openGroupKeys), {
            wrapper,
            initialProps: {openGroupKeys: new Set(['group-1', 'group-2'])},
        });
        addGroupToRange.mockClear();
        rerender({openGroupKeys: new Set(['group-2'])});
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-1');
        expect(addGroupToRange).toHaveBeenCalledWith('group-2');
        expect(addGroupToRange).not.toHaveBeenCalledWith('group-1');
    });

    it('closes every open group when the view goes away, since the provider outlives it', () => {
        const {removeGroupFromRange, wrapper} = setup();
        const {unmount} = renderHook(() => useOpenGroupsForShiftRange(new Set(['group-1', 'group-2'])), {wrapper});
        expect(removeGroupFromRange).not.toHaveBeenCalled();
        unmount();
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-1');
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-2');
    });

    it('closes everything when the layout stops rendering children as rows', () => {
        const {removeGroupFromRange, wrapper} = setup();
        const openGroupKeys = new Set(['group-1', 'group-2']);
        const {rerender} = renderHook(({groupKeys}) => useOpenGroupsForShiftRange(groupKeys), {wrapper, initialProps: {groupKeys: openGroupKeys}});
        rerender({groupKeys: new Set<string>()});
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-1');
        expect(removeGroupFromRange).toHaveBeenCalledWith('group-2');
    });

    it('leaves the open groups alone while the set holds still', () => {
        const {removeGroupFromRange, wrapper} = setup();
        const openGroupKeys = new Set(['group-1']);
        const {rerender} = renderHook(({groupKeys}) => useOpenGroupsForShiftRange(groupKeys), {wrapper, initialProps: {groupKeys: openGroupKeys}});
        rerender({groupKeys: openGroupKeys});
        expect(removeGroupFromRange).not.toHaveBeenCalled();
    });
});
