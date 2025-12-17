import React, {useCallback} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import PushRowWithModal from '@components/PushRowWithModal';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';

type PushRowField<TFormID extends keyof OnyxFormValuesMapping> = {
    inputID: FormOnyxKeys<TFormID>;
    defaultValue: string;
    options: Record<string, string>;
    description: string;
    modalHeaderTitle: string;
    searchInputTitle: string;
};

type PushRowFieldsStepProps<TFormID extends keyof OnyxFormValuesMapping> = SubStepProps & {
    /** The ID of the form */
    formID: TFormID;

    /** Title of the form */
    formTitle: string;

    /** A function to call when the form is submitted */
    onSubmit: (values: FormOnyxValues<TFormID>) => void;

    pushRowFields: Array<PushRowField<TFormID>>;
};

function PushRowFieldsStep<TFormID extends keyof OnyxFormValuesMapping>({formID, formTitle, pushRowFields, onSubmit, isEditing}: PushRowFieldsStepProps<TFormID>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const pushRowFieldsIDs = pushRowFields.map((field) => field.inputID);

    const validate = useCallback(
        (values: FormOnyxValues<TFormID>): FormInputErrors<TFormID> => {
            return getFieldRequiredErrors(values, pushRowFieldsIDs);
        },
        [pushRowFieldsIDs],
    );

    return (
        <FormProvider
            formID={formID}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={onSubmit}
            style={[styles.flexGrow1]}
            submitButtonStyles={[styles.mh5]}
            validate={validate}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mh5, styles.mb3]}>{formTitle}</Text>
            {pushRowFields.map((pushRowField: PushRowField<TFormID>) => (
                <InputWrapper
                    key={pushRowField.inputID as string}
                    InputComponent={PushRowWithModal}
                    optionsList={pushRowField.options}
                    description={pushRowField.description}
                    modalHeaderTitle={pushRowField.modalHeaderTitle}
                    searchInputTitle={pushRowField.searchInputTitle}
                    inputID={pushRowField.inputID as string}
                    shouldSaveDraft={!isEditing}
                    defaultValue={pushRowField.defaultValue}
                />
            ))}
        </FormProvider>
    );
}

export default PushRowFieldsStep;
