import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';
import useDelayedAutoFocus from '@hooks/useDelayedAutoFocus';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors, isValidRegistrationNumber} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';

type RegistrationNumberStepProps<TFormID extends keyof OnyxFormValuesMapping> = SubStepProps & {
    /** The ID of the form */
    formID: TFormID;

    /** A function to call when the form is submitted */
    onSubmit: (values: FormOnyxValues<TFormID>) => void;

    /** The ID of the form input */
    inputID: FormOnyxKeys<TFormID>;

    /** The default values for the input */
    defaultValue: string;

    /** Country of affiliated policy */
    country: Country | '';

    /** Whether to delay autoFocus to avoid conflicts with navigation animations */
    shouldDelayAutoFocus?: boolean;
};

function RegistrationNumberStep<TFormID extends keyof OnyxFormValuesMapping>({
    formID,
    onSubmit,
    inputID,
    defaultValue,
    isEditing,
    country,
    shouldDelayAutoFocus = false,
}: RegistrationNumberStepProps<TFormID>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    const internalInputRef = useRef<AnimatedTextInputRef>(null);
    useDelayedAutoFocus(internalInputRef, shouldDelayAutoFocus);

    const validate = useCallback(
        (values: FormOnyxValues<TFormID>): FormInputErrors<TFormID> => {
            const errors = getFieldRequiredErrors(values, [inputID]);

            if (values[inputID] && !isValidRegistrationNumber(values[inputID] as string, country)) {
                errors[inputID] = translate('businessInfoStep.error.registrationNumber');
            }

            return errors;
        },
        [country, inputID, translate],
    );
    return (
        <FormProvider
            formID={formID}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={onSubmit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
            shouldHideFixErrorsAlert
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('businessInfoStep.whatsTheBusinessRegistrationNumber')}</Text>
            <InputWrapper
                InputComponent={TextInput}
                label={translate('businessInfoStep.registrationNumber')}
                aria-label={translate('businessInfoStep.registrationNumber')}
                role={CONST.ROLE.PRESENTATION}
                inputID={inputID as string}
                containerStyles={[styles.mt6]}
                defaultValue={defaultValue}
                shouldSaveDraft={!isEditing}
                autoFocus={!shouldDelayAutoFocus}
                ref={internalInputRef}
            />
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt6]}>
                <Icon
                    src={Expensicons.QuestionMark}
                    width={12}
                    height={12}
                    fill={theme.icon}
                />
                <View style={[styles.ml2, styles.dFlex, styles.flexRow]}>
                    <TextLink
                        style={[styles.textMicro]}
                        href={CONST.HELP_LINK_URL}
                    >
                        {translate('businessInfoStep.whatsThisNumber')}
                    </TextLink>
                </View>
            </View>
        </FormProvider>
    );
}

RegistrationNumberStep.displayName = 'RegistrationNumberStep';

export default RegistrationNumberStep;
