import {nextLayerMountId, pushDismissableLayer, selectTopLayer, selectTopLayerOfKind} from '@components/Overlay/libs/dismissableLayerStore';
import type {DismissableLayerEntry, DismissableLayerKind} from '@components/Overlay/libs/dismissableLayerStore';

function makeEntry(kind: DismissableLayerKind, depth: number): DismissableLayerEntry {
    return {
        kind,
        depth,
        mountId: nextLayerMountId(),
    };
}

describe('dismissableLayerStore — selectTopLayer ordering', () => {
    it('a newer root layer outranks an older nested layer of greater depth', () => {
        const olderNested = makeEntry('floating', 2);
        const unregisterNested = pushDismissableLayer(olderNested);

        const newerRoot = makeEntry('modal', 1);
        const unregisterRoot = pushDismissableLayer(newerRoot);

        const top = selectTopLayer([olderNested, newerRoot]);
        expect(top).toBe(newerRoot);

        unregisterRoot();
        unregisterNested();
    });

    it('selectTopLayerOfKind respects mount order within a kind', () => {
        const olderModal = makeEntry('modal', 1);
        const newerModal = makeEntry('modal', 1);
        const floating = makeEntry('floating', 2);

        const top = selectTopLayerOfKind([olderModal, newerModal, floating], 'modal');
        expect(top).toBe(newerModal);
    });

    it('a sibling-mounted floating layer at the same depth is topmost over an older one', () => {
        const earlier = makeEntry('floating', 1);
        const later = makeEntry('floating', 1);
        expect(selectTopLayer([earlier, later])).toBe(later);
    });
});
