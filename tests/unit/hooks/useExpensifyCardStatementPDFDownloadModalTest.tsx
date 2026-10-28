import {act, renderHook} from '@testing-library/react-native';

import FileDownloadModal from '@components/Modal/FileDownloadModal';
import {ModalActions, ModalProvider} from '@components/Modal/Global/ModalContext';

import useExpensifyCardStatementPDFDownloadModal from '@hooks/useExpensifyCardStatementPDFDownloadModal';
import useOnyx from '@hooks/useOnyx';

import {downloadExpensifyCardStatementPDF} from '@libs/ExpensifyCardStatementUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useSyncExternalStore} from 'react';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// Counts real mounts, so a test can tell an in-place props update apart from a remount.
const mockOnFileDownloadModalMount = jest.fn();
jest.mock('@components/Modal/FileDownloadModal', () => {
    const {useEffect} = jest.requireActual<typeof React>('react');
    return jest.fn(() => {
        useEffect(() => {
            mockOnFileDownloadModalMount();
        }, []);
        return null;
    });
});
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@libs/ExpensifyCardStatementUtils', () => ({downloadExpensifyCardStatementPDF: jest.fn()}));
jest.mock('@hooks/useEnvironment', () => jest.fn(() => ({environment: 'development'})));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: 'employee@mail.com'})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const STATEMENT_PARAMS = {policyID: 'policy1', feedCountry: 'US', entryIDs: [123]};
const STATEMENT_KEY = 'statement-key';

let mockOnyxValues: Record<string, unknown> = {};
const onyxListeners = new Set<() => void>();
const subscribeToOnyx = (listener: () => void) => {
    onyxListeners.add(listener);
    return () => onyxListeners.delete(listener);
};

// A minimal reactive store, so an update re-renders the modal the global modal stack renders, like a real Onyx subscription.
const useMockOnyx = (key: string) => [useSyncExternalStore(subscribeToOnyx, () => mockOnyxValues[key])];

