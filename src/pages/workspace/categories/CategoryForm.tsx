import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getCategoryNameError, getCategoryNameErrorMessage, getDecodedCategoryName} from '@libs/CategoryUtils';
import {addErrorMessage} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceCategoryForm';
import type {PolicyCategories} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useCallback} from 'react';
import {Keyboard} from 'react-native';

type CategoryFormProps = {
    policyCategories: OnyxEntry<PolicyCategories>;
    categoryName?: string;
    onSubmit: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => void;
    validateEdit?: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>;

    /** Whether to add bottom safe area padding to the form. Should be false when the parent wrapper already handles it. */
    addBottomSafeAreaPadding?: boolean;
};

function CategoryForm({onSubmit, policyCategories, categoryName, validateEdit, addBottomSafeAreaPadding = true}: CategoryFormProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const decodedCategoryName = getDecodedCategoryName(categoryName ?? '');

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM> = {};
            const nameError = getCategoryNameError(policyCategories, values.categoryName);

            if (nameError) {
                addErrorMessage(errors, 'categoryName', getCategoryNameErrorMessage(translate, nameError, values.categoryName));
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
            shouldHideFixErrorsAlert
            addBottomSafeAreaPadding={addBottomSafeAreaPadding}
        >
            <InputWrapper
                ref={inputCallbackRef}
                InputComponent={TextInput}
                defaultValue={decodedCategoryName}
                label={translate('common.name')}
                accessibilityLabel={translate('common.name')}
                inputID={INPUT_IDS.CATEGORY_NAME}
                role={CONST.ROLE.PRESENTATION}
            />
        </FormProvider>
    );
}

export default CategoryForm;
