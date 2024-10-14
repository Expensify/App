import type {StackScreenProps} from '@react-navigation/stack';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
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
import CategoryForm from './CategoryForm';

type EditCategoryPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_EDIT>;

function EditCategoryPage({route}: EditCategoryPageProps) {
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params.policyID}`);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentCategoryName = route.params.categoryName;
    const backTo = route.params?.backTo;
    const isQuickSettingsFlow = !isEmpty(backTo);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM> = {};
            const newCategoryName = values.categoryName.trim();

            if (!newCategoryName) {
                errors.categoryName = translate('workspace.categories.categoryRequiredError');
            } else if (policyCategories?.[newCategoryName] && currentCategoryName !== newCategoryName) {
                errors.categoryName = translate('workspace.categories.existingCategoryError');
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
                Category.renamePolicyCategory(route.params.policyID, {oldName: currentCategoryName, newName: values.categoryName});
            }
            Navigation.goBack(
                isQuickSettingsFlow
                    ? ROUTES.SETTINGS_CATEGORY_SETTINGS.getRoute(route.params.policyID, route.params.categoryName, backTo)
                    : ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(route.params.policyID, route.params.categoryName),
            );
        },
        [isQuickSettingsFlow, currentCategoryName, route.params.categoryName, route.params.policyID],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={EditCategoryPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.categories.editCategory')}
                    onBackButtonPress={() =>
                        Navigation.goBack(
                            isQuickSettingsFlow
                                ? ROUTES.SETTINGS_CATEGORY_SETTINGS.getRoute(route.params.policyID, route.params.categoryName, backTo)
                                : ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(route.params.policyID, route.params.categoryName),
                        )
                    }
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

EditCategoryPage.displayName = 'EditCategoryPage';

export default EditCategoryPage;
