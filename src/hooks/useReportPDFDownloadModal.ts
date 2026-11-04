import {useModal} from '@components/Modal/Global/ModalContext';
import type {ModalProps} from '@components/Modal/Global/ModalContext';
import ReportPDFDownloadModal from '@components/ReportPDFDownloadModal';
import type {ReportPDFDownloadModalProps} from '@components/ReportPDFDownloadModal';

type ReportPDFDownloadModalOptions = Omit<ReportPDFDownloadModalProps, keyof ModalProps>;

const useReportPDFDownloadModal = () => {
    const context = useModal();

    /** Resolves once the modal has finished hiding, with `CLOSE` if it was dismissed while the PDF was still generating. */
    const showReportPDFDownloadModal = (options: ReportPDFDownloadModalOptions) => context.showModal({component: ReportPDFDownloadModal, props: options});

    return {showReportPDFDownloadModal};
};

export default useReportPDFDownloadModal;
