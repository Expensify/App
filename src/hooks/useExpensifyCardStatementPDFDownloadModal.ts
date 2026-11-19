import ExpensifyCardStatementPDFDownloadModal from '@components/ExpensifyCardStatementPDFDownloadModal';
import type {ExpensifyCardStatementPDFDownloadModalProps} from '@components/ExpensifyCardStatementPDFDownloadModal';
import {useModal} from '@components/Modal/Global/ModalContext';
import type {ModalProps} from '@components/Modal/Global/ModalContext';

type ExpensifyCardStatementPDFDownloadModalOptions = Omit<ExpensifyCardStatementPDFDownloadModalProps, keyof ModalProps>;

// A fixed id lets a second show call update the open modal in place, which is how the statementKey reaches it
// once GetExpensifyCardStatementPDF returns.
const EXPENSIFY_CARD_STATEMENT_PDF_DOWNLOAD_MODAL_ID = 'expensifyCardStatementPDFDownloadModal';

const useExpensifyCardStatementPDFDownloadModal = () => {
    const context = useModal();

    /** Resolves once the modal has finished hiding, with `CLOSE` if it was dismissed while the statement was still generating. */
    const showExpensifyCardStatementPDFDownloadModal = (options: ExpensifyCardStatementPDFDownloadModalOptions) =>
        context.showModal({component: ExpensifyCardStatementPDFDownloadModal, id: EXPENSIFY_CARD_STATEMENT_PDF_DOWNLOAD_MODAL_ID, props: options});

    const closeExpensifyCardStatementPDFDownloadModal = () => context.closeModalByID(EXPENSIFY_CARD_STATEMENT_PDF_DOWNLOAD_MODAL_ID);

    return {showExpensifyCardStatementPDFDownloadModal, closeExpensifyCardStatementPDFDownloadModal};
};

export default useExpensifyCardStatementPDFDownloadModal;
