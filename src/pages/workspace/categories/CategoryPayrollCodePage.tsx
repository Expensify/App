import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setPolicyCategoryPayrollCode} from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceCategoryForm';

type EditCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_PAYROLL_CODE>;

function CategoryPayrollCodePage({route}: EditCategoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const backTo = route.params.backTo;
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const categoryName = route.params.categoryName;
    const payrollCode = policyCategories?.[categoryName]?.['Payroll Code'];
    const {inputCallbackRef} = useAutoFocusInput();
    const isQuickSettingsFlow = !!backTo;

    const editPayrollCode = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            const newPayrollCode = values.payrollCode.trim();
            if (newPayrollCode !== payrollCode) {
                setPolicyCategoryPayrollCode(policyID, categoryName, newPayrollCode);
            }
            Navigation.goBack(
                isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORY_SETTINGS.getRoute(policyID, categoryName, backTo) : ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName),
            );
        },
        [categoryName, payrollCode, policyID, isQuickSettingsFlow, backTo],
    );

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM> = {};
            const value = values[INPUT_IDS.PAYROLL_CODE];

            if (value.length > CONST.MAX_LENGTH_256) {
                errors[INPUT_IDS.PAYROLL_CODE] = translate('common.error.characterLimitExceedCounter', {
                    length: value.length,
                    limit: CONST.MAX_LENGTH_256,
                });
            }

            return errors;
        },
        [translate],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                style={[styles.defaultModalContainer]}
                testID={CategoryPayrollCodePage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.categories.payrollCode')}
                    onBackButtonPress={() =>
                        Navigation.goBack(
                            isQuickSettingsFlow
                                ? ROUTES.SETTINGS_CATEGORY_SETTINGS.getRoute(route.params.policyID, categoryName, backTo)
                                : ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(route.params.policyID, categoryName),
                        )
                    }
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM}
                    validate={validate}
                    onSubmit={editPayrollCode}
                    submitButtonText={translate('common.save')}
                    style={[styles.mh5, styles.flex1]}
                    enabledWhenOffline
                >
                    <InputWrapper
                        ref={inputCallbackRef}
                        InputComponent={TextInput}
                        defaultValue={payrollCode}
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

export default CategoryPayrollCodePage;
