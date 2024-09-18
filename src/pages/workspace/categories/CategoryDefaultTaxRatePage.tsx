import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CategoryUtils from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Category from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {TaxRate} from '@src/types/onyx';

type EditCategoryPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_DEFAULT_TAX_RATE>;

function CategoryDefaultTaxRatePage({
    route: {
        params: {policyID, categoryName},
    },
}: EditCategoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);

    const selectedTaxRate = CategoryUtils.getCategoryDefaultTaxRate(policy?.rules?.expenseRules ?? [], categoryName, policy?.taxRates?.defaultExternalID);

    const textForDefault = useCallback(
        (taxID: string, taxRate: TaxRate) => CategoryUtils.formatDefaultTaxRateText(translate, taxID, taxRate, policy?.taxRates),
        [policy?.taxRates, translate],
    );

    const taxesList = useMemo<ListItem[]>(() => {
        if (!policy) {
            return [];
        }
        return Object.entries(policy.taxRates?.taxes ?? {})
            .map(([key, value]) => ({
                text: textForDefault(key, value),
                keyForList: key,
                isSelected: key === selectedTaxRate,
                isDisabled: value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                pendingAction: value.pendingAction ?? (Object.keys(value.pendingFields ?? {}).length > 0 ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : null),
            }))
            .sort((a, b) => (a.text ?? a.keyForList ?? '').localeCompare(b.text ?? b.keyForList ?? ''));
    }, [policy, selectedTaxRate, textForDefault]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={CategoryDefaultTaxRatePage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.categoryRules.defaultTaxRate')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName))}
                />
                <SelectionList
                    sections={[{data: taxesList}]}
                    ListItem={RadioListItem}
                    onSelectRow={(item) => {
                        if (!item.keyForList) {
                            return;
                        }

                        if (item.keyForList === selectedTaxRate) {
                            Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName));
                            return;
                        }

                        Category.setPolicyCategoryTax(policyID, categoryName, item.keyForList);
                        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)));
                    }}
                    shouldSingleExecuteRowSelect
                    containerStyle={[styles.pt3]}
                    initiallyFocusedOptionKey={selectedTaxRate}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CategoryDefaultTaxRatePage.displayName = 'CategoryDefaultTaxRatePage';

export default CategoryDefaultTaxRatePage;
