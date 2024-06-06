import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
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
import INPUT_IDS from '@src/types/form/WorkspaceCategoryForm';
import type {PolicyCategories} from '@src/types/onyx';

type WorkspaceEditCategoryPayrollCodePageOnyxProps = {
    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<PolicyCategories>;
};

type EditCategoryPageProps = WorkspaceEditCategoryPayrollCodePageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_PAYROLL_CODE>;

function CategoryPayrollCodePage({route, policyCategories}: EditCategoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const categoryName = route.params.categoryName;
    const glCode = policyCategories?.[categoryName]?.payrollCode;
    const {inputCallbackRef} = useAutoFocusInput();

    const editGLCode = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            const newGLCode = values.payrollCode.trim();
            if (newGLCode !== glCode) {
                Category.setPolicyCategoryPayrollCode(route.params.policyID, categoryName, newGLCode);
            }
            Navigation.goBack();
        },
        [categoryName, glCode, route.params.policyID],
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
                testID={CategoryPayrollCodePage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.categories.payrollCode')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(route.params.policyID, route.params.categoryName))}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM}
                    onSubmit={editGLCode}
                    submitButtonText={translate('common.save')}
                    style={[styles.mh5, styles.flex1]}
                    enabledWhenOffline
                >
                    <InputWrapper
                        ref={inputCallbackRef}
                        InputComponent={TextInput}
                        defaultValue={glCode}
                        label={translate('workspace.categories.payrollCode')}
                        accessibilityLabel={translate('workspace.categories.payrollCode')}
                        inputID={INPUT_IDS.PAYROLL_CODE}
                        role={CONST.ROLE.PRESENTATION}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CategoryPayrollCodePage.displayName = 'CategoryPayrollCodePage';

export default withOnyx<EditCategoryPageProps, WorkspaceEditCategoryPayrollCodePageOnyxProps>({
    policyCategories: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route?.params?.policyID}`,
    },
})(CategoryPayrollCodePage);
