import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {Keyboard} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@libs/Navigation/Navigation';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type SCREENS from '@src/SCREENS';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import INPUT_IDS from '@src/types/form/WorkspaceCategoryCreateForm';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as Policy from '@userActions/Policy';

type CreateCategoryPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_CREATE>;

function CreateCategoryPage({route}: CreateCategoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_CREATE>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_CREATE> = {};
        const categoryName = values.categoryName.trim();

        if (!ValidationUtils.isRequiredFulfilled(categoryName)) {
            errors.categoryName = 'workspace.categories.categoryRequiredError';
        } else if ([...categoryName].length > CONST.TITLE_CHARACTER_LIMIT) {
            // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16
            // code units.
            ErrorUtils.addErrorMessage(errors, 'categoryName', ['common.error.characterLimitExceedCounter', {length: [...categoryName].length, limit: CONST.TITLE_CHARACTER_LIMIT}]);
        }

        return errors;
    }, []);

    const createCategory = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_CREATE>) => {
        Policy.createPolicyCategory(route.params.policyID, values.categoryName.trim());
        Keyboard.dismiss();
        Navigation.goBack();
    }

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
                        formID={ONYXKEYS.FORMS.WORKSPACE_CATEGORY_CREATE}
                        onSubmit={createCategory}
                        submitButtonText={translate('common.save')}
                        validate={validate}
                        style={[styles.mh5, styles.flex1]}
                    >
                        <InputWrapper
                            InputComponent={TextInput}
                            maxLength={100}
                            label={translate('common.name')}
                            accessibilityLabel={translate('common.name')}
                            inputID={INPUT_IDS.CATEGORY_NAME}
                            role={CONST.ROLE.PRESENTATION}
                        />
                    </FormProvider>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

CreateCategoryPage.displayName = 'CreateCategoryPage';

export default CreateCategoryPage;
