import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import Icon from '@components/Icon';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';

import useDelayedAutoFocus from '@hooks/useDelayedAutoFocus';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFieldRequiredErrors, isValidRegistrationNumber} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';

import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';

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

type RegistrationNumberStepPropsWidened = Omit<RegistrationNumberStepProps<keyof OnyxFormValuesMapping>, never>;

/**
 * Non-generic implementation so OXC's React Compiler can memoize the component.
 * OXC bails on type params inside components ("Unsupported declaration type for hoisting").
 */
function RegistrationNumberStepImpl({formID, onSubmit, inputID, defaultValue, isEditing, country, shouldDelayAutoFocus = false}: RegistrationNumberStepPropsWidened) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['QuestionMark']);
    const internalInputRef = useRef<AnimatedTextInputRef>(null);
    useDelayedAutoFocus(internalInputRef, shouldDelayAutoFocus);

    const helpLink = useMemo(() => {
        return CONST.REGISTRATION_NUMBER_HELP_URL[country as keyof typeof CONST.REGISTRATION_NUMBER_HELP_URL] ?? CONST.REGISTRATION_NUMBER_HELP_URL.EU;
    }, [country]);

    const validate = useCallback(
        (values: FormOnyxValues<keyof OnyxFormValuesMapping>): FormInputErrors<keyof OnyxFormValuesMapping> => {
            const errors = getFieldRequiredErrors(values, [inputID], translate);

            const registrationNumber = (values as Record<string, unknown>)[inputID as string] as string;
            if (registrationNumber && !isValidRegistrationNumber(registrationNumber, country)) {
                (errors as Record<string, string>)[inputID as string] = translate('businessInfoStep.error.registrationNumber');
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
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('businessInfoStep.whatsTheBusinessRegistrationNumber', country)}</Text>
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
                forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
            />
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt6]}>
                <Icon
                    src={icons.QuestionMark}
                    width={12}
                    height={12}
                    fill={theme.icon}
                />
                <View style={[styles.ml2, styles.dFlex, styles.flexRow]}>
                    <TextLink
                        style={[styles.textMicro]}
                        href={helpLink}
                    >
                        {translate('businessInfoStep.whatsThisNumber')}
                    </TextLink>
                </View>
            </View>
        </FormProvider>
    );
}

function RegistrationNumberStep<TFormID extends keyof OnyxFormValuesMapping>(props: RegistrationNumberStepProps<TFormID>) {
    return <RegistrationNumberStepImpl {...(props as unknown as RegistrationNumberStepPropsWidened)} />;
}

export default RegistrationNumberStep;
