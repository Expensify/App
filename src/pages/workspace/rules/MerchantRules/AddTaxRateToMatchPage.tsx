import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateDraftMerchantRule} from '@libs/actions/User';
import {getTaxRateDisplayName} from '@libs/CategoryTaxRulesUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import useMerchantRuleRoute from './useMerchantRuleRoute';
import useRuleConditionSelection from './useRuleConditionSelection';

type AddTaxRateToMatchPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_TAX_RATE_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_TAX_RATE_TO_MATCH
>;

type TaxRateListItem = ListItem & {
    value: string;
};

function AddTaxRateToMatchPage({route}: AddTaxRateToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_TAX_RATE_TO_MATCH_FROM_EXPENSE.path, policyID, ruleID);
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policy = usePolicy(policyID);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const {
        selectedValues: selectedTaxRates,
        initialSelectedValues: initialSelectedTaxRates,
        toggleValue: toggleTaxRateValue,
        toggleAll,
    } = useRuleConditionSelection(form?.taxRatesToMatch ?? []);

    // Keyed by external ID, which is what the tax action already stores and what the rule tree carries.
    const taxRateItems: TaxRateListItem[] = Object.entries(policy?.taxRates?.taxes ?? {})
        .filter(([, taxRate]) => !taxRate.isDisabled || selectedTaxRates.includes(taxRate.code ?? ''))
        .map(([externalID, taxRate]) => ({
            keyForList: taxRate.code ?? externalID,
            text: getTaxRateDisplayName(policy, taxRate.code ?? externalID),
            value: taxRate.code ?? externalID,
            isSelected: selectedTaxRates.includes(taxRate.code ?? externalID),
        }));

    // A rule keeps matching on a rate the workspace has since removed. Listing it is the only way to see what the
    // rule matches on and the only way to take it off, so it is added back rather than left out of the picker.
    const listedTaxRateIDs = new Set(taxRateItems.map((item) => item.value));
    for (const externalID of selectedTaxRates) {
        if (listedTaxRateIDs.has(externalID)) {
            continue;
        }
        taxRateItems.push({keyForList: externalID, text: externalID, value: externalID, isSelected: true});
    }

    const filterTaxRate = (item: TaxRateListItem, searchInput: string) => tokenizedSearch([item], searchInput, (taxRate) => [taxRate.text ?? '']).length > 0;

    // Pin the initially selected rates to the top of the FULL sorted list, then let the search filter run over the
    // already-pinned list so pinned rows stay at the top even while searching.
    const sortedTaxRateItems = moveInitialSelectionToTop(
        [...taxRateItems].sort((a, b) => localeCompare(a.text ?? '', b.text ?? '')),
        initialSelectedTaxRates,
    );

    const [inputValue, setInputValue, filteredTaxRateItems] = useSearchResults(sortedTaxRateItems, filterTaxRate);

    const toggleTaxRate = (item: TaxRateListItem) => toggleTaxRateValue(item.value);
    const toggleSelectAll = () => toggleAll(filteredTaxRateItems.map((item) => item.value));

    const goBackToRule = () => Navigation.goBack(backToRoute);

    // Clearing every rate leaves the rule matching on whatever its other conditions are.
    const handleSave = () => {
        updateDraftMerchantRule({taxRatesToMatch: selectedTaxRates});
        Navigation.goBack(backToRoute, {shouldSkipFocusRestore: true});
    };

    return (
        <ScreenWrapper
            testID="AddTaxRateToMatchPage"
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButtonAndTitle
                title={translate('workspace.taxes.taxRate')}
                onBackButtonPress={goBackToRule}
            />
            <SelectionList
                canSelectMultiple
                shouldUpdateFocusedIndex
                ListItem={MultiSelectListItem}
                data={filteredTaxRateItems}
                selectedItems={selectedTaxRates}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                onSelectRow={toggleTaxRate}
                onSelectionButtonPress={toggleTaxRate}
                onSelectAll={filteredTaxRateItems.length > 0 ? toggleSelectAll : undefined}
                textInputOptions={
                    sortedTaxRateItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT
                        ? {
                              value: inputValue,
                              label: translate('common.search'),
                              onChangeText: setInputValue,
                          }
                        : undefined
                }
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

export default AddTaxRateToMatchPage;
