import React from 'react';
import ImportSpreadsheet from '@components/ImportSpreadsheet';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ImportTransactionsSpreadsheetPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.IMPORT_TRANSACTIONS_SPREADSHEET>;

function ImportTransactionsSpreadsheetPage({route}: ImportTransactionsSpreadsheetPageProps) {
    const {cardID} = route.params ?? {};

    // If cardID is provided, we're adding transactions to an existing card (e.g. from Personal Card Details).
    // Go back to that card's details panel so the panel stays open; otherwise go to wallet or import flow.
    const backTo = cardID ? ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.getRoute(cardID) : ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS;

    return (
        <ImportSpreadsheet
            backTo={backTo}
            goTo={ROUTES.SETTINGS_WALLET_TRANSACTIONS_IMPORTED.getRoute(cardID ? Number(cardID) : undefined)}
        />
    );
}

export default ImportTransactionsSpreadsheetPage;
