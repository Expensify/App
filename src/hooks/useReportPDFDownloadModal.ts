import type {ModalProps} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';
import type {ReportPDFDownloadModalWrapperProps} from '@components/Modal/Global/ReportPDFDownloadModalWrapper';
import ReportPDFDownloadModalWrapper from '@components/Modal/Global/ReportPDFDownloadModalWrapper';

type ReportPDFDownloadModalOptions = Omit<ReportPDFDownloadModalWrapperProps, keyof ModalProps>;

const useReportPDFDownloadModal = () => {
    const context = useModal();

    const showReportPDFDownloadModal = (options: ReportPDFDownloadModalOptions) => {
        return context.showModal({
            component: ReportPDFDownloadModalWrapper,
            props: options,
        });
    };

    return {showReportPDFDownloadModal};
};

export default useReportPDFDownloadModal;
