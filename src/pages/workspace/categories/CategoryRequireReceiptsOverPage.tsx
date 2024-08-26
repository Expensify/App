import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Category from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type EditCategoryPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_REQUIRE_RECEIPTS_OVER>;

function getInitiallyFocusedOptionKey(isAlwaysSelected: boolean, isNeverSelected: boolean): ValueOf<typeof CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS> {
    if (isAlwaysSelected) {
        return CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.ALWAYS;
    }

    if (isNeverSelected) {
        return CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.NEVER;
    }

    return CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.DEFAULT;
}

function performAction(policyID: string, categoryName: string, value: number | null) {
    if (typeof value === 'number') {
        Category.setPolicyCategoryReceiptsRequired(policyID, categoryName, value);
        return;
    }

    Category.removePolicyCategoryReceiptsRequired(policyID, categoryName);
}

function CategoryRequireReceiptsOverPage({
    route: {
        params: {policyID, categoryName},
    },
}: EditCategoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const isAlwaysSelected = policyCategories?.[categoryName]?.maxExpenseAmountNoReceipt === 0;
    const isNeverSelected = policyCategories?.[categoryName]?.maxExpenseAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE;

    const requireReceiptsOverListData = [
        {
            value: null,
            text: translate(`workspace.rules.categoryRules.requireReceiptsOverList.default`),
            keyForList: CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.DEFAULT,
            isSelected: !isAlwaysSelected && !isNeverSelected,
        },
        {
            value: CONST.DISABLED_MAX_EXPENSE_VALUE,
            text: translate(`workspace.rules.categoryRules.requireReceiptsOverList.never`),
            keyForList: CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.NEVER,
            isSelected: isNeverSelected,
        },
        {
            value: 0,
            text: translate(`workspace.rules.categoryRules.requireReceiptsOverList.always`),
            keyForList: CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.ALWAYS,
            isSelected: isAlwaysSelected,
        },
    ];

    const initiallyFocusedOptionKey = getInitiallyFocusedOptionKey(isAlwaysSelected, isNeverSelected);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={CategoryRequireReceiptsOverPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.categoryRules.requireReceiptsOver')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName))}
                />
                <SelectionList
                    sections={[{data: requireReceiptsOverListData}]}
                    ListItem={RadioListItem}
                    onSelectRow={(item) => {
                        performAction(policyID, categoryName, item.value);
                        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)));
                    }}
                    shouldSingleExecuteRowSelect
                    containerStyle={[styles.pt3]}
                    initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CategoryRequireReceiptsOverPage.displayName = 'CategoryRequireReceiptsOverPage';

export default CategoryRequireReceiptsOverPage;
