import React, {useCallback} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {renamePolicyCategory} from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import CategoryForm from './CategoryForm';

type DynamicEditCategoryPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_EDIT>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_CATEGORIES.DYNAMIC_SETTINGS_CATEGORY_EDIT>;

function DynamicEditCategoryPage({route}: DynamicEditCategoryPageProps) {
    const {policyID, categoryName: currentCategoryName} = route.params;
    const policyData = usePolicyData(policyID);
    const {categories: policyCategories} = policyData;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_CATEGORIES.DYNAMIC_SETTINGS_CATEGORY_EDIT;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.SETTINGS_CATEGORY_EDIT.path);
    const workspaceCategorySettingsPath = createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(currentCategoryName), ROUTES.WORKSPACE_INITIAL.getRoute(policyID));

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM> = {};
            const newCategoryName = values.categoryName.trim();

            if (!newCategoryName) {
                errors.categoryName = translate('workspace.categories.categoryRequiredError');
            } else if (policyCategories?.[newCategoryName] && currentCategoryName !== newCategoryName) {
                errors.categoryName = translate('workspace.categories.existingCategoryError');
            } else if ([...newCategoryName].length > CONST.API_TRANSACTION_CATEGORY_MAX_LENGTH) {
                // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16 code units.
                errors.categoryName = translate('common.error.characterLimitExceedCounter', [...newCategoryName].length, CONST.API_TRANSACTION_CATEGORY_MAX_LENGTH);
            }
            return errors;
        },
        [policyCategories, currentCategoryName, translate],
    );

    const editCategory = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            const newCategoryName = values.categoryName.trim();
            // Do not call the API if the edited category name is the same as the current category name
            if (currentCategoryName !== newCategoryName) {
                renamePolicyCategory(policyData, {oldName: currentCategoryName, newName: values.categoryName});
            }

            // Ensure Onyx.update is executed before navigation to prevent UI blinking issues, affecting the category name and rate.
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.goBack(isQuickSettingsFlow ? backPath : workspaceCategorySettingsPath, {compareParams: false});
            });
        },
        [currentCategoryName, policyData, isQuickSettingsFlow, backPath, workspaceCategorySettingsPath],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="DynamicEditCategoryPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.categories.editCategory')}
                    onBackButtonPress={() => Navigation.goBack(isQuickSettingsFlow ? backPath : workspaceCategorySettingsPath)}
                />
                <CategoryForm
                    onSubmit={editCategory}
                    validateEdit={validate}
                    categoryName={currentCategoryName}
                    policyCategories={policyCategories}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicEditCategoryPage;
