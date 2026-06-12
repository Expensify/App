import React, {useState} from 'react';
import {useCurrencyListActions, useCurrencyListState} from '@components/CurrencyListContextProvider';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import {getCurrencyOptions} from '@libs/SearchUIUtils';

type SpendRulesCurrencyBaseProps = {
    currencies: string[];
    settlementCurrency: string;
    onCurrenciesChange: (currencies: string[]) => void;
};

type CurrencyListItem = ListItem & {
    value: string;
};

export default function SpendRulesCurrencyBase({currencies, settlementCurrency, onCurrenciesChange}: SpendRulesCurrencyBaseProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(currencies);

    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();
    const currencyOptions = getCurrencyOptions(currencyList, getCurrencySymbol);

    const currencyItems: CurrencyListItem[] = currencyOptions.map((currencyDetails) => ({
        keyForList: currencyDetails.value,
        text: currencyDetails.text,
        value: currencyDetails.value,
        isSelected: selectedCurrencies.includes(currencyDetails.value),
    }));

    const filterCurrency = (item: CurrencyListItem, searchInput: string) => {
        return (item.text ?? '').toLowerCase().includes(searchInput.toLowerCase());
    };

    const sortCurrencies = (items: CurrencyListItem[]) => {
        return items.sort((a, b) => localeCompare(a.text ?? '', b.text ?? ''));
    };

    const [inputValue, setInputValue, filteredCurrencyItems] = useSearchResults(currencyItems, filterCurrency, sortCurrencies);

    const toggleCurrency = (item: CurrencyListItem) => {
        setSelectedCurrencies((prev) => {
            if (prev.includes(item.value)) {
                return prev.filter((currency) => currency !== item.value);
            }
            return [...prev, item.value];
        });
    };

    const toggleSelectAll = () => {
        const visibleValues = filteredCurrencyItems.map((item) => item.value);
        const allVisibleSelected = visibleValues.length > 0 && visibleValues.every((value) => selectedCurrencies.includes(value));

        if (allVisibleSelected) {
            const visibleSet = new Set(visibleValues);
            setSelectedCurrencies((prev) => prev.filter((currency) => !visibleSet.has(currency)));
            return;
        }

        setSelectedCurrencies((prev) => {
            const next = new Set([...prev, ...visibleValues]);
            return Array.from(next);
        });
    };

    const goBack = () => {
        Navigation.goBack();
    };

    const handleSave = () => {
        onCurrenciesChange(selectedCurrencies);
        goBack();
    };

    return (
        <ScreenWrapper
            testID="SpendRuleCurrenciesPage"
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                title={translate('workspace.rules.spendRules.permittedCurrencies')}
                onBackButtonPress={goBack}
            />
            <SelectionList
                canSelectMultiple
                shouldUpdateFocusedIndex
                ListItem={MultiSelectListItem}
                data={filteredCurrencyItems}
                selectedItems={selectedCurrencies}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                onSelectRow={toggleCurrency}
                onSelectionButtonPress={toggleCurrency}
                onSelectAll={filteredCurrencyItems.length > 0 ? toggleSelectAll : undefined}
                textInputOptions={{
                    value: inputValue,
                    label: translate('common.search'),
                    onChangeText: setInputValue,
                }}
                style={{
                    listHeaderWrapperStyle: [styles.pt5, styles.pb2],
                    listHeaderSelectAllTextStyle: [styles.textLabelSupporting],
                }}
                footerContent={
                    <FormAlertWithSubmitButton
                        buttonText={translate('common.save')}
                        isAlertVisible={false}
                        onSubmit={handleSave}
                        enabledWhenOffline
                        containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                    />
                }
            />
        </ScreenWrapper>
    );
}
