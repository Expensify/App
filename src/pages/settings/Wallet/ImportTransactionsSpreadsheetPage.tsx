import React from 'react';
import ImportSpreadsheet from '@components/ImportSpreadsheet';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type ImportTransactionsSpreadsheetPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.IMPORT_TRANSACTIONS_SPREADSHEET>;

function ImportTransactionsSpreadsheetPage({route}: ImportTransactionsSpreadsheetPageProps) {
    const {cardID} = route.params ?? {};

    // If cardID is provided, we're adding transactions to an existing card,
    // otherwise we're creating a new card
    const backTo = cardID ? ROUTES.SETTINGS_WALLET : ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS;

    return (
        <ImportSpreadsheet
            backTo={backTo}
            goTo={ROUTES.SETTINGS_WALLET_TRANSACTIONS_IMPORTED.getRoute(cardID ? Number(cardID) : undefined)}
        />
    );
}

export default ImportTransactionsSpreadsheetPage;
