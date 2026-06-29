import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {downloadExpensifyCardStatementPDF} from '@libs/ExpensifyCardStatementUtils';
import type {ExpensifyCardStatementParams} from '@libs/ExpensifyCardStatementUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import PDFDownloadModal from './PDFDownloadModal';

type ExpensifyCardStatementPDFDownloadModalProps = {
    statementParams: ExpensifyCardStatementParams;
    isVisible: boolean;
    onClose: () => void;
    onModalHide?: () => void;
};

function ExpensifyCardStatementPDFDownloadModal({statementParams, isVisible, onClose, onModalHide}: ExpensifyCardStatementPDFDownloadModalProps) {
    const [expensifyCardStatement] = useOnyx(ONYXKEYS.EXPENSIFY_CARD_STATEMENT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const {translate} = useLocalize();
    const {environment} = useEnvironment();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserLogin = currentUserPersonalDetails?.login ?? '';
    const encryptedAuthToken = session?.encryptedAuthToken ?? '';

    const statementKey = statementParams.statementKey;
    const isGeneratingPDF = expensifyCardStatement?.isGenerating === true;
    const statementFileName = statementKey ? expensifyCardStatement?.[statementKey] : undefined;
    const hasFinishedPDFDownload = !!statementKey && !isGeneratingPDF && typeof statementFileName === 'string' && statementFileName.length > 0;
    const message = hasFinishedPDFDownload ? translate('reportDetailsPage.successPDF') : translate('reportDetailsPage.waitForPDF');

    return (
        <PDFDownloadModal
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={onModalHide}
            hasFinishedPDFDownload={hasFinishedPDFDownload}
            message={message}
            loadingReasonContext="SearchBulkActions.ExpensifyCardStatementPDFModal"
            shouldCloseOnDownload
            shouldUseSuccessButton
            onDownloadPDF={() => {
                if (!statementKey || typeof statementFileName !== 'string') {
                    return;
                }
                downloadExpensifyCardStatementPDF(translate, statementFileName, statementKey, currentUserLogin, encryptedAuthToken, environment);
            }}
        />
    );
}

ExpensifyCardStatementPDFDownloadModal.displayName = 'ExpensifyCardStatementPDFDownloadModal';

export default ExpensifyCardStatementPDFDownloadModal;
