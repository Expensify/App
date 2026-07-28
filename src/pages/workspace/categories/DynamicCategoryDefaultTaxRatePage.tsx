import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {formatDefaultTaxRateText, getCategoryDefaultTaxRate} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {setPolicyCategoryTax} from '@userActions/Policy/Category';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {TaxRate} from '@src/types/onyx';

import React, {useCallback, useMemo, useState} from 'react';

type DynamicCategoryDefaultTaxRatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_DEFAULT_TAX_RATE>;

function DynamicCategoryDefaultTaxRatePage({
    route: {
        params: {policyID, categoryName},
    },
}: DynamicCategoryDefaultTaxRatePageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const policy = usePolicy(policyID);
    const categorySettingsBackPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_DEFAULT_TAX_RATE.path);

    const persistedTaxRate = getCategoryDefaultTaxRate(policy?.rules?.expenseRules ?? [], categoryName, policy?.taxRates?.defaultExternalID);

    const [draftTaxRate, setDraftTaxRate] = useState<string>();
    const selectedTaxRate = draftTaxRate ?? persistedTaxRate;
    const hasChanges = !!selectedTaxRate && selectedTaxRate !== persistedTaxRate;

    const textForDefault = useCallback((taxID: string, taxRate: TaxRate) => formatDefaultTaxRateText(translate, taxID, taxRate, policy?.taxRates), [policy?.taxRates, translate]);

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
            .sort((a, b) => localeCompare(a.text ?? a.keyForList ?? '', b.text ?? b.keyForList ?? ''));
    }, [policy, selectedTaxRate, textForDefault, localeCompare]);

    const saveAndGoBack = () => {
        if (hasChanges) {
            setPolicyCategoryTax(policy, categoryName, selectedTaxRate);
            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(categorySettingsBackPath));
            return;
        }
        Navigation.goBack(categorySettingsBackPath);
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: saveAndGoBack,
        isDisabled: !hasChanges,
    };

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
                    data={taxesList}
                    ListItem={SingleSelectListItem}
                    onSelectRow={(item) => {
                        if (!item.keyForList) {
                            return;
                        }
                        setDraftTaxRate(item.keyForList);
                    }}
                    confirmButtonOptions={confirmButtonOptions}
                    shouldSingleExecuteRowSelect
                    addBottomSafeAreaPadding
                    initiallyFocusedItemKey={persistedTaxRate}
                    style={{containerStyle: styles.pt3}}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicCategoryDefaultTaxRatePage;
