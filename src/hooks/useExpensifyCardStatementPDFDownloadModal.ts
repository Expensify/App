import type {FileDownloadModalWrapperProps} from '@components/Modal/Global/FileDownloadModalWrapper';
import FileDownloadModalWrapper from '@components/Modal/Global/FileDownloadModalWrapper';
import type {ModalProps} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';

import {downloadExpensifyCardStatementPDF} from '@libs/ExpensifyCardStatementUtils';
import type {ExpensifyCardStatementParams} from '@libs/ExpensifyCardStatementUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useEffectEvent, useRef, useState} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useEnvironment from './useEnvironment';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type ExpensifyCardStatementPDFDownloadModalOptions = {
    statementParams: ExpensifyCardStatementParams;
};

// A fixed id lets a second show call update the open modal in place, which is how the statementKey reaches it
// once GetExpensifyCardStatementPDF returns.
const EXPENSIFY_CARD_STATEMENT_PDF_DOWNLOAD_MODAL_ID = 'expensifyCardStatementPDFDownloadModal';

const useExpensifyCardStatementPDFDownloadModal = () => {
    const context = useModal();
    const [statementParams, setStatementParams] = useState<ExpensifyCardStatementParams>();

    // Whether the modal is open. It turns false as soon as the modal is dismissed, so a late update can't show it
    // again: a show call with the fixed id after the modal has closed pushes a new modal instead of updating it.
    const isOpenRef = useRef(false);

    // Resolves once the modal has finished hiding. Set from the first show call until then.
    const modalPromiseRef = useRef<ReturnType<typeof context.showModal> | undefined>(undefined);

    const [expensifyCardStatement] = useOnyx(ONYXKEYS.EXPENSIFY_CARD_STATEMENT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const {translate} = useLocalize();
    const {environment} = useEnvironment();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserLogin = currentUserPersonalDetails?.login ?? '';
    const encryptedAuthToken = session?.encryptedAuthToken ?? '';

    const statementKey = statementParams?.statementKey;
    const isGeneratingPDF = expensifyCardStatement?.isGenerating === true;
    const statementFileName = statementKey ? expensifyCardStatement?.[statementKey] : undefined;
    const hasFinishedPDFDownload = !!statementKey && !isGeneratingPDF && typeof statementFileName === 'string' && statementFileName.length > 0;
    const message = hasFinishedPDFDownload ? translate('reportDetailsPage.successPDF') : translate('reportDetailsPage.waitForPDF');

    const getModalProps = (): Omit<FileDownloadModalWrapperProps, keyof ModalProps> => ({
        status: hasFinishedPDFDownload ? CONST.FILE_DOWNLOAD_STATUS.READY : CONST.FILE_DOWNLOAD_STATUS.GENERATING,
        message,
        shouldCloseOnDownload: true,
        shouldUseSuccessButton: true,
        onDownload: () => {
            if (!statementKey || typeof statementFileName !== 'string') {
                return;
            }
            downloadExpensifyCardStatementPDF(translate, statementFileName, statementKey, currentUserLogin, encryptedAuthToken, environment);
        },
        onClose: () => {
            isOpenRef.current = false;
        },
    });

    const updateOpenModal = useEffectEvent(() => {
        if (!isOpenRef.current) {
            return;
        }
        context.showModal({component: FileDownloadModalWrapper, id: EXPENSIFY_CARD_STATEMENT_PDF_DOWNLOAD_MODAL_ID, props: getModalProps()});
    });

    // Push the latest generation state into the open modal so it stays reactive without remounting.
    useEffect(() => {
        updateOpenModal();
    }, [statementKey, statementFileName, message, currentUserLogin, encryptedAuthToken, environment]);

    const showExpensifyCardStatementPDFDownloadModal = (options: ExpensifyCardStatementPDFDownloadModalOptions) => {
        setStatementParams(options.statementParams);

        // The modal is still on the stack (open or hiding), so the effect above updates it in place while it is open.
        if (modalPromiseRef.current) {
            return modalPromiseRef.current;
        }

        isOpenRef.current = true;
        const modalPromise = context.showModal({component: FileDownloadModalWrapper, id: EXPENSIFY_CARD_STATEMENT_PDF_DOWNLOAD_MODAL_ID, props: getModalProps()}).then((result) => {
            isOpenRef.current = false;
            modalPromiseRef.current = undefined;
            setStatementParams(undefined);
            return result;
        });
        modalPromiseRef.current = modalPromise;
        return modalPromise;
    };

    const closeExpensifyCardStatementPDFDownloadModal = () => {
        isOpenRef.current = false;
        context.closeModalByID(EXPENSIFY_CARD_STATEMENT_PDF_DOWNLOAD_MODAL_ID);
    };

    return {showExpensifyCardStatementPDFDownloadModal, closeExpensifyCardStatementPDFDownloadModal};
};

export default useExpensifyCardStatementPDFDownloadModal;
