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
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateDraftMerchantRule} from '@libs/actions/User';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getMerchantTypeLabel, MERCHANT_TYPES} from '@libs/ExpenseDefaultRuleUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import useMerchantRuleRoute from './useMerchantRuleRoute';
import useRuleConditionSelection from './useRuleConditionSelection';

type AddMerchantTypeToMatchPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_MERCHANT_TYPE_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_TYPE_TO_MATCH
>;

type MerchantTypeListItem = ListItem & {
    value: string;
};

function AddMerchantTypeToMatchPage({route}: AddMerchantTypeToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_TYPE_TO_MATCH_FROM_EXPENSE.path, policyID, ruleID);
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const {
        selectedValues: selectedMerchantTypes,
        initialSelectedValues: initialSelectedMerchantTypes,
        toggleValue: toggleMerchantTypeValue,
        toggleAll,
    } = useRuleConditionSelection(form?.merchantTypesToMatch ?? []);

    const merchantTypeItems: MerchantTypeListItem[] = MERCHANT_TYPES.map((merchantType) => ({
        keyForList: merchantType,
        text: getMerchantTypeLabel(merchantType, translate),
        value: merchantType,
        isSelected: selectedMerchantTypes.includes(merchantType),
    }));

    const filterMerchantType = (item: MerchantTypeListItem, searchInput: string) => tokenizedSearch([item], searchInput, (merchantType) => [merchantType.text ?? '']).length > 0;

    // Pin the initially selected types to the top of the FULL sorted list, then let the search filter run over the
    // already-pinned list so pinned rows stay at the top even while searching.
    const sortedMerchantTypeItems = moveInitialSelectionToTop(
        [...merchantTypeItems].sort((a, b) => localeCompare(a.text ?? '', b.text ?? '')),
        initialSelectedMerchantTypes,
    );

    const [inputValue, setInputValue, filteredMerchantTypeItems] = useSearchResults(sortedMerchantTypeItems, filterMerchantType);

    const toggleMerchantType = (item: MerchantTypeListItem) => toggleMerchantTypeValue(item.value);
    const toggleSelectAll = () => toggleAll(filteredMerchantTypeItems.map((item) => item.value));

    const goBackToRule = () => Navigation.goBack(backToRoute);

    // Clearing every type leaves the rule matching on whatever its other conditions are.
    const handleSave = () => {
        updateDraftMerchantRule({merchantTypesToMatch: selectedMerchantTypes});
        Navigation.goBack(backToRoute, {shouldSkipFocusRestore: true});
    };

    return (
        <ScreenWrapper
            testID="AddMerchantTypeToMatchPage"
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButtonAndTitle
                title={translate('workspace.rules.merchantTypeRule.merchantType')}
                onBackButtonPress={goBackToRule}
            />
            <SelectionList
                canSelectMultiple
                shouldUpdateFocusedIndex
                ListItem={MultiSelectListItem}
                data={filteredMerchantTypeItems}
                selectedItems={selectedMerchantTypes}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                onSelectRow={toggleMerchantType}
                onSelectionButtonPress={toggleMerchantType}
                onSelectAll={filteredMerchantTypeItems.length > 0 ? toggleSelectAll : undefined}
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

export default AddMerchantTypeToMatchPage;
