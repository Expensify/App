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
import {removePolicyCategoryReceiptsRequired, setPolicyCategoryReceiptsRequired} from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type EditCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_REQUIRE_RECEIPTS_OVER>;

function getInitiallyFocusedOptionKey(isAlwaysSelected: boolean, isNeverSelected: boolean, isPolicyDisabled: boolean): ValueOf<typeof CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS> {
    if (isAlwaysSelected) {
        return CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.ALWAYS;
    }

    if (isNeverSelected || isPolicyDisabled) {
        return CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.NEVER;
    }

    return CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.DEFAULT;
}

function CategoryRequireReceiptsOverPage({
    route: {
        params: {policyID, categoryName},
    },
}: EditCategoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyData = usePolicyData(policyID);
    const {policy, categories: policyCategories} = policyData;
    const isAlwaysSelected = policyCategories?.[categoryName]?.maxAmountNoReceipt === 0;
    const isNeverSelected = policyCategories?.[categoryName]?.maxAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE;
    const isPolicyReceiptDisabled = policy?.maxExpenseAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE || policy?.maxExpenseAmountNoReceipt === undefined;

    const requireReceiptsOverListData = [
        ...(!isPolicyReceiptDisabled
            ? [
                  {
                      value: null,
                      text: translate(
                          `workspace.rules.categoryRules.requireReceiptsOverList.default`,
                          convertToDisplayString(policy.maxExpenseAmountNoReceipt, policy?.outputCurrency ?? CONST.CURRENCY.USD),
                      ),
                      keyForList: CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.DEFAULT,
                      isSelected: !isAlwaysSelected && !isNeverSelected,
                  },
              ]
            : []),
        {
            value: CONST.DISABLED_MAX_EXPENSE_VALUE,
            text: translate(`workspace.rules.categoryRules.requireReceiptsOverList.never`),
            keyForList: CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.NEVER,
            isSelected: isPolicyReceiptDisabled ? !isAlwaysSelected : isNeverSelected,
        },
        {
            value: 0,
            text: translate(`workspace.rules.categoryRules.requireReceiptsOverList.always`),
            keyForList: CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.ALWAYS,
            isSelected: isAlwaysSelected,
        },
    ];

    const initiallyFocusedOptionKey = getInitiallyFocusedOptionKey(isAlwaysSelected, isNeverSelected, isPolicyReceiptDisabled);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="CategoryRequireReceiptsOverPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.categoryRules.requireReceiptsOver')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName))}
                />
                <SelectionList
                    data={requireReceiptsOverListData}
                    ListItem={RadioListItem}
                    onSelectRow={(item) => {
                        if (typeof item.value === 'number') {
                            setPolicyCategoryReceiptsRequired(policyData, categoryName, item.value);
                        } else {
                            removePolicyCategoryReceiptsRequired(policyData, categoryName);
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

export default CategoryRequireReceiptsOverPage;
