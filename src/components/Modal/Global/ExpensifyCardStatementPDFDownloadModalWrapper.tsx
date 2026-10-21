import ExpensifyCardStatementPDFDownloadModal from '@components/ExpensifyCardStatementPDFDownloadModal';

import type {ExpensifyCardStatementParams} from '@libs/ExpensifyCardStatementUtils';

import React, {useState} from 'react';

import type {ModalProps} from './ModalContext';

import {ModalActions} from './ModalContext';

type ExpensifyCardStatementPDFDownloadModalWrapperProps = ModalProps & {
    statementParams: ExpensifyCardStatementParams;
};

function ExpensifyCardStatementPDFDownloadModalWrapper({closeModal, statementParams}: ExpensifyCardStatementPDFDownloadModalWrapperProps) {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <ExpensifyCardStatementPDFDownloadModal
            statementParams={statementParams}
            isVisible={isVisible}
            onClose={() => setIsVisible(false)}
            onModalHide={() => {
                if (isVisible) {
                    return;
                }
                closeModal({action: ModalActions.CLOSE});
            }}
        />
    );
}

export default ExpensifyCardStatementPDFDownloadModalWrapper;
export type {ExpensifyCardStatementPDFDownloadModalWrapperProps};
