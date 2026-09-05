import {act, renderHook} from '@testing-library/react-native';

import useOpenGroupsRegistry from '@components/Search/hooks/useOpenGroupsRegistry';

const SEARCH_HASH = 111;

const renderRegistry = () => renderHook(({searchHash}) => useOpenGroupsRegistry(searchHash), {initialProps: {searchHash: SEARCH_HASH}});

describe('useOpenGroupsRegistry', () => {
    it('opens a group and closes it again', () => {
        const {result} = renderRegistry();

        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));
        expect([...result.current.openGroupKeys]).toEqual(['group-1']);

        act(() => result.current.shiftRangeGroupsActions.removeGroupFromRange('group-1'));
        expect([...result.current.openGroupKeys]).toEqual([]);
    });

    it('returns the same set when a group is opened twice, so a republish re-renders nothing', () => {
        const {result} = renderRegistry();

        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));
        const openedOnce = result.current.openGroupKeys;

        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));
        expect(result.current.openGroupKeys).toBe(openedOnce);
    });

    it('drops every open group when the search changes, so a range cannot reach the previous results', () => {
        const {result, rerender} = renderRegistry();

        act(() => result.current.shiftRangeGroupsActions.addGroupToRange('group-1'));
        expect([...result.current.openGroupKeys]).toEqual(['group-1']);

        rerender({searchHash: 222});
        expect([...result.current.openGroupKeys]).toEqual([]);
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
