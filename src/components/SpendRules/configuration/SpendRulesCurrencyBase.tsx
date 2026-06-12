import React, {useState} from 'react';
import {View} from 'react-native';
import {useCurrencyListActions, useCurrencyListState} from '@components/CurrencyListContextProvider';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSearchResults from '@hooks/useSearchResults';
import useTheme from '@hooks/useTheme';
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
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Lock']);

    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();
    const currencyOptions = getCurrencyOptions(currencyList, getCurrencySymbol);
    const validCurrencyOptions = currencyOptions.filter((option) => option.value !== settlementCurrency);

    const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(() => {
        if (currencies.length > 0) {
            return currencies.filter((currency) => currency !== settlementCurrency);
        }

        return validCurrencyOptions.map((option) => option.value);
    });

    let areAllCurrenciesSelected = true;
    let settlementCurrencyLabel = settlementCurrency;
    const currencyItems: CurrencyListItem[] = [];

    for (const currencyOption of validCurrencyOptions) {
        const isSelected = selectedCurrencies.includes(currencyOption.value);

        currencyItems.push({
            keyForList: currencyOption.value,
            text: currencyOption.text,
            value: currencyOption.value,
            isSelected: selectedCurrencies.includes(currencyOption.value),
        });

        if (!isSelected) {
            areAllCurrenciesSelected = false;
        }

        if (currencyOption.value === settlementCurrency) {
            settlementCurrencyLabel = currencyOption.text;
        }
    }

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
        if (selectedCurrencies.length === currencyOptions.length - 1) {
            onCurrenciesChange([]);
        } else {
            onCurrenciesChange([...selectedCurrencies, settlementCurrency]);
        }

        goBack();
    };

    const ListHeaderContent = (
        <View style={[styles.flexColumn]}>
            <MultiSelectListItem
                isFocused={false}
                showTooltip={false}
                keyForList="select-all"
                item={{keyForList: 'select-all', text: 'All currencies', isSelected: areAllCurrenciesSelected}}
                onSelectRow={toggleSelectAll}
            />
            <View style={[styles.borderBottom, styles.mh5, styles.mv2]} />
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mv4, styles.mh5]}>
                <View style={[styles.flex1, styles.gap1]}>
                    <Text
                        style={styles.textStrong}
                        numberOfLines={1}
                    >
                        {settlementCurrencyLabel}
                    </Text>
                    <Text
                        style={[styles.textLabel, styles.textSupporting]}
                        numberOfLines={1}
                    >
                        The card settlement currency is always permitted
                    </Text>
                </View>
                <Icon
                    medium
                    src={icons.Lock}
                    fill={theme.icon}
                />
            </View>
        </View>
    );

    return (
        <ScreenWrapper
            testID="SpendRuleCurrenciesPage"
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                title={translate('workspace.rules.spendRules.permittedCurrencies')}
                onBackButtonPress={goBack}
            />

            <Text style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pb4]}>Choose to allow all or specific currencies.</Text>

            <SelectionList
                canSelectMultiple
                shouldUpdateFocusedIndex
                customListHeaderContent={ListHeaderContent}
                ListItem={MultiSelectListItem}
                data={filteredCurrencyItems}
                selectedItems={selectedCurrencies}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                onSelectRow={toggleCurrency}
                onSelectionButtonPress={toggleCurrency}
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
