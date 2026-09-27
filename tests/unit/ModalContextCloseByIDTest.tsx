import {act, renderHook} from '@testing-library/react-native';

import {ModalActions, ModalProvider, useModal} from '@components/Modal/Global/ModalContext';

import React from 'react';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const OWNED_MODAL_ID = 'ownedModal';

// The stack only ever renders its top entry, so the components pushed below need no markup. What matters is which
// entry is removed and which promise is resolved.
function StubModal() {
    return null;
}

function renderModalContext() {
    return renderHook(() => useModal(), {
        wrapper: ({children}: {children: React.ReactNode}) => <ModalProvider>{children}</ModalProvider>,
    });
}

describe('ModalProvider closeModalByID', () => {
    it('should resolve and remove the named entry while leaving the one above it alone', async () => {
        // Given an owned prompt with an unrelated modal opened on top of it, which is the state a caller cannot
        // handle with `closeModal` because that would take down the unrelated modal instead
        const {result} = renderModalContext();

        let ownedResult: {action: string} | undefined;
        let modalAboveResolved = false;
        await act(async () => {
            result.current.showModal({component: StubModal, id: OWNED_MODAL_ID}).then((payload) => {
                ownedResult = payload;
            });
            result.current.showModal({component: StubModal}).then(() => {
                modalAboveResolved = true;
            });
            await waitForBatchedUpdates();
        });

        // When the owner takes its own entry down, because the thing it was asking about has gone away
        await act(async () => {
            result.current.closeModalByID(OWNED_MODAL_ID);
            await waitForBatchedUpdates();
        });

        // Then the owner's promise resolves as a close, so its handler can run its own cleanup
        expect(ownedResult).toEqual({action: ModalActions.CLOSE});

        // Then the modal above is untouched, which is the whole reason this cannot be a stack-wide close
        expect(modalAboveResolved).toBe(false);
    });

    it('should leave the stack alone when the named entry is no longer on it', async () => {
        // Given an owned prompt the user has already answered, so its entry and promise are gone
        const {result} = renderModalContext();

        await act(async () => {
            result.current.showModal({component: StubModal, id: OWNED_MODAL_ID});
            await waitForBatchedUpdates();
        });
        await act(async () => {
            result.current.closeModal();
            await waitForBatchedUpdates();
        });

        let laterModalResolved = false;
        await act(async () => {
            result.current.showModal({component: StubModal}).then(() => {
                laterModalResolved = true;
            });
            await waitForBatchedUpdates();
        });

        // When a late close arrives for the id anyway, as it does when the Onyx value behind the prompt clears just
        // after the user answered
        await act(async () => {
            result.current.closeModalByID(OWNED_MODAL_ID);
            await waitForBatchedUpdates();
        });

        // Then nothing happens, rather than the next modal being dismissed under the user
        expect(laterModalResolved).toBe(false);
    });

    it('should allow the same id to be shown again after it was closed by id', async () => {
        // Given an owned prompt that was taken down by id without the user answering
        const {result} = renderModalContext();

        await act(async () => {
            result.current.showModal({component: StubModal, id: OWNED_MODAL_ID});
            await waitForBatchedUpdates();
        });
        await act(async () => {
            result.current.closeModalByID(OWNED_MODAL_ID);
            await waitForBatchedUpdates();
        });

        // When the same id is shown again, which happens when a second request arrives for the same prompt
        let secondResult: {action: string} | undefined;
        await act(async () => {
            result.current.showModal({component: StubModal, id: OWNED_MODAL_ID}).then((payload) => {
                secondResult = payload;
            });
            await waitForBatchedUpdates();
        });

        // When the user answers that second prompt
        await act(async () => {
            result.current.closeModal({action: ModalActions.CONFIRM});
            await waitForBatchedUpdates();
        });

        // Then it resolves on its own promise, proving the id was released rather than left pointing at the dead one
        expect(secondResult).toEqual({action: ModalActions.CONFIRM});
    });
});
