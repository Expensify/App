import {act, renderHook} from '@testing-library/react-native';

import useOpenGroupsRegistry from '@components/Search/hooks/useOpenGroupsRegistry';

const SEARCH_HASH = 111;

const renderRegistry = () => renderHook(({searchHash}) => useOpenGroupsRegistry(searchHash), {initialProps: {searchHash: SEARCH_HASH}});

describe('useOpenGroupsRegistry', () => {
    it('opens a group and closes it again', () => {
        const {result} = renderRegistry();

        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));
        expect(result.current.openGroupKeys.has('group-1')).toBe(true);

        act(() => result.current.shiftRangeGroupsActions.removeGroupFromRange('group-1'));
        expect(result.current.openGroupKeys.has('group-1')).toBe(false);
    });

    it('keeps a group open until every owner that opened it has closed it', () => {
        const {result} = renderRegistry();

        // Given two owners of the same group's expanded state, as the split and row layouts would be
        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));
        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));

        // When the first one cleans up
        act(() => result.current.shiftRangeGroupsActions.removeGroupFromRange('group-1'));

        // Then the group is still reachable, rather than the first cleanup closing it for the other one
        expect(result.current.openGroupKeys.has('group-1')).toBe(true);

        act(() => result.current.shiftRangeGroupsActions.removeGroupFromRange('group-1'));
        expect(result.current.openGroupKeys.has('group-1')).toBe(false);
    });

    it('ignores a close for a group it never opened', () => {
        const {result} = renderRegistry();
        const before = result.current.openGroupKeys;

        act(() => result.current.shiftRangeGroupsActions.removeGroupFromRange('group-1'));

        expect(result.current.openGroupKeys).toBe(before);
    });

    it('drops every open group when the search changes, so a range cannot reach the previous results', () => {
        const {result, rerender} = renderRegistry();

        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));
        expect(result.current.openGroupKeys.has('group-1')).toBe(true);

        rerender({searchHash: 222});
        expect(result.current.openGroupKeys.has('group-1')).toBe(false);
    });

    it('drops the counts with them, so a group left open twice does not survive the change', () => {
        const {result, rerender} = renderRegistry();

        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));
        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));

        rerender({searchHash: 222});

        expect(result.current.openGroupKeys.has('group-1')).toBe(false);
    });

    it('changes the generation with the search, which is how a subscriber knows to open its group again', () => {
        const {result, rerender} = renderRegistry();
        const generationBefore = result.current.shiftRangeGroupsActions.registryGeneration;

        rerender({searchHash: 222});

        expect(result.current.shiftRangeGroupsActions.registryGeneration).not.toBe(generationBefore);
    });

    it('keeps the methods across a search change, since a subscriber depending on them would otherwise loop', () => {
        const {result, rerender} = renderRegistry();
        const {addGroupToRange, removeGroupFromRange} = result.current.shiftRangeGroupsActions;

        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));
        rerender({searchHash: 222});

        expect(result.current.shiftRangeGroupsActions.addGroupToRange).toBe(addGroupToRange);
        expect(result.current.shiftRangeGroupsActions.removeGroupFromRange).toBe(removeGroupFromRange);
    });
});
