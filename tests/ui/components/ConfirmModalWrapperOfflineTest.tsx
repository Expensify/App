import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import ConfirmModalWrapper from '@components/Modal/Global/ConfirmModalWrapper';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type useNetwork from '@hooks/useNetwork';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/hooks/useResponsiveLayout');

const mockUseNetwork = jest.fn<ReturnType<typeof useNetwork>, Parameters<typeof useNetwork>>(() => ({isOffline: false}));
jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: (props?: Parameters<typeof useNetwork>[0]) => mockUseNetwork(props),
}));

const CONFIRM_TEXT = 'Unlock bank account';
const CANCEL_TEXT = 'Cancel';

function Wrapper({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>;
}

function renderConfirmModalWrapper(onConfirm?: () => Promise<string | void>, shouldStackButtons = true) {
    const closeModal = jest.fn();
    const resolveModal = jest.fn();

    render(
        <Wrapper>
            <ConfirmModalWrapper
                closeModal={closeModal}
                resolveModal={resolveModal}
                title="Locked bank account"
                prompt="You can't pay this while offline"
                confirmText={CONFIRM_TEXT}
                cancelText={CANCEL_TEXT}
                shouldShowCancelButton
                shouldDisableConfirmButtonWhenOffline
                // Routing confirm through the async resolve path lets us assert the confirm handler ran without depending on the modal-hide animation.
                isConfirmLoading={false}
                onConfirm={onConfirm}
                shouldStackButtons={shouldStackButtons}
            />
        </Wrapper>,
    );

    return {closeModal, resolveModal};
}

describe('ConfirmModalWrapper (locked BA offline)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        mockUseNetwork.mockReturnValue({isOffline: false});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('disables the confirm button and ignores taps while offline when shouldDisableConfirmButtonWhenOffline is set', async () => {
        // Given the confirm modal opts into disabling its confirm button while offline, and the user is offline
        mockUseNetwork.mockReturnValue({isOffline: true});

        const {resolveModal} = renderConfirmModalWrapper();
        await waitForBatchedUpdatesWithAct();

        // Then the confirm button is disabled
        const confirmButton = screen.getByRole(CONST.ROLE.BUTTON, {name: CONFIRM_TEXT});
        expect(confirmButton).toBeDisabled();

        // And tapping it does not confirm the modal
        fireEvent.press(confirmButton);
        await waitForBatchedUpdatesWithAct();
        expect(resolveModal).not.toHaveBeenCalled();
    });

    it('keeps the confirm button enabled and confirms on tap while online', async () => {
        // Given the same modal but the user is online
        mockUseNetwork.mockReturnValue({isOffline: false});

        const {resolveModal} = renderConfirmModalWrapper();
        await waitForBatchedUpdatesWithAct();

        // Then the confirm button is enabled
        const confirmButton = screen.getByRole(CONST.ROLE.BUTTON, {name: CONFIRM_TEXT});
        expect(confirmButton).toBeEnabled();

        // And tapping it confirms the modal
        fireEvent.press(confirmButton);
        await waitForBatchedUpdatesWithAct();
        expect(resolveModal).toHaveBeenCalledWith({action: 'CONFIRM'});
    });

    it.each([true, false])('announces busy and offers safe retry after rejection with stacked buttons: %p', async (shouldStackButtons) => {
        // Given an async action rejects without supplying user-facing copy
        const pendingConfirmation = Promise.withResolvers<string | void>();
        const confirm = jest.fn<Promise<string | void>, []>().mockReturnValueOnce(pendingConfirmation.promise).mockResolvedValueOnce('Please try again.');
        const {closeModal, resolveModal} = renderConfirmModalWrapper(confirm, shouldStackButtons);
        await waitForBatchedUpdatesWithAct();

        // When the user confirms
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: CONFIRM_TEXT}));
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: CONFIRM_TEXT, busy: true})).toBeDisabled();
        await act(async () => pendingConfirmation.reject(new Error('Private server details')));
        await waitForBatchedUpdatesWithAct();

        // Then the modal offers retry and cancel, without exposing private error details or resolving as success
        expect(screen.getByText('Oops... something went wrong and your request could not be completed. Please try again later.')).toBeOnTheScreen();
        expect(screen.queryByText('Private server details')).not.toBeOnTheScreen();
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: CANCEL_TEXT})).toBeEnabled();
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: CONFIRM_TEXT, busy: false})).toBeEnabled();
        expect(closeModal).not.toHaveBeenCalled();
        expect(resolveModal).not.toHaveBeenCalled();

        // When the user retries
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: CONFIRM_TEXT}));
        await waitForBatchedUpdatesWithAct();

        // Then another attempt runs and its localized feedback replaces the previous error
        expect(confirm).toHaveBeenCalledTimes(2);
        expect(screen.getByText('Please try again.')).toBeOnTheScreen();
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: CONFIRM_TEXT})).toBeEnabled();
    });
});
