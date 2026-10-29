import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import FormFieldGroup from '@components/Form/Layout/FormFieldGroup';
import FormHeader from '@components/Form/Layout/FormHeader';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import PatriotActLink from '@components/PatriotActLink';

import useLocalize from '@hooks/useLocalize';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import {getFieldRequiredErrors, isValidPastDate, meetsMaximumAgeRequirement, meetsMinimumAgeRequirement} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';

import {subYears} from 'date-fns';
import React from 'react';

type DateOfBirthStepProps<TFormID extends keyof OnyxFormValuesMapping> = SubPageProps &
    ForwardedFSClassProps & {
        formID: TFormID;
        formTitle: string;

        /** The validation function to call when the form is submitted */
        customValidate?: (values: FormOnyxValues<TFormID>) => FormInputErrors<TFormID>;

        onSubmit: (values: FormOnyxValues<TFormID>) => void;
        stepFields: Array<FormOnyxKeys<TFormID>>;
        dobInputID: string;

        /** The default value for the date of birth input */
        dobDefaultValue: string;

        footerComponent?: React.ReactNode;

        /** Whether to show the Patriot Act help link (EnablePayments-only) */
        shouldShowPatriotActLink?: boolean;
    };

type DateOfBirthStepPropsWidened = Omit<DateOfBirthStepProps<keyof OnyxFormValuesMapping>, never>;

/**
 * Non-generic implementation so OXC's React Compiler can memoize the component.
 * OXC bails on type params inside components ("Unsupported declaration type for hoisting").
 */
function DateOfBirthStepImpl({
    formID,
    formTitle,
    customValidate,
    onSubmit,
    stepFields,
    dobInputID,
    dobDefaultValue,
    isEditing,
    footerComponent,
    shouldShowPatriotActLink = false,
    forwardedFSClass,
}: DateOfBirthStepPropsWidened) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);

    const validate = (values: FormOnyxValues<keyof OnyxFormValuesMapping>): FormInputErrors<keyof OnyxFormValuesMapping> => {
        const errors = getFieldRequiredErrors(values, stepFields, translate);

        const valuesToValidate = (values as Record<string, unknown>)[dobInputID] as string;
        if (valuesToValidate) {
            if (!isValidPastDate(valuesToValidate) || !meetsMaximumAgeRequirement(valuesToValidate)) {
                // @ts-expect-error type mismatch to be fixed
                errors[dobInputID] = translate('bankAccount.error.dob');
            } else if (!meetsMinimumAgeRequirement(valuesToValidate)) {
                // @ts-expect-error type mismatch to be fixed
                errors[dobInputID] = translate('bankAccount.error.age');
            }
        }

        return errors;
    };

    return (
        <FormProvider
            formID={formID}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={customValidate ?? validate}
            onSubmit={onSubmit}
            style={[styles.mh5, styles.flexGrow2, styles.justifyContentBetween]}
            enabledWhenOffline
            shouldHideFixErrorsAlert
        >
            <FormHeader title={formTitle} />
            <InputWrapper
                InputComponent={DatePicker}
                inputID={dobInputID}
                label={translate('common.dob')}
                placeholder={translate('common.dateFormat')}
                defaultValue={dobDefaultValue}
                minDate={minDate}
                maxDate={maxDate}
                shouldSaveDraft={!isEditing}
                autoFocus
                forwardedFSClass={forwardedFSClass}
                autoComplete="birthdate-full"
            />
            {(!!footerComponent || shouldShowPatriotActLink) && (
                <FormFieldGroup>
                    {footerComponent}
                    {shouldShowPatriotActLink && <PatriotActLink />}
                </FormFieldGroup>
            )}
        </FormProvider>
    );
}

function DateOfBirthStep<TFormID extends keyof OnyxFormValuesMapping>(props: DateOfBirthStepProps<TFormID>) {
    return <DateOfBirthStepImpl {...(props as unknown as DateOfBirthStepPropsWidened)} />;
}

export default DateOfBirthStep;
