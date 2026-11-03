import shouldCollapseExpandedGroupAfterPendingDelete from '@components/Search/SearchList/ListItem/shouldCollapseExpandedGroupAfterPendingDelete';

import CONST from '@src/CONST';

describe('shouldCollapseExpandedGroupAfterPendingDelete', () => {
    it('collapses an expanded group whose loaded children are all pending-delete', () => {
        expect(
            shouldCollapseExpandedGroupAfterPendingDelete({
                isExpanded: true,
                loadedChildrenCount: 2,
                remainingChildrenCount: 0,
            }),
        ).toBe(true);
    });

    it('keeps the group expanded while any loaded child remains', () => {
        expect(
            shouldCollapseExpandedGroupAfterPendingDelete({
                isExpanded: true,
                loadedChildrenCount: 2,
                remainingChildrenCount: 1,
            }),
        ).toBe(false);
    });

    it('does not collapse a group that has not been expanded', () => {
        expect(
            shouldCollapseExpandedGroupAfterPendingDelete({
                isExpanded: false,
                loadedChildrenCount: 2,
                remainingChildrenCount: 0,
            }),
        ).toBe(false);
    });

    it('does not collapse a lazy group whose children have not loaded yet', () => {
        expect(
            shouldCollapseExpandedGroupAfterPendingDelete({
                isExpanded: true,
                loadedChildrenCount: 0,
                remainingChildrenCount: 0,
            }),
        ).toBe(false);
    });

    it('keeps a whole-group pending delete expanded so offline styling still shows', () => {
        expect(
            shouldCollapseExpandedGroupAfterPendingDelete({
                isExpanded: true,
                groupPendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                loadedChildrenCount: 2,
                remainingChildrenCount: 0,
            }),
        ).toBe(false);
    });
});
