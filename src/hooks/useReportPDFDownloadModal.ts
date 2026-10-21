import type {FileDownloadModalWrapperProps} from '@components/Modal/Global/FileDownloadModalWrapper';
import FileDownloadModalWrapper from '@components/Modal/Global/FileDownloadModalWrapper';
import type {ModalProps} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';

import {downloadReportPDF} from '@libs/actions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useEffectEvent, useRef, useState} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useStallLogger from './useStallLogger';

type ReportPDFDownloadModalOptions = {
    reportID: string;

    /** Called when the modal is dismissed while the PDF is still generating (e.g. Submit via PDF retracts the submit). */
    onCancel?: () => void;
};

// A fixed id lets the hook show the open modal again with fresh props, which updates it in place as the PDF
// filename arrives instead of stacking a new modal.
const REPORT_PDF_DOWNLOAD_MODAL_ID = 'reportPDFDownloadModal';

const useReportPDFDownloadModal = () => {
    const context = useModal();
    const [activeReportID, setActiveReportID] = useState<string>();

    // Whether the modal is open. It turns false as soon as the user dismisses the modal, so a late update can't show
    // it again: a show call with the fixed id after the modal has closed pushes a new modal instead of updating it.
    const isOpenRef = useRef(false);

    // Resolves once the modal has finished hiding. Set from the first show call until then.
    const modalPromiseRef = useRef<ReturnType<typeof context.showModal> | undefined>(undefined);
    const onCancelRef = useRef<(() => void) | undefined>(undefined);

    const [reportPDFFilename] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME}${activeReportID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${activeReportID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserLogin = currentUserPersonalDetails?.login ?? '';
    const encryptedAuthToken = session?.encryptedAuthToken ?? '';
    const reportName = report?.reportName ?? '';
    const {isOffline} = useNetwork();

    const hasPDFDownloadFailed = reportPDFFilename === CONST.REPORT_DETAILS_MENU_ITEM.ERROR;
    const hasFinishedPDFDownload = !!reportPDFFilename && !hasPDFDownloadFailed;

    // reportPDFFilename only ever resolves via a backend-pushed Onyx update (no client timeout), so a filename
    // that never arrives and never errors leaves the spinner stuck with nothing else to log it. See Expensify#667674.
    // Excluded while offline: the request is legitimately queued and waiting for connectivity, not stuck.
    // Keyed by reportID (not just a boolean) so if the modal is shown for a different report, the timer restarts
    // against the new report instead of firing late and blaming the wrong one.
    useStallLogger(
        !!activeReportID && !isOffline && !reportPDFFilename ? activeReportID : false,
        '[PDFStall] reportPDFFilename never resolved to a filename or error while the download modal was open',
        {
            reportID: activeReportID,
        },
    );

    const message = (() => {
        if (hasPDFDownloadFailed) {
            return translate('reportDetailsPage.errorPDF');
        }
        if (!hasFinishedPDFDownload) {
            return translate('reportDetailsPage.waitForPDF');
        }
        return translate('reportDetailsPage.successPDF');
    })();

    const getStatus = () => {
        if (hasPDFDownloadFailed) {
            return CONST.FILE_DOWNLOAD_STATUS.FAILED;
        }
        return hasFinishedPDFDownload ? CONST.FILE_DOWNLOAD_STATUS.READY : CONST.FILE_DOWNLOAD_STATUS.GENERATING;
    };

    const getModalProps = (): Omit<FileDownloadModalWrapperProps, keyof ModalProps> => ({
        status: getStatus(),
        message,
        shouldTreatModalAsCovering: true,
        onDownload: () => {
            if (!hasFinishedPDFDownload) {
                return;
            }
            downloadReportPDF(reportPDFFilename, reportName, translate, currentUserLogin, encryptedAuthToken);
        },
        // reportPDFFilename is null while the backend is still generating, so a dismissal at that point is a cancel
        // (e.g. Submit via PDF retracts the submit); once it holds a filename or 'error' the submit has already resolved.
        onClose: () => {
            if (!isOpenRef.current) {
                return;
            }
            isOpenRef.current = false;
            if (!reportPDFFilename) {
                onCancelRef.current?.();
            }
        },
    });

    const updateOpenModal = useEffectEvent(() => {
        if (!isOpenRef.current) {
            return;
        }
        context.showModal({component: FileDownloadModalWrapper, id: REPORT_PDF_DOWNLOAD_MODAL_ID, props: getModalProps()});
    });

    // Push the latest generation state into the open modal so it stays reactive without remounting.
    useEffect(() => {
        updateOpenModal();
    }, [activeReportID, reportPDFFilename, reportName, message, currentUserLogin, encryptedAuthToken]);

    const showReportPDFDownloadModal = ({reportID, onCancel}: ReportPDFDownloadModalOptions) => {
        onCancelRef.current = onCancel;
        setActiveReportID(reportID);

        // The modal is still on the stack (open or hiding), so the effect above updates it in place while it is open.
        if (modalPromiseRef.current) {
            return modalPromiseRef.current;
        }

        isOpenRef.current = true;
        const modalPromise = context.showModal({component: FileDownloadModalWrapper, id: REPORT_PDF_DOWNLOAD_MODAL_ID, props: getModalProps()}).then((result) => {
            isOpenRef.current = false;
            modalPromiseRef.current = undefined;
            onCancelRef.current = undefined;
            setActiveReportID(undefined);
            return result;
        });
        modalPromiseRef.current = modalPromise;
        return modalPromise;
    };

    return {showReportPDFDownloadModal};
};

export default useReportPDFDownloadModal;
