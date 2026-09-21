import {act, renderHook} from '@testing-library/react-native';

import useOpenGroupsRegistry from '@components/Search/hooks/useOpenGroupsRegistry';

const SEARCH_HASH = 111;

const renderRegistry = () => renderHook(({searchHash}) => useOpenGroupsRegistry(searchHash), {initialProps: {searchHash: SEARCH_HASH}});

describe('useOpenGroupsRegistry', () => {
    it('opens a group and closes it again', () => {
        // Given a registry for one search
        const {result} = renderRegistry();

        // When a group is opened
        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));

        // Then a range may reach its children
        expect(result.current.openGroupKeys.has('group-1')).toBe(true);

        // And when it closes again, the range stops at the header
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

        // And it closes once the second owner lets go
        act(() => result.current.shiftRangeGroupsActions.removeGroupFromRange('group-1'));
        expect(result.current.openGroupKeys.has('group-1')).toBe(false);
    });

    it('ignores a close for a group it never opened', () => {
        // Given a registry holding nothing open
        const {result} = renderRegistry();
        const before = result.current.openGroupKeys;

        // When a cleanup arrives for a group that was never registered
        act(() => result.current.shiftRangeGroupsActions.removeGroupFromRange('group-1'));

        // Then the same set comes back, so a stray cleanup cannot re-render the list
        expect(result.current.openGroupKeys).toBe(before);
    });

    it('drops every open group when the search changes, so a range cannot reach the previous results', () => {
        // Given a group opened under one query
        const {result, rerender} = renderRegistry();
        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));
        expect(result.current.openGroupKeys.has('group-1')).toBe(true);

        // When the query changes
        rerender({searchHash: 222});

        // Then it is closed: the same row can match both queries, so openness is no proof it is still on screen
        expect(result.current.openGroupKeys.has('group-1')).toBe(false);
    });

    it('drops the counts with them, so a group left open twice does not survive the change', () => {
        // Given a group two owners hold open
        const {result, rerender} = renderRegistry();
        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));
        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));

        // When the query changes
        rerender({searchHash: 222});

        // Then the count goes with the keys, rather than leaving the group open for the rest of the new search
        expect(result.current.openGroupKeys.has('group-1')).toBe(false);
    });

    it('changes the generation with the search, which is how a subscriber knows to open its group again', () => {
        // Given the generation a subscriber re-registers on
        const {result, rerender} = renderRegistry();
        const generationBefore = result.current.shiftRangeGroupsActions.registryGeneration;

        // When the query changes
        rerender({searchHash: 222});

        // Then it moves, since a subscriber whose own expanded state did not change would otherwise stay inert
        expect(result.current.shiftRangeGroupsActions.registryGeneration).not.toBe(generationBefore);
    });

    it('keeps the methods across a search change, since a subscriber depending on them would otherwise loop', () => {
        // Given the handles a subscriber lists in its effect dependencies
        const {result, rerender} = renderRegistry();
        const {addGroupToRange, removeGroupFromRange} = result.current.shiftRangeGroupsActions;

        // When the registry is dropped for a new query
        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));
        rerender({searchHash: 222});

        // Then they are the same functions, so only the generation tells those effects to run again
        expect(result.current.shiftRangeGroupsActions.addGroupToRange).toBe(addGroupToRange);
        expect(result.current.shiftRangeGroupsActions.removeGroupFromRange).toBe(removeGroupFromRange);
    });
});
