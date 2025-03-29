import React, {useCallback} from 'react';
import {Keyboard} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceCategoryForm';
import type {PolicyCategories} from '@src/types/onyx';

type CategoryFormProps = {
    /** All policy categories */
    policyCategories: OnyxEntry<PolicyCategories>;

    /** The name of the category */
    categoryName?: string;

    /** Function to call when the form is submitted */
    onSubmit: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => void;

    /** Function to validate the edited values of the form */
    validateEdit?: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>;
};

function CategoryForm({onSubmit, policyCategories, categoryName, validateEdit}: CategoryFormProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM> = {};
            const newCategoryName = values.categoryName.trim();

            if (!isRequiredFulfilled(newCategoryName)) {
                errors.categoryName = translate('workspace.categories.categoryRequiredError');
            } else if (policyCategories?.[newCategoryName]) {
                errors.categoryName = translate('workspace.categories.existingCategoryError');
            } else if (newCategoryName === CONST.INVALID_CATEGORY_NAME) {
                errors.categoryName = translate('workspace.categories.invalidCategoryName');
            } else if ([...newCategoryName].length > CONST.API_TRANSACTION_CATEGORY_MAX_LENGTH) {
                // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16 code units.
                addErrorMessage(
                    errors,
                    'categoryName',
                    translate('common.error.characterLimitExceedCounter', {length: [...newCategoryName].length, limit: CONST.API_TRANSACTION_CATEGORY_MAX_LENGTH}),
                );
            }

            return errors;
        },
        [policyCategories, translate],
    );

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            Keyboard.dismiss();
            onSubmit(values);
        },
        [onSubmit],
    );

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM}
            onSubmit={submit}
            submitButtonText={translate('common.save')}
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            validate={validateEdit || validate}
            style={[styles.mh5, styles.flex1]}
            enabledWhenOffline
        >
            <InputWrapper
                ref={inputCallbackRef}
                InputComponent={TextInput}
                defaultValue={categoryName}
                label={translate('common.name')}
                accessibilityLabel={translate('common.name')}
                inputID={INPUT_IDS.CATEGORY_NAME}
                role={CONST.ROLE.PRESENTATION}
            />
        </FormProvider>
    );
}

CategoryForm.displayName = 'CategoryForm';

export default CategoryForm;
