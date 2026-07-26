import type {ModalGuardSnapshot} from '@components/Modal/useSyncModalWithHistory/modalGuardSnapshot';
import reduceModalGuardState, {getModalGuardEventFromSnapshotChange} from '@components/Modal/useSyncModalWithHistory/modalGuardState';

describe('reduceModalGuardState', () => {
    it('fires onClose when browser Back removes the guard while open and visible', () => {
        const result = reduceModalGuardState('open', {type: 'GUARD_REMOVED', routesGrew: false}, true);

        expect(result).toEqual({state: 'closed', effect: 'onClose'});
    });

    it('settles to closed without onClose when our own close dispatch removed the guard', () => {
        const result = reduceModalGuardState('closingByDispatch', {type: 'GUARD_REMOVED', routesGrew: false}, false);

        expect(result).toEqual({state: 'closed'});
    });

    it('settles to closed without onClose when forward navigation consumed the guard', () => {
        const result = reduceModalGuardState('open', {type: 'GUARD_REMOVED', routesGrew: true}, true);

        expect(result).toEqual({state: 'closed'});
    });

    it('settles to closed without onClose when the guard is removed while the modal is already closed', () => {
        const result = reduceModalGuardState('open', {type: 'GUARD_REMOVED', routesGrew: false}, false);

        expect(result).toEqual({state: 'closed'});
    });

    it('fires onOpen when browser Forward restores the guard while closed', () => {
        const result = reduceModalGuardState('closed', {type: 'GUARD_APPEARED'}, false);

        expect(result).toEqual({state: 'open', effect: 'onOpen'});
    });

    it('ignores GUARD_APPEARED when not closed', () => {
        const result = reduceModalGuardState('open', {type: 'GUARD_APPEARED'}, false);

        expect(result).toEqual({state: 'open'});
    });

    it('ignores GUARD_REMOVED when already closed', () => {
        const result = reduceModalGuardState('closed', {type: 'GUARD_REMOVED', routesGrew: false}, true);

        expect(result).toEqual({state: 'closed'});
    });
});

describe('getModalGuardEventFromSnapshotChange', () => {
    it('returns GUARD_REMOVED when the sentinel disappears', () => {
        const prevSnapshot: ModalGuardSnapshot = {
            guardPresent: true,
            routesLength: 2,
        };
        const nextSnapshot: ModalGuardSnapshot = {
            guardPresent: false,
            routesLength: 3,
        };

        expect(getModalGuardEventFromSnapshotChange(prevSnapshot, nextSnapshot, true)).toEqual({
            type: 'GUARD_REMOVED',
            routesGrew: true,
        });
    });

    it('returns GUARD_APPEARED when the sentinel is restored while the modal is closed', () => {
        const prevSnapshot: ModalGuardSnapshot = {
            guardPresent: false,
            routesLength: 2,
        };
        const nextSnapshot: ModalGuardSnapshot = {
            guardPresent: true,
            routesLength: 2,
        };

        expect(getModalGuardEventFromSnapshotChange(prevSnapshot, nextSnapshot, false)).toEqual({type: 'GUARD_APPEARED'});
    });

    it('returns undefined when the guard appears while the modal is visible', () => {
        const prevSnapshot: ModalGuardSnapshot = {
            guardPresent: false,
            routesLength: 2,
        };
        const nextSnapshot: ModalGuardSnapshot = {
            guardPresent: true,
            routesLength: 2,
        };

        expect(getModalGuardEventFromSnapshotChange(prevSnapshot, nextSnapshot, true)).toBeUndefined();
    });

    it('returns undefined when the snapshot is unchanged', () => {
        const snapshot: ModalGuardSnapshot = {
            guardPresent: true,
            routesLength: 2,
        };

        expect(getModalGuardEventFromSnapshotChange(snapshot, snapshot, true)).toBeUndefined();
    });
});
