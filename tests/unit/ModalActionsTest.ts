import {setModalCovering, willAlertModalBecomeVisible} from '@userActions/Modal';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

describe('Modal actions', () => {
    let mergeSpy: jest.SpyInstance;
    let setSpy: jest.SpyInstance;

    beforeEach(() => {
        mergeSpy = jest.spyOn(Onyx, 'merge').mockResolvedValue(undefined);
        setSpy = jest.spyOn(Onyx, 'set').mockResolvedValue(undefined);
    });

    afterEach(() => {
        mergeSpy.mockRestore();
        setSpy.mockRestore();
    });

    it('keeps the covering state while overlapping covering modals close in opening order', () => {
        setModalCovering(1001, true);
        setModalCovering(1002, true);

        setModalCovering(1001, false);
        expect(setSpy).toHaveBeenLastCalledWith(ONYXKEYS.RAM_ONLY_IS_PRODUCT_MARKETING_WINDOW_COVERED, true);

        setModalCovering(1002, false);
        expect(setSpy).toHaveBeenLastCalledWith(ONYXKEYS.RAM_ONLY_IS_PRODUCT_MARKETING_WINDOW_COVERED, false);
    });

    it('keeps the covering state when the top modal closes first and ignores non-covering modals', () => {
        setModalCovering(1003, true);
        setModalCovering(1004, true);

        setModalCovering(1005, false);
        expect(setSpy).toHaveBeenLastCalledWith(ONYXKEYS.RAM_ONLY_IS_PRODUCT_MARKETING_WINDOW_COVERED, true);

        setModalCovering(1004, false);
        expect(setSpy).toHaveBeenLastCalledWith(ONYXKEYS.RAM_ONLY_IS_PRODUCT_MARKETING_WINDOW_COVERED, true);

        setModalCovering(1003, false);
        expect(setSpy).toHaveBeenLastCalledWith(ONYXKEYS.RAM_ONLY_IS_PRODUCT_MARKETING_WINDOW_COVERED, false);
    });

    it('does not overwrite the covering state when alert visibility changes', () => {
        setModalCovering(1006, true);
        mergeSpy.mockClear();
        setSpy.mockClear();

        willAlertModalBecomeVisible(true, true);

        expect(mergeSpy).toHaveBeenLastCalledWith(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: true, isPopover: true});
        expect(setSpy).not.toHaveBeenCalled();

        setModalCovering(1006, false);
    });
});
