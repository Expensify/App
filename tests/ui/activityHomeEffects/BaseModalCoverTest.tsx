import BaseModal from '@components/Modal/BaseModal';

import {setModalCovering, willAlertModalBecomeVisible} from '@userActions/Modal';

import CONST from '@src/CONST';

import React from 'react';

import renderScreenWithCover, {getCoverMode} from '../../utils/ScreenCoverHarness';

jest.mock('@userActions/Modal', () => ({
    areAllModalsHidden: jest.fn(() => true),
    closeTop: jest.fn(),
    onModalDidClose: jest.fn(),
    setCloseModal: jest.fn(() => () => {}),
    setModalCovering: jest.fn(),
    setModalVisibility: jest.fn(),
    willAlertModalBecomeVisible: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {isTopmostRouteModalScreen: () => false},
}));

jest.mock('@components/Modal/ReanimatedModal', () => ({
    __esModule: true,
    default: () => null,
}));

/**
 * A visible modal on Home is torn down by the cover the same way a real unmount tears it down, and the teardown is
 * where BaseModal runs its close bookkeeping. These tests pin what that costs today. Both Activity expectations
 * describe a defect this branch could not fix at the call site (see the modal-infra report): whoever lands the fix
 * flips them, they are not a target to preserve.
 */
describe('BaseModal under a cover', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('runs the close bookkeeping of a still-visible modal when the screen is covered', async () => {
        const onModalHide = jest.fn();

        const screenCover = renderScreenWithCover(
            <BaseModal
                isVisible
                type={CONST.MODAL.MODAL_TYPE.CENTERED}
                onModalHide={onModalHide}
            >
                {null}
            </BaseModal>,
        );
        expect(onModalHide).not.toHaveBeenCalled();

        await screenCover.hide();

        // The modal is still mounted and still painted, so a hide must not report it as hidden.
        expect(onModalHide).toHaveBeenCalledTimes(getCoverMode() === 'activity' ? 1 : 0);
        expect(jest.mocked(willAlertModalBecomeVisible).mock.calls.at(-1)?.at(0)).toBe(getCoverMode() !== 'activity');
        screenCover.unmount();
    });

    it('drops the covering entry of a still-visible modal for the whole covered window', async () => {
        const screenCover = renderScreenWithCover(
            <BaseModal
                isVisible
                type={CONST.MODAL.MODAL_TYPE.CENTERED}
            >
                {null}
            </BaseModal>,
        );
        expect(jest.mocked(setModalCovering).mock.calls.at(-1)?.at(1)).toBe(true);

        await screenCover.hide();

        // Anything gated on a covering modal can paint over a modal that is still on screen while this is false.
        expect(jest.mocked(setModalCovering).mock.calls.at(-1)?.at(1)).toBe(getCoverMode() !== 'activity');

        await screenCover.reveal();

        expect(jest.mocked(setModalCovering).mock.calls.at(-1)?.at(1)).toBe(true);
        screenCover.unmount();
    });
});
