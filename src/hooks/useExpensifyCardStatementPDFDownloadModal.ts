import type {ExpensifyCardStatementPDFDownloadModalWrapperProps} from '@components/Modal/Global/ExpensifyCardStatementPDFDownloadModalWrapper';
import ExpensifyCardStatementPDFDownloadModalWrapper from '@components/Modal/Global/ExpensifyCardStatementPDFDownloadModalWrapper';
import type {ModalProps} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';

type ExpensifyCardStatementPDFDownloadModalOptions = Omit<ExpensifyCardStatementPDFDownloadModalWrapperProps, keyof ModalProps>;

// A fixed id lets a second show call update the open modal in place, which is how the statementKey reaches it
// once GetExpensifyCardStatementPDF returns.
const EXPENSIFY_CARD_STATEMENT_PDF_DOWNLOAD_MODAL_ID = 'expensifyCardStatementPDFDownloadModal';

const useExpensifyCardStatementPDFDownloadModal = () => {
    const context = useModal();

    const showExpensifyCardStatementPDFDownloadModal = (options: ExpensifyCardStatementPDFDownloadModalOptions) => {
        return context.showModal({
            component: ExpensifyCardStatementPDFDownloadModalWrapper,
            id: EXPENSIFY_CARD_STATEMENT_PDF_DOWNLOAD_MODAL_ID,
            props: options,
        });
    };

    const closeExpensifyCardStatementPDFDownloadModal = () => context.closeModalByID(EXPENSIFY_CARD_STATEMENT_PDF_DOWNLOAD_MODAL_ID);

    return {showExpensifyCardStatementPDFDownloadModal, closeExpensifyCardStatementPDFDownloadModal};
};

export default useExpensifyCardStatementPDFDownloadModal;
