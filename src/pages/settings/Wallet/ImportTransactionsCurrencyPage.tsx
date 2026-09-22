import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {setImportTransactionCurrency} from '@libs/actions/ImportSpreadsheet';
import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

function ImportTransactionsCurrencyPage() {
    const {translate} = useLocalize();
    const [importedSpreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);

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
            <HeaderWithBackButtonAndTitle
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

export default ImportTransactionsCurrencyPage;
