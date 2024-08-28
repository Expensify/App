import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Category from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const policy = usePolicy(policyID);
    const defaultExternalID = policy?.taxRates?.defaultExternalID;
    const foreignTaxDefault = policy?.taxRates?.foreignTaxDefault;

    const {inputCallbackRef} = useAutoFocusInput();

    const textForDefault = useCallback(
        (taxID: string, taxRate: TaxRate): string => {
            let suffix;
            if (taxID === defaultExternalID && taxID === foreignTaxDefault) {
                suffix = translate('common.default');
            } else if (taxID === defaultExternalID) {
                suffix = translate('workspace.taxes.workspaceDefault');
            } else if (taxID === foreignTaxDefault) {
                suffix = translate('workspace.taxes.foreignDefault');
            }
            return `${taxRate.name} ${CONST.DOT_SEPARATOR} ${taxRate.value}${suffix ? ` ${CONST.DOT_SEPARATOR} ${suffix}` : ``}`;
        },
        [defaultExternalID, foreignTaxDefault, translate],
    );

    const taxesList = useMemo<ListItem[]>(() => {
        if (!policy) {
            return [];
        }
        return Object.entries(policy.taxRates?.taxes ?? {})
            .map(([key, value]) => ({
                text: textForDefault(key, value),
                keyForList: key,
                isSelected: false,
                isDisabled: value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                pendingAction: value.pendingAction ?? (Object.keys(value.pendingFields ?? {}).length > 0 ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : null),
            }))
            .sort((a, b) => (a.text ?? a.keyForList ?? '').localeCompare(b.text ?? b.keyForList ?? ''));
    }, [policy, textForDefault]);

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
                    title={translate('workspace.categories.defaultTaxRate')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName))}
                />
                <SelectionList
                    sections={[{data: taxesList}]}
                    ListItem={RadioListItem}
                    onSelectRow={(item) => {
                        if (!item.keyForList) {
                            return;
                        }
                        Category.setPolicyCategoryTax(policyID, categoryName, item.keyForList);
                        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)));
                    }}
                    shouldSingleExecuteRowSelect
                    containerStyle={[styles.pt3]}
                    // initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CategoryDefaultTaxRatePage.displayName = 'CategoryDefaultTaxRatePage';

export default CategoryDefaultTaxRatePage;
