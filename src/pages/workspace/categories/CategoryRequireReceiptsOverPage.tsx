import React from 'react';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {removePolicyCategoryReceiptsRequired, setPolicyCategoryReceiptsRequired} from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type EditCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_REQUIRE_RECEIPTS_OVER>;

function getInitiallyFocusedOptionKey(isAlwaysSelected: boolean, isNeverSelected: boolean): ValueOf<typeof CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS> {
    if (isAlwaysSelected) {
        return CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.ALWAYS;
    }

    if (isNeverSelected) {
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
    const policy = usePolicy(policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});

    const isAlwaysSelected = policyCategories?.[categoryName]?.maxAmountNoReceipt === 0;
    const isNeverSelected = policyCategories?.[categoryName]?.maxAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE;
    const maxExpenseAmountToDisplay = policy?.maxExpenseAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE ? 0 : policy?.maxExpenseAmountNoReceipt;

    const requireReceiptsOverListData = [
        {
            value: null,
            text: translate(`workspace.rules.categoryRules.requireReceiptsOverList.default`, {
                defaultAmount: convertToShortDisplayString(maxExpenseAmountToDisplay, policy?.outputCurrency ?? CONST.CURRENCY.USD),
            }),
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
                enableEdgeToEdgeBottomSafeAreaPadding
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
                        if (typeof item.value === 'number') {
                            setPolicyCategoryReceiptsRequired(policyID, categoryName, item.value, policyCategories);
                        } else {
                            removePolicyCategoryReceiptsRequired(policyID, categoryName, policyCategories);
                        }
                        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)));
                    }}
                    shouldSingleExecuteRowSelect
                    containerStyle={[styles.pt3]}
                    initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CategoryRequireReceiptsOverPage.displayName = 'CategoryRequireReceiptsOverPage';

export default CategoryRequireReceiptsOverPage;
