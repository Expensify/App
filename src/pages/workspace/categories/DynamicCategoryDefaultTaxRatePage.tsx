import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {formatDefaultTaxRateText, getCategoryDefaultTaxRate} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {setPolicyCategoryTax} from '@userActions/Policy/Category';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {TaxRate} from '@src/types/onyx';

import React, {useCallback, useMemo} from 'react';

type DynamicCategoryDefaultTaxRatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_DEFAULT_TAX_RATE>;

type TaxRateListItem = ListItem & {
    value: string;
};

function DynamicCategoryDefaultTaxRatePage({
    route: {
        params: {policyID, categoryName},
    },
}: DynamicCategoryDefaultTaxRatePageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const policy = usePolicy(policyID);
    const categorySettingsBackPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_DEFAULT_TAX_RATE.path);

    const selectedTaxRate = getCategoryDefaultTaxRate(policy?.rules?.expenseRules ?? [], categoryName, policy?.taxRates?.defaultExternalID);
    const initialSelectedTaxRate = useInitialSelection(selectedTaxRate, {resetOnFocus: true});

    const textForDefault = useCallback((taxID: string, taxRate: TaxRate) => formatDefaultTaxRateText(translate, taxID, taxRate, policy?.taxRates), [policy?.taxRates, translate]);

    const taxesList = useMemo<TaxRateListItem[]>(() => {
        if (!policy) {
            return [];
        }
        return Object.entries(policy.taxRates?.taxes ?? {})
            .map(([key, value]) => ({
                text: textForDefault(key, value),
                value: key,
                keyForList: key,
                isSelected: key === selectedTaxRate,
                isDisabled: value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                pendingAction: value.pendingAction ?? (Object.keys(value.pendingFields ?? {}).length > 0 ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : null),
            }))
            .sort((a, b) => localeCompare(a.text ?? a.keyForList ?? '', b.text ?? b.keyForList ?? ''));
    }, [policy, selectedTaxRate, textForDefault, localeCompare]);
    const orderedTaxesList = useMemo(() => moveInitialSelectionToTop(taxesList, initialSelectedTaxRate ? [initialSelectedTaxRate] : []), [taxesList, initialSelectedTaxRate]);

    const handleSelectRow = useCallback(
        (item: TaxRateListItem) => {
            if (!item.keyForList) {
                return;
            }

            if (item.keyForList === selectedTaxRate) {
                Navigation.goBack(categorySettingsBackPath);
                return;
            }

            setPolicyCategoryTax(policy, categoryName, item.keyForList);
            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(categorySettingsBackPath));
        },
        [policy, categoryName, selectedTaxRate, categorySettingsBackPath],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="DynamicCategoryDefaultTaxRatePage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.categoryRules.defaultTaxRate')}
                    onBackButtonPress={() => Navigation.goBack(categorySettingsBackPath)}
                />
                <SelectionList
                    data={orderedTaxesList}
                    ListItem={SingleSelectListItem}
                    onSelectRow={handleSelectRow}
                    shouldSingleExecuteRowSelect
                    addBottomSafeAreaPadding
                    initiallyFocusedItemKey={selectedTaxRate}
                    style={{containerStyle: styles.pt3}}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicCategoryDefaultTaxRatePage;
