import {setModalCovering, willAlertModalBecomeVisible} from '@userActions/Modal';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

describe('Modal actions', () => {
    let mergeSpy: jest.SpyInstance;

    beforeEach(() => {
        mergeSpy = jest.spyOn(Onyx, 'merge').mockResolvedValue(undefined);
    });

    afterEach(() => {
        mergeSpy.mockRestore();
    });

    it('keeps the covering state while overlapping covering modals close in opening order', () => {
        setModalCovering(1001, true);
        setModalCovering(1002, true);

        setModalCovering(1001, false);
        expect(mergeSpy).toHaveBeenLastCalledWith(ONYXKEYS.MODAL, {isModalCovering: true});

        setModalCovering(1002, false);
        expect(mergeSpy).toHaveBeenLastCalledWith(ONYXKEYS.MODAL, {isModalCovering: false});
    });

    it('keeps the covering state when the top modal closes first and ignores non-covering modals', () => {
        setModalCovering(1003, true);
        setModalCovering(1004, true);

        setModalCovering(1005, false);
        expect(mergeSpy).toHaveBeenLastCalledWith(ONYXKEYS.MODAL, {isModalCovering: true});

        setModalCovering(1004, false);
        expect(mergeSpy).toHaveBeenLastCalledWith(ONYXKEYS.MODAL, {isModalCovering: true});

        setModalCovering(1003, false);
        expect(mergeSpy).toHaveBeenLastCalledWith(ONYXKEYS.MODAL, {isModalCovering: false});
    });

    it('does not overwrite the covering state when alert visibility changes', () => {
        setModalCovering(1006, true);
        mergeSpy.mockClear();

        willAlertModalBecomeVisible(true, true);

        expect(mergeSpy).toHaveBeenLastCalledWith(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: true, isPopover: true});

        setModalCovering(1006, false);
    });
});
