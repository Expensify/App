import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {downloadExpensifyCardStatementPDF} from '@libs/ExpensifyCardStatementUtils';
import type {ExpensifyCardStatementParams} from '@libs/ExpensifyCardStatementUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import type {ModalProps} from './Modal/Global/ModalContext';

import FileDownloadModalWrapper from './Modal/Global/FileDownloadModalWrapper';

type ExpensifyCardStatementPDFDownloadModalProps = ModalProps & {
    statementParams: ExpensifyCardStatementParams;
};

/**
 * Rendered by the global modal stack, so its Onyx subscription lives as long as the modal does. The caller that opened
 * it can unmount while the statement is generating and the modal still picks up the file.
 */
function ExpensifyCardStatementPDFDownloadModal({statementParams, closeModal, resolveModal}: ExpensifyCardStatementPDFDownloadModalProps) {
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

    return (
        <FileDownloadModalWrapper
            closeModal={closeModal}
            resolveModal={resolveModal}
            title={translate('reportDetailsPage.generatingPDF')}
            status={hasFinishedPDFDownload ? CONST.FILE_DOWNLOAD_STATUS.READY : CONST.FILE_DOWNLOAD_STATUS.GENERATING}
            message={hasFinishedPDFDownload ? translate('reportDetailsPage.successPDF') : translate('reportDetailsPage.waitForPDF')}
            shouldCloseOnDownload
            shouldUseSuccessButton
            onDownload={() => {
                if (!statementKey || typeof statementFileName !== 'string') {
                    return;
                }
                downloadExpensifyCardStatementPDF(translate, statementFileName, statementKey, currentUserLogin, encryptedAuthToken, environment);
            }}
        />
    );
}

export default ExpensifyCardStatementPDFDownloadModal;
export type {ExpensifyCardStatementPDFDownloadModalProps};
