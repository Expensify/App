import ImportSpreadsheet from '@components/ImportSpreadsheet';

import useCloseImportPage from '@hooks/useCloseImportPage';
import useImportSpreadsheetConfirmModal from '@hooks/useImportSpreadsheetConfirmModal';
import useOnyx from '@hooks/useOnyx';

import {uploadOFXStatement} from '@libs/actions/ImportTransactions';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';

import {accountIDSelector} from '@selectors/Session';
import React from 'react';

type ImportTransactionsSpreadsheetPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.IMPORT_TRANSACTIONS_SPREADSHEET>;

function ImportTransactionsSpreadsheetPage({route}: ImportTransactionsSpreadsheetPageProps) {
    const {cardID} = route.params ?? {};
    const backTo = cardID ? undefined : ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS;
    const [importedSpreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const [accountID = CONST.DEFAULT_NUMBER_ID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const {setIsClosing} = useCloseImportPage();
    const showImportSpreadsheetConfirmModal = useImportSpreadsheetConfirmModal();

    const uploadStatement = async (file: FileObject) => {
        const importFinalModal = await uploadOFXStatement(file, importedSpreadsheet?.importTransactionSettings ?? {}, accountID);
        const didShowImportFinalModal = await showImportSpreadsheetConfirmModal(importFinalModal, {shouldHandleNavigationBack: false});
        if (!didShowImportFinalModal) {
            return;
        }
        setIsClosing(true);
        Navigation.dismissModal();
    };

    return (
        <ImportSpreadsheet
            onStatementPicked={uploadStatement}
            backTo={backTo}
            goTo={ROUTES.SETTINGS_WALLET_TRANSACTIONS_IMPORTED.getRoute(cardID ? Number(cardID) : undefined)}
        />
    );
}

export default ImportTransactionsSpreadsheetPage;
