import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceCategoryCreateForm';
import type {PolicyCategories} from '@src/types/onyx';

type WorkspaceCreateCategoryPageOnyxProps = {
    /** All policy categories */
    policyCategories: OnyxEntry<PolicyCategories>;
};

type CreateCategoryPageProps = WorkspaceCreateCategoryPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_CREATE>;

function CreateCategoryPage({route, policyCategories}: CreateCategoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_CREATE_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_CREATE_FORM> = {};
            const categoryName = values.categoryName.trim();

            if (!ValidationUtils.isRequiredFulfilled(categoryName)) {
                errors.categoryName = 'workspace.categories.categoryRequiredError';
            } else if (policyCategories?.[categoryName]) {
                errors.categoryName = 'workspace.categories.existingCategoryError';
            } else if (categoryName === CONST.INVALID_CATEGORY_NAME) {
                errors.categoryName = 'workspace.categories.invalidCategoryName';
            } else if ([...categoryName].length > CONST.CATEGORY_NAME_LIMIT) {
                // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16 code units.
                ErrorUtils.addErrorMessage(errors, 'categoryName', ['common.error.characterLimitExceedCounter', {length: [...categoryName].length, limit: CONST.CATEGORY_NAME_LIMIT}]);
            }

            return errors;
        },
        [policyCategories],
    );

    const createCategory = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_CREATE_FORM>) => {
            Policy.createPolicyCategory(route.params.policyID, values.categoryName.trim());
            Keyboard.dismiss();
            Navigation.goBack();
        },
        [route.params.policyID],
    );

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={CreateCategoryPage.displayName}
                >
                    <HeaderWithBackButton
                        title={translate('workspace.categories.addCategory')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <FormProvider
                        formID={ONYXKEYS.FORMS.WORKSPACE_CATEGORY_CREATE_FORM}
                        onSubmit={createCategory}
                        submitButtonText={translate('common.save')}
                        validate={validate}
                        style={[styles.mh5, styles.flex1]}
                        enabledWhenOffline
                    >
                        <InputWrapper
                            InputComponent={TextInput}
                            maxLength={CONST.CATEGORY_NAME_LIMIT}
                            label={translate('common.name')}
                            accessibilityLabel={translate('common.name')}
                            inputID={INPUT_IDS.CATEGORY_NAME}
                            role={CONST.ROLE.PRESENTATION}
                            autoFocus
                        />
                    </FormProvider>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

CreateCategoryPage.displayName = 'CreateCategoryPage';

export default withOnyx<CreateCategoryPageProps, WorkspaceCreateCategoryPageOnyxProps>({
    policyCategories: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route?.params?.policyID}`,
    },
})(CreateCategoryPage);
