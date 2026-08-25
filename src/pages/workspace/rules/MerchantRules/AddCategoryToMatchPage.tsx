import ActivityIndicator from '@components/ActivityIndicator';
import RuleCategoriesDisabledEmptyState from '@components/Rule/RuleCategoriesDisabledEmptyState';
import RuleSelectionBase from '@components/Rule/RuleSelectionBase';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import {updateDraftMerchantRule} from '@libs/actions/User';
import {categoryHasTaxRule} from '@libs/CategoryTaxRulesUtils';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useFocusEffect} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

type AddCategoryToMatchPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_CATEGORY_TO_MATCH>;

function AddCategoryToMatchPage({route}: AddCategoryToMatchPageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const areCategoriesEnabled = !!policy?.areCategoriesEnabled;

    const fetchPolicyCategories = () => {
        if (!areCategoriesEnabled || policyCategories !== undefined) {
            return;
        }
        openPolicyCategoriesPage(policyID);
    };

    const {isOffline} = useNetwork({onReconnect: fetchPolicyCategories});

    useFocusEffect(() => {
        fetchPolicyCategories();
    });

    // Only spin while a fetch can actually resolve. Offline there is nothing to wait for, so fall through to the
    // picker instead of a spinner that never goes away.
    const arePolicyCategoriesLoading = areCategoriesEnabled && policyCategories === undefined && !isOffline;

    const selectedCategoryName = form?.categoryToMatch;
    const selectedCategoryItem = selectedCategoryName ? {name: getDecodedCategoryName(selectedCategoryName), value: selectedCategoryName} : undefined;

    const categoryItems = Object.values(policyCategories ?? {})
        .filter((category) => {
            if (!category.enabled) {
                return false;
            }

            // Match the rules table: keep pending-delete categories visible while offline.
            if (!isOffline && category.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return false;
            }

            // Keep the current selection available so the row it came from still resolves, but don't offer a category
            // that already has a tax default — saving over it would silently replace the existing rule.
            if (category.name === selectedCategoryName) {
                return true;
            }

            return !categoryHasTaxRule(policy?.rules?.expenseRules, category.name);
        })
        .map((category) => ({name: getDecodedCategoryName(category.name), value: category.name}));

    const backToRoute = ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);

    const onSave = (value?: string) => {
        updateDraftMerchantRule({categoryToMatch: value});
    };

    let content: React.ReactNode;
    if (!areCategoriesEnabled) {
        content = <RuleCategoriesDisabledEmptyState policyID={policyID} />;
    } else if (arePolicyCategoriesLoading) {
        content = (
            <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
            </View>
        );
    } else {
        content = (
            <RuleSelectionBase.Picker
                selectedItem={selectedCategoryItem}
                items={categoryItems}
                onSave={onSave}
                backToRoute={backToRoute}
                allowNoneOption={false}
            />
        );
    }

    return (
        <RuleSelectionBase
            titleKey="common.category"
            testID="AddCategoryToMatchPage"
            onBack={() => Navigation.goBack(backToRoute)}
        >
            {content}
        </RuleSelectionBase>
    );
}

export default AddCategoryToMatchPage;
