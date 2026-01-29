import React from 'react';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {setImportTransactionCurrency} from '@libs/actions/ImportSpreadsheet';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';

function ImportTransactionsCurrencyPage() {
    const {translate} = useLocalize();
    const [importedSpreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET, {canBeMissing: true});

    const onSelectCurrency = (item: CurrencyListItem) => {
        setImportTransactionCurrency(item.currencyCode);
        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            testID="ImportTransactionsCurrencyPage"
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.importTransactions.currency')}
                onBackButtonPress={() => Navigation.goBack()}
            />

            <CurrencySelectionList
                searchInputLabel={translate('workspace.companyCards.importTransactions.currency')}
                onSelect={onSelectCurrency}
                initiallySelectedCurrencyCode={importedSpreadsheet?.importTransactionSettings?.currency ?? 'USD'}
                addBottomSafeAreaPadding
            />
        </ScreenWrapper>
    );
}

ImportTransactionsCurrencyPage.displayName = 'ImportTransactionsCurrencyPage';

export default ImportTransactionsCurrencyPage;
