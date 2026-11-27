import {act, render, screen} from '@testing-library/react-native';

import type {ModalProps} from '@components/Modal/Global/ModalContext';
import {ModalActions, ModalProvider, useModal} from '@components/Modal/Global/ModalContext';

import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

let modalContext: ReturnType<typeof useModal>;

function ModalConsumer() {
    const context = useModal();
    useEffect(() => {
        modalContext = context;
    }, [context]);
    return null;
}

function TestModal({label}: ModalProps & {label: string}) {
    return (
        <View
            testID="session-modal"
            accessibilityLabel={label}
        />
    );
}

async function renderModalContext() {
    render(
        <ModalProvider>
            <ModalConsumer />
        </ModalProvider>,
    );
    await act(waitForBatchedUpdates);
}

describe('ModalProvider session changes', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, authToken: 'original-token'});
    });

    it.each([
        ['logout', null],
        ['authentication loss with an unchanged account ID', {accountID: 1}],
        ['Copilot entry', {accountID: 2, authToken: 'delegate-token'}],
    ])('dismisses the whole stack on %s', async (_description, session) => {
        // Given stacked dialogs, including one which cannot be closed by the user.
        await renderModalContext();
        const onFirstResolve = jest.fn();
        const onSecondResolve = jest.fn();
        const onReject = jest.fn();
        const onFinally = jest.fn();
        await act(async () => {
            modalContext
                .showModal({component: TestModal, props: {label: 'First'}, id: 'first', isCloseable: false})
                .then(onFirstResolve)
                .catch(onReject)
                .finally(onFinally);
            modalContext.showModal({component: TestModal, props: {label: 'Second'}}).then(onSecondResolve);
            await waitForBatchedUpdates();
        });

        // When the effective session changes, as it would after a local or cross-tab update.
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, session);
            await waitForBatchedUpdates();
        });

        // Then no outgoing-account dialog remains and no continuation can act in the new session.
        expect(screen.queryByTestId('session-modal')).toBeNull();
        for (const onSettlement of [onFirstResolve, onSecondResolve, onReject, onFinally]) {
            expect(onSettlement).not.toHaveBeenCalled();
        }

        // When a destination-account dialog reuses an old ID.
        const onNewResolve = jest.fn();
        await act(async () => {
            modalContext.showModal({component: TestModal, props: {label: 'New'}, id: 'first'}).then(onNewResolve);
            await waitForBatchedUpdates();
        });

        // Then it has its own promise and can be answered normally.
        expect(screen.getByLabelText('New')).toBeTruthy();
        expect(onNewResolve).not.toHaveBeenCalled();
        await act(async () => {
            modalContext.closeModal({action: ModalActions.CONFIRM});
            await waitForBatchedUpdates();
        });
        expect(onNewResolve).toHaveBeenCalledWith({action: ModalActions.CONFIRM});
    });

    it('dismisses on return from Copilot as well as subsequent account switches', async () => {
        // Given a provider that stays mounted across account switches.
        await renderModalContext();

        // When entering Copilot, returning, and then switching again without losing authentication.
        const switchAccount = async (accountID: number) => {
            const onResolve = jest.fn();
            await act(async () => {
                modalContext.showModal({component: TestModal, props: {label: 'Outgoing'}}).then(onResolve);
                await waitForBatchedUpdates();
            });
            await act(async () => {
                await Onyx.merge(ONYXKEYS.SESSION, {accountID});
                await waitForBatchedUpdates();
            });

            // Then every switch dismisses that account's outstanding interaction.
            expect(screen.queryByTestId('session-modal')).toBeNull();
            expect(onResolve).not.toHaveBeenCalled();
        };
        await switchAccount(2);
        await switchAccount(1);
        await switchAccount(3);
    });

    it('removes an already-resolved dialog without resolving it again', async () => {
        // Given a confirmed dialog still visible while its asynchronous work finishes.
        await renderModalContext();
        const onResolve = jest.fn();
        await act(async () => {
            modalContext.showModal({component: TestModal, props: {label: 'Working'}}).then(onResolve);
            await waitForBatchedUpdates();
        });
        await act(async () => {
            modalContext.resolveModal();
            await waitForBatchedUpdates();
        });

        // When another account becomes active.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: 2});
            await waitForBatchedUpdates();
        });

        // Then the dialog disappears without changing the caller's already-settled result.
        expect(screen.queryByTestId('session-modal')).toBeNull();
        expect(onResolve).toHaveBeenCalledTimes(1);
        expect(onResolve).toHaveBeenCalledWith({action: ModalActions.CONFIRM});
    });

    it('preserves dialogs during token refresh and ordinary rerenders', async () => {
        // Given an account-scoped dialog with no account transition.
        await renderModalContext();
        const onResolve = jest.fn();
        await act(async () => {
            modalContext.showModal({component: TestModal, props: {label: 'Keep open'}}).then(onResolve);
            await waitForBatchedUpdates();
        });

        // When authentication refreshes or unrelated session fields change.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'refreshed-token', creationDate: 123});
            await waitForBatchedUpdates();
        });

        // Then neither the dialog nor its pending interaction is discarded.
        expect(screen.getByLabelText('Keep open')).toBeTruthy();
        expect(onResolve).not.toHaveBeenCalled();
    });

    it('preserves dialogs opened on an unauthenticated public screen', async () => {
        // Given an initially unauthenticated provider, rather than a logout transition.
        await Onyx.set(ONYXKEYS.SESSION, null);
        await renderModalContext();
        const onResolve = jest.fn();
        await act(async () => {
            modalContext.showModal({component: TestModal, props: {label: 'Public dialog'}}).then(onResolve);
            await waitForBatchedUpdates();
        });

        // When the public session receives an unrelated update.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {email: 'visitor@example.com'});
            await waitForBatchedUpdates();
        });

        // Then the public dialog remains usable.
        expect(screen.getByLabelText('Public dialog')).toBeTruthy();
        expect(onResolve).not.toHaveBeenCalled();
    });

    it('does not open a follow-up dialog from the outgoing session', async () => {
        // Given a caller which opens another dialog in finally, like the hold education flow.
        await renderModalContext();
        const onFollowUp = jest.fn(() => {
            modalContext.showModal({component: TestModal, props: {label: 'Follow-up'}, id: 'reused'});
        });
        await act(async () => {
            modalContext.showModal({component: TestModal, props: {label: 'Outgoing'}, id: 'reused'}).finally(onFollowUp);
            await waitForBatchedUpdates();
        });

        // When the account changes before the user answers.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: 2});
            await waitForBatchedUpdates();
        });

        // Then the outgoing caller cannot open another dialog in the destination session.
        expect(onFollowUp).not.toHaveBeenCalled();
        expect(screen.queryByTestId('session-modal')).toBeNull();
    });
});
