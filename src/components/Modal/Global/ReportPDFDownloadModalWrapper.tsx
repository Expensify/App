import ReportPDFDownloadModal from '@components/ReportPDFDownloadModal';

import React, {useState} from 'react';

import type {ModalProps} from './ModalContext';

import {ModalActions} from './ModalContext';

type ReportPDFDownloadModalWrapperProps = ModalProps & {
    reportID: string;
};

function ReportPDFDownloadModalWrapper({closeModal, reportID}: ReportPDFDownloadModalWrapperProps) {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <ReportPDFDownloadModal
            reportID={reportID}
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

export default ReportPDFDownloadModalWrapper;
export type {ReportPDFDownloadModalWrapperProps};
