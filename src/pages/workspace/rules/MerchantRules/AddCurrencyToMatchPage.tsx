import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import {useCurrencyListActions, useCurrencyListState} from '@hooks/useCurrencyList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateDraftMerchantRule} from '@libs/actions/User';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getCurrencyOptions} from '@libs/SearchUIUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import useMerchantRuleRoute from './useMerchantRuleRoute';
import useRuleConditionSelection from './useRuleConditionSelection';

type AddCurrencyToMatchPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_CURRENCY_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_CURRENCY_TO_MATCH
>;

type CurrencyListItem = ListItem & {
    value: string;

    /** The currency's full name, which the search matches on as well as the code */
    currencyName?: string;
};

function AddCurrencyToMatchPage({route}: AddCurrencyToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_CURRENCY_TO_MATCH_FROM_EXPENSE.path, policyID, ruleID);
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const {
        selectedValues: selectedCurrencies,
        initialSelectedValues: initialSelectedCurrencies,
        toggleValue: toggleCurrencyValue,
        toggleAll,
    } = useRuleConditionSelection(form?.currenciesToMatch ?? []);

    // The same options the search filter lists, so a rule matches on exactly what an admin can search for.
    const currencyItems: CurrencyListItem[] = getCurrencyOptions(currencyList, getCurrencySymbol).map((option) => ({
        keyForList: option.value,
        text: option.text,
        value: option.value,
        currencyName: option.searchableText,
        isSelected: selectedCurrencies.includes(option.value),
    }));

    // A rule keeps matching on a currency that has since been retired. Listing it is the only way to see what the
    // rule matches on and the only way to take it off, so it is added back rather than left out of the picker.
    const listedCurrencyCodes = new Set(currencyItems.map((item) => item.value));
    for (const currencyCode of selectedCurrencies) {
        if (listedCurrencyCodes.has(currencyCode)) {
            continue;
        }
        currencyItems.push({keyForList: currencyCode, text: currencyCode, value: currencyCode, isSelected: true});
    }

    // Matched on the name as well as the code, so "pound" finds GBP.
    const filterCurrency = (item: CurrencyListItem, searchInput: string) => tokenizedSearch([item], searchInput, (currency) => [currency.text ?? '', currency.currencyName ?? '']).length > 0;

    // Pin the initially selected currencies to the top of the FULL sorted list, then let the search filter run over
    // the already-pinned list so pinned rows stay at the top even while searching.
    const sortedCurrencyItems = moveInitialSelectionToTop(
        [...currencyItems].sort((a, b) => localeCompare(a.text ?? '', b.text ?? '')),
        initialSelectedCurrencies,
    );

    const [inputValue, setInputValue, filteredCurrencyItems] = useSearchResults(sortedCurrencyItems, filterCurrency);

    const toggleCurrency = (item: CurrencyListItem) => toggleCurrencyValue(item.value);
    const toggleSelectAll = () => toggleAll(filteredCurrencyItems.map((item) => item.value));

    const goBackToRule = () => Navigation.goBack(backToRoute);

    // Clearing every currency leaves the rule matching on whatever its other conditions are.
    const handleSave = () => {
        updateDraftMerchantRule({currenciesToMatch: selectedCurrencies});
        Navigation.goBack(backToRoute, {shouldSkipFocusRestore: true});
    };

    return (
        <ScreenWrapper
            testID="AddCurrencyToMatchPage"
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButtonAndTitle
                title={translate('common.currency')}
                onBackButtonPress={goBackToRule}
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
                listEmptyContent={
                    <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                        <BlockingView
                            icon={illustrations.Telescope}
                            iconWidth={variables.emptyListIconWidth}
                            iconHeight={variables.emptyListIconHeight}
                            title={translate('common.noResultsFound')}
                        />
                    </ScrollView>
                }
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

export default AddCurrencyToMatchPage;
