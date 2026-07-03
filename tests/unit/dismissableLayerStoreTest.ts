import {nextLayerMountId, pushDismissableLayer, selectTopLayer} from '@components/Overlay/libs/dismissableLayerStore';
import type {DismissableLayerEntry, DismissableLayerKind} from '@components/Overlay/libs/dismissableLayerStore';

function makeEntry(kind: DismissableLayerKind): DismissableLayerEntry {
    return {
        kind,
        mountId: nextLayerMountId(),
    };
}

describe('dismissableLayerStore — selectTopLayer ordering', () => {
    it('the most recently mounted layer is topmost, across kinds', () => {
        const olderFloating = makeEntry('floating');
        const unregisterFloating = pushDismissableLayer(olderFloating);

        const newerModal = makeEntry('modal');
        const unregisterModal = pushDismissableLayer(newerModal);

        const top = selectTopLayer([olderFloating, newerModal]);
        expect(top).toBe(newerModal);

        unregisterModal();
        unregisterFloating();
    });

    it('selectTopLayer with a kind filter respects mount order within a kind', () => {
        const olderModal = makeEntry('modal');
        const newerModal = makeEntry('modal');
        const floating = makeEntry('floating');

        const top = selectTopLayer([olderModal, newerModal, floating], 'modal');
        expect(top).toBe(newerModal);
    });

    it('a sibling-mounted floating layer is topmost over an older one', () => {
        const earlier = makeEntry('floating');
        const later = makeEntry('floating');
        expect(selectTopLayer([earlier, later])).toBe(later);
    });
});
