import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import PatriotActLink from '@components/PatriotActLink';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import {getFieldRequiredErrors, isValidPastDate, meetsMaximumAgeRequirement, meetsMinimumAgeRequirement} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';

import {subYears} from 'date-fns';
import React, {useCallback} from 'react';

type DateOfBirthStepProps<TFormID extends keyof OnyxFormValuesMapping> = SubPageProps &
    ForwardedFSClassProps & {
        /** The ID of the form */
        formID: TFormID;

        /** The title of the form */
        formTitle: string;

        /** The validation function to call when the form is submitted */
        customValidate?: (values: FormOnyxValues<TFormID>) => FormInputErrors<TFormID>;

        /** A function to call when the form is submitted */
        onSubmit: (values: FormOnyxValues<TFormID>) => void;

        /** Fields list of the form */
        stepFields: Array<FormOnyxKeys<TFormID>>;

        /** The ID of the date of birth input */
        dobInputID: string;

        /** The default value for the date of birth input */
        dobDefaultValue: string;

        /** Optional footer component */
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

    const validate = useCallback(
        (values: FormOnyxValues<keyof OnyxFormValuesMapping>): FormInputErrors<keyof OnyxFormValuesMapping> => {
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
        },
        [dobInputID, stepFields, translate],
    );

    return (
        <FormProvider
            formID={formID}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={customValidate ?? validate}
            onSubmit={onSubmit}
            style={[styles.mh5, styles.flexGrow2, styles.justifyContentBetween]}
            submitButtonStyles={[styles.mb0]}
            enabledWhenOffline
            shouldHideFixErrorsAlert
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb5]}>{formTitle}</Text>
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
            {footerComponent}
            {shouldShowPatriotActLink && <PatriotActLink containerStyles={[styles.mt2]} />}
        </FormProvider>
    );
}

function DateOfBirthStep<TFormID extends keyof OnyxFormValuesMapping>(props: DateOfBirthStepProps<TFormID>) {
    return <DateOfBirthStepImpl {...(props as unknown as DateOfBirthStepPropsWidened)} />;
}

export default DateOfBirthStep;
