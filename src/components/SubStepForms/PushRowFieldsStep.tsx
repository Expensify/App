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

import React, {useCallback} from 'react';

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

type PushRowFieldWidened = {
    inputID: FormOnyxKeys<keyof OnyxFormValuesMapping>;
    defaultValue: string;
    options: Record<string, string>;
    description: string;
    modalHeaderTitle: string;
    searchInputTitle: string;
};

type PushRowFieldsStepPropsWidened = Omit<PushRowFieldsStepProps<keyof OnyxFormValuesMapping>, 'pushRowFields'> & {
    pushRowFields: PushRowFieldWidened[];
};

/**
 * Non-generic implementation so OXC's React Compiler can memoize the component.
 * OXC bails on type params inside components ("Unsupported declaration type for hoisting").
 */
function PushRowFieldsStepImpl({formID, formTitle, pushRowFields, onSubmit, isEditing}: PushRowFieldsStepPropsWidened) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const pushRowFieldsIDs = pushRowFields.map((field) => field.inputID);

    const validate = useCallback(
        (values: FormOnyxValues<keyof OnyxFormValuesMapping>): FormInputErrors<keyof OnyxFormValuesMapping> => {
            return getFieldRequiredErrors(values, pushRowFieldsIDs, translate);
        },
        [pushRowFieldsIDs, translate],
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
            {pushRowFields.map((pushRowField: PushRowFieldWidened) => (
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

function PushRowFieldsStep<TFormID extends keyof OnyxFormValuesMapping>(props: PushRowFieldsStepProps<TFormID>) {
    return <PushRowFieldsStepImpl {...(props as unknown as PushRowFieldsStepPropsWidened)} />;
}

export default PushRowFieldsStep;
