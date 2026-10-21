import {act, render} from '@testing-library/react-native';

import ExpensifyCardStatementPDFDownloadModal from '@components/ExpensifyCardStatementPDFDownloadModal';
import ExpensifyCardStatementPDFDownloadModalWrapper from '@components/Modal/Global/ExpensifyCardStatementPDFDownloadModalWrapper';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import React from 'react';

jest.mock('@components/ExpensifyCardStatementPDFDownloadModal', () => jest.fn(() => null));

const STATEMENT_PARAMS = {policyID: 'policy1', feedCountry: 'US', entryIDs: [123], statementKey: 'statement-key'};

describe('ExpensifyCardStatementPDFDownloadModalWrapper', () => {
    const mockedModal = jest.mocked(ExpensifyCardStatementPDFDownloadModal);
    const getLatestModalProps = () => mockedModal.mock.calls.at(-1)?.[0];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('removes itself from the modal stack only after the modal has finished hiding', () => {
        // Given the wrapper rendered by the global modal stack
        const closeModal = jest.fn();
        render(
            <ExpensifyCardStatementPDFDownloadModalWrapper
                closeModal={closeModal}
                resolveModal={jest.fn()}
                statementParams={STATEMENT_PARAMS}
            />,
        );

        // Then it opens the statement modal with the params passed through the show API
        expect(getLatestModalProps()?.isVisible).toBe(true);
        expect(getLatestModalProps()?.statementParams).toEqual(STATEMENT_PARAMS);

        // When a hide event fires while the modal is still visible
        act(() => {
            getLatestModalProps()?.onModalHide?.();
        });

        // Then the wrapper stays on the stack
        expect(closeModal).not.toHaveBeenCalled();

        // When the user closes the modal
        act(() => {
            getLatestModalProps()?.onClose();
        });

        // Then it starts hiding but is not removed until the hide animation ends, so callers awaiting the show
        // promise run their cleanup after the modal is gone
        expect(getLatestModalProps()?.isVisible).toBe(false);
        expect(closeModal).not.toHaveBeenCalled();

        act(() => {
            getLatestModalProps()?.onModalHide?.();
        });
        expect(closeModal).toHaveBeenCalledWith({action: ModalActions.CLOSE});
    });
});
