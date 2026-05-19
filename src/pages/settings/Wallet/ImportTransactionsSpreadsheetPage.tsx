import React from 'react';
import ImportSpreadsheet from '@components/ImportSpreadsheet';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ImportTransactionsSpreadsheetPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.IMPORT_TRANSACTIONS_SPREADSHEET>;

function ImportTransactionsSpreadsheetPage({route}: ImportTransactionsSpreadsheetPageProps) {
    const {cardID} = route.params ?? {};

    // When cardID is provided we're adding transactions to an existing card. The screen can be entered
    // either from the card details RHP (PersonalCardDetailsHeaderMenu) or from the wallet 3-dot menu,
    // so we omit `backTo` and let the default stack pop return to whichever screen is underneath.
    // Without a cardID we're in the new-card flow and want to skip past the intermediate card-name
    // and currency screens straight back to the import-transactions landing.
    const backTo = cardID ? undefined : ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS;

    return (
        <ImportSpreadsheet
            backTo={backTo}
            goTo={ROUTES.SETTINGS_WALLET_TRANSACTIONS_IMPORTED.getRoute(cardID ? Number(cardID) : undefined)}
        />
    );
}

export default ImportTransactionsSpreadsheetPage;