describe('useExpensifyCardStatementPDFDownloadModal', () => {
    const mockedFileDownloadModal = jest.mocked(FileDownloadModal);
    const getLatestModalProps = () => mockedFileDownloadModal.mock.calls.at(-1)?.[0];

    const renderStatementPDFDownloadModal = () =>
        renderHook(() => useExpensifyCardStatementPDFDownloadModal(), {
            wrapper: ({children}: {children: React.ReactNode}) => <ModalProvider>{children}</ModalProvider>,
        });

    // Mirrors a backend-pushed Onyx update.
    const setStatementInOnyx = async (statement: Record<string, unknown>) => {
        await act(async () => {
            mockOnyxValues = {...mockOnyxValues, [ONYXKEYS.EXPENSIFY_CARD_STATEMENT]: statement};
            for (const listener of onyxListeners) {
                listener();
            }
            await waitForBatchedUpdates();
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnyxValues = {[ONYXKEYS.SESSION]: {encryptedAuthToken: 'token'}};
        (jest.mocked(useOnyx) as jest.Mock).mockImplementation(useMockOnyx);
    });

    it('updates the open modal in place as the statementKey and file arrive', async () => {
        // Given the modal opened before GetExpensifyCardStatementPDF has returned a statementKey
        const {result} = renderStatementPDFDownloadModal();
        let firstPromise: Promise<unknown> | undefined;
        await act(async () => {
            firstPromise = result.current.showExpensifyCardStatementPDFDownloadModal({statementParams: STATEMENT_PARAMS});
            await waitForBatchedUpdates();
        });

        // Then it shows the generating state with the card statement button flags
        expect(getLatestModalProps()).toEqual(
            expect.objectContaining({
                isVisible: true,
                title: 'reportDetailsPage.generatingPDF',
                status: CONST.FILE_DOWNLOAD_STATUS.GENERATING,
                message: 'reportDetailsPage.waitForPDF',
                shouldCloseOnDownload: true,
                shouldUseSuccessButton: true,
            }),
        );

        // When the statementKey arrives through a second show call and the backend pushes the generated file
        let secondPromise: Promise<unknown> | undefined;
        await act(async () => {
            secondPromise = result.current.showExpensifyCardStatementPDFDownloadModal({statementParams: {...STATEMENT_PARAMS, statementKey: STATEMENT_KEY}});
            await waitForBatchedUpdates();
        });
        await setStatementInOnyx({isGenerating: false, [STATEMENT_KEY]: 'statement.pdf'});

        // Then the same modal instance switches to the ready state
        expect(getLatestModalProps()).toEqual(expect.objectContaining({isVisible: true, status: CONST.FILE_DOWNLOAD_STATUS.READY, message: 'reportDetailsPage.successPDF'}));
        expect(mockOnFileDownloadModalMount).toHaveBeenCalledTimes(1);

        // When the modal downloads the file, which also closes it, and it finishes hiding
        await act(async () => {
            getLatestModalProps()?.onDownload();
            getLatestModalProps()?.onClose();
            await waitForBatchedUpdates();
        });
        await act(async () => {
            getLatestModalProps()?.onModalHide?.();
            await waitForBatchedUpdates();
        });

        // Then it downloads the statement for that key, and both callers learn the flow completed
        expect(downloadExpensifyCardStatementPDF).toHaveBeenCalledWith(expect.any(Function), 'statement.pdf', STATEMENT_KEY, 'employee@mail.com', 'token', 'development');
        await expect(firstPromise).resolves.toEqual({action: ModalActions.CONFIRM});
        await expect(secondPromise).resolves.toEqual({action: ModalActions.CONFIRM});
    });

    it('keeps updating the modal after the caller unmounts', async () => {
        // Given a caller, such as the Search page, that opens the modal and then unmounts while the statement is generating
        let shouldRenderCaller = true;
        const {result, rerender} = renderHook(() => useExpensifyCardStatementPDFDownloadModal(), {
            wrapper: ({children}: {children: React.ReactNode}) => <ModalProvider>{shouldRenderCaller ? children : null}</ModalProvider>,
        });
        await act(async () => {
            result.current.showExpensifyCardStatementPDFDownloadModal({statementParams: {...STATEMENT_PARAMS, statementKey: STATEMENT_KEY}});
            await waitForBatchedUpdates();
        });
        shouldRenderCaller = false;
        rerender({});

        // When the backend pushes the generated file
        await setStatementInOnyx({isGenerating: false, [STATEMENT_KEY]: 'statement.pdf'});

        // Then the modal, which owns its own subscription, still switches to the ready state and offers the download
        expect(getLatestModalProps()).toEqual(expect.objectContaining({isVisible: true, status: CONST.FILE_DOWNLOAD_STATUS.READY}));
        act(() => {
            getLatestModalProps()?.onDownload();
        });
        expect(downloadExpensifyCardStatementPDF).toHaveBeenCalledWith(expect.any(Function), 'statement.pdf', STATEMENT_KEY, 'employee@mail.com', 'token', 'development');
    });

    it('keeps the generating state while the statement is still generating', async () => {
        // Given the modal opened with a statementKey whose file is cached but being regenerated
        const {result} = renderStatementPDFDownloadModal();
        await act(async () => {
            result.current.showExpensifyCardStatementPDFDownloadModal({statementParams: {...STATEMENT_PARAMS, statementKey: STATEMENT_KEY}});
            await waitForBatchedUpdates();
        });

        // When Onyx says the statement is generating
        await setStatementInOnyx({isGenerating: true, [STATEMENT_KEY]: 'statement.pdf'});

        // Then the modal still waits instead of offering a stale file
        expect(getLatestModalProps()?.status).toBe(CONST.FILE_DOWNLOAD_STATUS.GENERATING);
    });

    it('resolves the show promise only after the modal has finished hiding', async () => {
        // Given an open modal
        const {result} = renderStatementPDFDownloadModal();
        let hasResolved = false;
        await act(async () => {
            result.current.showExpensifyCardStatementPDFDownloadModal({statementParams: STATEMENT_PARAMS}).then(() => {
                hasResolved = true;
            });
            await waitForBatchedUpdates();
        });

        // When the user dismisses it
        await act(async () => {
            getLatestModalProps()?.onClose();
            await waitForBatchedUpdates();
        });

        // Then it starts hiding but the caller, which clears the selection on resolve, is not told it is gone yet
        expect(getLatestModalProps()?.isVisible).toBe(false);
        expect(hasResolved).toBe(false);

        // When the hide animation ends
        await act(async () => {
            getLatestModalProps()?.onModalHide?.();
            await waitForBatchedUpdates();
        });

        // Then the show promise resolves
        expect(hasResolved).toBe(true);
    });

    it('does not reopen a dismissed modal when the statementKey arrives during the hide animation', async () => {
        // Given the user dismissed the modal before the statementKey arrived
        const {result} = renderStatementPDFDownloadModal();
        await act(async () => {
            result.current.showExpensifyCardStatementPDFDownloadModal({statementParams: STATEMENT_PARAMS});
            await waitForBatchedUpdates();
        });
        await act(async () => {
            getLatestModalProps()?.onClose();
            await waitForBatchedUpdates();
        });

        // When the statementKey and file arrive while the modal is hiding
        await act(async () => {
            result.current.showExpensifyCardStatementPDFDownloadModal({statementParams: {...STATEMENT_PARAMS, statementKey: STATEMENT_KEY}});
            await waitForBatchedUpdates();
        });
        await setStatementInOnyx({isGenerating: false, [STATEMENT_KEY]: 'statement.pdf'});

        // Then the hiding modal is left alone
        expect(getLatestModalProps()).toEqual(expect.objectContaining({isVisible: false, status: CONST.FILE_DOWNLOAD_STATUS.GENERATING}));

        // When the hide animation ends and another update arrives
        await act(async () => {
            getLatestModalProps()?.onModalHide?.();
            await waitForBatchedUpdates();
        });
        const renderCountAfterHide = mockedFileDownloadModal.mock.calls.length;
        await setStatementInOnyx({isGenerating: false, [STATEMENT_KEY]: 'statement-2.pdf'});

        // Then the modal is not shown again
        expect(mockedFileDownloadModal.mock.calls.length).toBe(renderCountAfterHide);
        expect(mockOnFileDownloadModalMount).toHaveBeenCalledTimes(1);
    });

    it('closes the modal by id without reopening it on a later update', async () => {
        // Given an open modal waiting on the statement
        const {result} = renderStatementPDFDownloadModal();
        let hasResolved = false;
        await act(async () => {
            result.current.showExpensifyCardStatementPDFDownloadModal({statementParams: {...STATEMENT_PARAMS, statementKey: STATEMENT_KEY}}).then(() => {
                hasResolved = true;
            });
            await waitForBatchedUpdates();
        });

        // When the request fails and the caller closes the modal by id
        await act(async () => {
            result.current.closeExpensifyCardStatementPDFDownloadModal();
            await waitForBatchedUpdates();
        });
        const renderCountAfterClose = mockedFileDownloadModal.mock.calls.length;

        // Then the modal is gone and its promise resolves
        expect(hasResolved).toBe(true);

        // When the file arrives afterwards
        await setStatementInOnyx({isGenerating: false, [STATEMENT_KEY]: 'statement.pdf'});

        // Then the modal is not shown again
        expect(mockedFileDownloadModal.mock.calls.length).toBe(renderCountAfterClose);
    });
});
