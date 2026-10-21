import {downloadExpensifyCardStatementPDF} from '@libs/ExpensifyCardStatementUtils';
import type {ExpensifyCardStatementParams} from '@libs/ExpensifyCardStatementUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useState} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useEnvironment from './useEnvironment';
import useFileDownloadModal from './useFileDownloadModal';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type ExpensifyCardStatementPDFDownloadModalOptions = {
    statementParams: ExpensifyCardStatementParams;
};

// A second show call updates the open modal in place, which is how the statementKey reaches it once
// GetExpensifyCardStatementPDF returns.
const EXPENSIFY_CARD_STATEMENT_PDF_DOWNLOAD_MODAL_ID = 'expensifyCardStatementPDFDownloadModal';

const useExpensifyCardStatementPDFDownloadModal = () => {
    const [statementParams, setStatementParams] = useState<ExpensifyCardStatementParams>();

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

    const {showFileDownloadModal, closeFileDownloadModal} = useFileDownloadModal({
        id: EXPENSIFY_CARD_STATEMENT_PDF_DOWNLOAD_MODAL_ID,
        title: translate('reportDetailsPage.generatingPDF'),
        status: hasFinishedPDFDownload ? CONST.FILE_DOWNLOAD_STATUS.READY : CONST.FILE_DOWNLOAD_STATUS.GENERATING,
        message: hasFinishedPDFDownload ? translate('reportDetailsPage.successPDF') : translate('reportDetailsPage.waitForPDF'),
        shouldCloseOnDownload: true,
        shouldUseSuccessButton: true,
        onDownload: () => {
            if (!statementKey || typeof statementFileName !== 'string') {
                return;
            }
            downloadExpensifyCardStatementPDF(translate, statementFileName, statementKey, currentUserLogin, encryptedAuthToken, environment);
        },
    });

    const showExpensifyCardStatementPDFDownloadModal = (options: ExpensifyCardStatementPDFDownloadModalOptions) => {
        setStatementParams(options.statementParams);
        return showFileDownloadModal().then((result) => {
            setStatementParams(undefined);
            return result;
        });
    };

    return {showExpensifyCardStatementPDFDownloadModal, closeExpensifyCardStatementPDFDownloadModal: closeFileDownloadModal};
};

export default useExpensifyCardStatementPDFDownloadModal;
