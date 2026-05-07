import React, {useCallback} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setPolicyCategoryGLCode} from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceCategoryForm';

type DynamicCategoryGLCodePageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_GL_CODE>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_GL_CODE>;

function DynamicCategoryGLCodePage({route}: DynamicCategoryGLCodePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const backTo = 'backTo' in route.params ? route.params.backTo : undefined;
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const categoryName = route.params.categoryName;
    const glCode = policyCategories?.[categoryName]?.['GL Code'];
    const {inputCallbackRef} = useAutoFocusInput();
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_GL_CODE;
    const backPath = createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(categoryName), ROUTES.WORKSPACE_INITIAL.getRoute(policyID));

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM> = {};
            const value = values[INPUT_IDS.GL_CODE];

            if (value.length > CONST.MAX_LENGTH_256) {
                errors[INPUT_IDS.GL_CODE] = translate('common.error.characterLimitExceedCounter', value.length, CONST.MAX_LENGTH_256);
            }

            return errors;
        },
        [translate],
    );

    const editGLCode = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            const newGLCode = values.glCode.trim();
            if (newGLCode !== glCode) {
                setPolicyCategoryGLCode(policyID, categoryName, newGLCode, policyCategories);
            }
            Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORY_SETTINGS.getRoute(policyID, categoryName, backTo) : backPath);
        },
        [glCode, isQuickSettingsFlow, policyID, categoryName, backTo, policyCategories, backPath],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="DynamicCategoryGLCodePage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.categories.glCode')}
                    onBackButtonPress={() =>
                        Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORY_SETTINGS.getRoute(route.params.policyID, route.params.categoryName, backTo) : backPath)
                    }
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM}
                    validate={validate}
                    onSubmit={editGLCode}
                    submitButtonText={translate('common.save')}
                    style={[styles.mh5, styles.flex1]}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <InputWrapper
                        ref={inputCallbackRef}
                        InputComponent={TextInput}
                        defaultValue={glCode}
                        label={translate('workspace.categories.glCode')}
                        accessibilityLabel={translate('workspace.categories.glCode')}
                        inputID={INPUT_IDS.GL_CODE}
                        role={CONST.ROLE.PRESENTATION}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicCategoryGLCodePage;
