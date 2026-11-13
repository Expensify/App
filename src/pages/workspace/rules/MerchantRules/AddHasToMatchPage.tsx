import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import NegatableFilter from '@components/Search/FilterComponents/NegatableFilter';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateDraftMerchantRule} from '@libs/actions/User';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {HAS_OPTIONS} from '@libs/ExpenseDefaultRuleUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST, {HAS_VALUE_TRANSLATION_KEYS} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import useMerchantRuleRoute from './useMerchantRuleRoute';
import useRuleConditionSelection from './useRuleConditionSelection';

type AddHasToMatchPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_HAS_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_HAS_TO_MATCH>;

type HasListItem = ListItem & {
    value: string;
};

function AddHasToMatchPage({route}: AddHasToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_HAS_TO_MATCH_FROM_EXPENSE.path, policyID, ruleID);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const {selectedValues: selectedHasValues, toggleValue: toggleHasValue, toggleAll} = useRuleConditionSelection(form?.hasToMatch ?? []);

    const isNegated = (form?.hasMatchType ?? CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO) === CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO;

    const onNegationChange = (shouldNegate: boolean) => {
        updateDraftMerchantRule({hasMatchType: shouldNegate ? CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO : CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO});
    };

    // A rule can only check for a part the workspace actually uses, except where the rule already checks for it,
    // since hiding that row would leave no way to see or remove it.
    const isOptionAvailable = (value: string) => {
        if (selectedHasValues.includes(value)) {
            return true;
        }
        if (value === CONST.SEARCH.HAS_VALUES.CATEGORY) {
            return !!policy?.areCategoriesEnabled;
        }
        if (value === CONST.SEARCH.HAS_VALUES.TAG) {
            return !!policy?.areTagsEnabled;
        }
        return true;
    };

    const hasItems: HasListItem[] = HAS_OPTIONS.filter(isOptionAvailable).map((value) => ({
        keyForList: value,
        text: translate(HAS_VALUE_TRANSLATION_KEYS[value]),
        value,
        isSelected: selectedHasValues.includes(value),
    }));

    const toggleHasItem = (item: HasListItem) => toggleHasValue(item.value);
    const toggleSelectAll = () => toggleAll(hasItems.map((item) => item.value));

    const goBackToRule = () => Navigation.goBack(backToRoute);

    // Clearing every part leaves the rule matching on whatever its other conditions are.
    const handleSave = () => {
        updateDraftMerchantRule({hasToMatch: selectedHasValues});
        Navigation.goBack(backToRoute, {shouldSkipFocusRestore: true});
    };

    return (
        <ScreenWrapper
            testID="AddHasToMatchPage"
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButtonAndTitle
                title={translate('workspace.rules.merchantRules.hasOrDoesNotHave')}
                onBackButtonPress={goBackToRule}
            />
            <NegatableFilter
                style={[styles.flex1, styles.pt3]}
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS}
                isNegated={isNegated}
                onNegationChange={onNegationChange}
            >
                <SelectionList
                    canSelectMultiple
                    shouldUpdateFocusedIndex
                    ListItem={MultiSelectListItem}
                    data={hasItems}
                    selectedItems={selectedHasValues}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    onSelectRow={toggleHasItem}
                    onSelectionButtonPress={toggleHasItem}
                    onSelectAll={hasItems.length > 0 ? toggleSelectAll : undefined}
                    style={{
                        listHeaderWrapperStyle: [styles.pt2, styles.pb2],
                        listHeaderSelectAllTextStyle: [styles.textLabelSupporting],
                    }}
                    footerContent={
                        <FormAlertWithSubmitButton
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_HAS_TO_MATCH_SAVE}
                            buttonText={translate('common.save')}
                            isAlertVisible={false}
                            onSubmit={handleSave}
                            enabledWhenOffline
                            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                        />
                    }
                />
            </NegatableFilter>
        </ScreenWrapper>
    );
}

export default AddHasToMatchPage;
