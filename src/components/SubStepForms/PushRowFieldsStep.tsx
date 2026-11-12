import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import PushRowWithModal from '@components/PushRowWithModal';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';

type PushRowField<TFormID extends keyof OnyxFormValuesMapping> = {
    inputID: FormOnyxKeys<TFormID>;
    defaultValue: string;
    options: Record<string, string>;
    description: string;
    modalHeaderTitle: string;
    searchInputTitle: string;
    sentryLabel?: SentryLabel;
};

type PushRowFieldsStepProps<TFormID extends keyof OnyxFormValuesMapping> = SubPageProps & {
    formID: TFormID;
    formTitle: string;
    submitButtonText?: string;
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
    sentryLabel?: SentryLabel;
};

type PushRowFieldsStepPropsWidened = Omit<PushRowFieldsStepProps<keyof OnyxFormValuesMapping>, 'pushRowFields'> & {
    pushRowFields: PushRowFieldWidened[];
};

/**
 * Non-generic implementation so OXC's React Compiler can memoize the component.
 * OXC bails on type params inside components ("Unsupported declaration type for hoisting").
 */
function PushRowFieldsStepImpl({formID, formTitle, submitButtonText, pushRowFields, onSubmit, isEditing}: PushRowFieldsStepPropsWidened) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const pushRowFieldsIDs = pushRowFields.map((field) => field.inputID);

    const validate = (values: FormOnyxValues<keyof OnyxFormValuesMapping>): FormInputErrors<keyof OnyxFormValuesMapping> => {
        return getFieldRequiredErrors(values, pushRowFieldsIDs, translate);
    };

    return (
        <FormProvider
            formID={formID}
            submitButtonText={submitButtonText ?? translate(isEditing ? 'common.confirm' : 'common.next')}
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
                    sentryLabel={pushRowField.sentryLabel}
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
