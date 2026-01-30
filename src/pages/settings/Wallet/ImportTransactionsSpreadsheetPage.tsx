import React from 'react';
import ImportSpreadsheet from '@components/ImportSpreadsheet';
import ROUTES from '@src/ROUTES';

function ImportTransactionsSpreadsheetPage() {
    return (
        <ImportSpreadsheet
            backTo={ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS}
            goTo={ROUTES.SETTINGS_WALLET_TRANSACTIONS_IMPORTED.getRoute()}
        />
    );
}

export default ImportTransactionsSpreadsheetPage;
