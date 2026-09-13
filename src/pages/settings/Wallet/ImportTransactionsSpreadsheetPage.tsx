import ImportSpreadsheet from '@components/ImportSpreadsheet';

import useCloseImportPage from '@hooks/useCloseImportPage';
import useImportSpreadsheetConfirmModal from '@hooks/useImportSpreadsheetConfirmModal';
import useOnyx from '@hooks/useOnyx';

import {uploadOFXStatement, getExistingCardImportSettings} from '@libs/actions/ImportTransactions';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CardList} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import {cardByIdSelector} from '@selectors/Card';
import {accountIDSelector} from '@selectors/Session';
import React, {useCallback} from 'react';

type ImportTransactionsSpreadsheetPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.IMPORT_TRANSACTIONS_SPREADSHEET>;

function ImportTransactionsSpreadsheetPage({route}: ImportTransactionsSpreadsheetPageProps) {
    const {cardID} = route.params ?? {};
    const existingCardID = cardID ? Number(cardID) : undefined;
    const backTo = cardID ? undefined : ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS;
    const [importedSpreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const [savedColumnLayouts, savedColumnLayoutsMetadata] = useOnyx(ONYXKEYS.NVP_SAVED_CSV_COLUMN_LAYOUT_LIST);
    const [accountID = CONST.DEFAULT_NUMBER_ID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const cardSelector = useCallback((cardList: OnyxEntry<CardList>) => (cardID ? cardByIdSelector(String(cardID))(cardList) : undefined), [cardID]);
    const [existingCard] = useOnyx(ONYXKEYS.CARD_LIST, {selector: cardSelector});
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const {setIsClosing} = useCloseImportPage();
    const showImportSpreadsheetConfirmModal = useImportSpreadsheetConfirmModal();

    const previouslySavedLayout = existingCardID ? savedColumnLayouts?.[String(existingCardID)] : undefined;

    // Importing a spreadsheet stores the name the person gave the card where its account number goes,
    // and UploadOFX rejects a statement for a card holding a name.
    const hasImportedSpreadsheet = isLoadingOnyxValue(savedColumnLayoutsMetadata) || !!previouslySavedLayout;

    const uploadStatement = async (file: FileObject) => {
        // Re-uploading to an existing card skips the settings step, so keep the configuration the card was imported with
        const existingCardSettings = existingCardID ? getExistingCardImportSettings(existingCard, previouslySavedLayout, customCardNames?.[String(existingCardID)]) : undefined;
        const settings = {...importedSpreadsheet?.importTransactionSettings, ...existingCardSettings};
        const importFinalModal = await uploadOFXStatement(file, settings, accountID, existingCardID);
        const didShowImportFinalModal = await showImportSpreadsheetConfirmModal(importFinalModal, {shouldHandleNavigationBack: false});
        if (!didShowImportFinalModal) {
            return;
        }
        setIsClosing(true);
        Navigation.dismissModal();
    };

    return (
        <ImportSpreadsheet
            shouldAllowBankStatements={!hasImportedSpreadsheet}
            onStatementPicked={uploadStatement}
            backTo={backTo}
            goTo={ROUTES.SETTINGS_WALLET_TRANSACTIONS_IMPORTED.getRoute(existingCardID)}
        />
    );
}

export default ImportTransactionsSpreadsheetPage;
