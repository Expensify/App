import React from 'react';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {removePolicyCategoryItemizedReceiptsRequired, setPolicyCategoryItemizedReceiptsRequired} from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type EditCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_REQUIRE_ITEMIZED_RECEIPTS_OVER>;

function getInitiallyFocusedOptionKey(isAlwaysSelected: boolean, isNeverSelected: boolean, isPolicyDisabled: boolean): ValueOf<typeof CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS> {
    if (isAlwaysSelected) {
        return CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.ALWAYS;
    }

    if (isNeverSelected || isPolicyDisabled) {
        return CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.NEVER;
    }

    return CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.DEFAULT;
}

function CategoryRequireItemizedReceiptsOverPage({
    route: {
        params: {policyID, categoryName},
    },
}: EditCategoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyData = usePolicyData(policyID);
    const {policy, categories: policyCategories} = policyData;
    const isAlwaysSelected = policyCategories?.[categoryName]?.maxAmountNoItemizedReceipt === 0;
    const isNeverSelected = policyCategories?.[categoryName]?.maxAmountNoItemizedReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE;
    const isPolicyItemizedReceiptDisabled = policy?.maxExpenseAmountNoItemizedReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE || policy?.maxExpenseAmountNoItemizedReceipt === undefined;

    const requireItemizedReceiptsOverListData = [
        ...(!isPolicyItemizedReceiptDisabled
            ? [
                  {
                      value: null,
                      text: translate(
                          `workspace.rules.categoryRules.requireItemizedReceiptsOverList.default`,
                          convertToDisplayString(policy.maxExpenseAmountNoItemizedReceipt, policy?.outputCurrency ?? CONST.CURRENCY.USD),
                      ),
                      keyForList: CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.DEFAULT,
                      isSelected: !isAlwaysSelected && !isNeverSelected,
                  },
              ]
            : []),
        {
            value: CONST.DISABLED_MAX_EXPENSE_VALUE,
            text: translate(`workspace.rules.categoryRules.requireItemizedReceiptsOverList.never`),
            keyForList: CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.NEVER,
            isSelected: isPolicyItemizedReceiptDisabled ? !isAlwaysSelected : isNeverSelected,
        },
        {
            value: 0,
            text: translate(`workspace.rules.categoryRules.requireItemizedReceiptsOverList.always`),
            keyForList: CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.ALWAYS,
            isSelected: isAlwaysSelected,
        },
    ];

    const initiallyFocusedOptionKey = getInitiallyFocusedOptionKey(isAlwaysSelected, isNeverSelected, isPolicyItemizedReceiptDisabled);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="CategoryRequireItemizedReceiptsOverPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.categoryRules.requireItemizedReceiptsOver')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName))}
                />
                <SelectionList
                    data={requireItemizedReceiptsOverListData}
                    ListItem={RadioListItem}
                    onSelectRow={(item) => {
                        if (typeof item.value === 'number') {
                            setPolicyCategoryItemizedReceiptsRequired(policyData, categoryName, item.value);
                        } else {
                            removePolicyCategoryItemizedReceiptsRequired(policyData, categoryName);
                        }
                        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)));
                    }}
                    style={{containerStyle: styles.pt3}}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={initiallyFocusedOptionKey}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default CategoryRequireItemizedReceiptsOverPage;
