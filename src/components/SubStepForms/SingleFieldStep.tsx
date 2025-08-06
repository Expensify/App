import {useFocusEffect} from '@react-navigation/native';
import React, {forwardRef, useCallback, useRef} from 'react';
import type {InputModeOptions} from 'react-native';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import HelpLinks from '@pages/ReimbursementAccount/USD/Requestor/PersonalInfo/HelpLinks';
import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';

type SingleFieldStepProps<TFormID extends keyof OnyxFormValuesMapping> = SubStepProps & {
    /** The ID of the form */
    formID: TFormID;

    /** The title of the form */
    formTitle: string;

    /** The disclaimer to show below the form title */
    formDisclaimer?: string;

    /** The validation function to call when the form is submitted */
    validate: (values: FormOnyxValues<TFormID>) => FormInputErrors<TFormID>;

    /** A function to call when the form is submitted */
    onSubmit: (values: FormOnyxValues<TFormID>) => void;

    /** The ID of the form input */
    inputId: string;

    /** The label of the input */
    inputLabel: string;

    /** The mode of the input */
    inputMode?: InputModeOptions;

    /** The default values for the form */
    defaultValue: string;

    /** Whether to show help links */
    shouldShowHelpLinks?: boolean;

    /** Max length of the field */
    maxLength?: number;

    /** Should the submit button be enabled when offline */
    enabledWhenOffline?: boolean;

    /** Set the default value to the input if there is a valid saved value */
    shouldUseDefaultValue?: boolean;

    /** Should the input be disabled */
    disabled?: boolean;

    /** Placeholder displayed inside input */
    placeholder?: string;

    /** Whether to delay autoFocus to avoid conflicts with navigation animations */
    shouldDelayAutoFocus?: boolean;
};

function SingleFieldStep<TFormID extends keyof OnyxFormValuesMapping>({
    formID,
    formTitle,
    formDisclaimer,
    validate,
    onSubmit,
    inputId,
    inputLabel,
    inputMode,
    defaultValue,
    isEditing,
    shouldShowHelpLinks = true,
    maxLength,
    enabledWhenOffline,
    shouldUseDefaultValue = true,
    disabled = false,
    placeholder,
    shouldDelayAutoFocus = false,
}: SingleFieldStepProps<TFormID>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const internalInputRef = useRef<AnimatedTextInputRef>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useFocusEffect(
        useCallback(() => {
            if (!shouldDelayAutoFocus) {
                return;
            }

            focusTimeoutRef.current = setTimeout(() => {
                internalInputRef.current?.focus();
            }, CONST.ANIMATED_TRANSITION);

            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, [shouldDelayAutoFocus]),
    );

    return (
        <FormProvider
            formID={formID}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={onSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
            enabledWhenOffline={enabledWhenOffline}
            shouldHideFixErrorsAlert
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL]}>{formTitle}</Text>
                {!!formDisclaimer && <Text style={[styles.textSupporting, styles.mt3]}>{formDisclaimer}</Text>}
                <View style={[styles.flex1]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={inputId}
                        label={inputLabel}
                        aria-label={inputLabel}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={[styles.mt6]}
                        inputMode={inputMode}
                        defaultValue={defaultValue}
                        maxLength={maxLength}
                        shouldSaveDraft={!isEditing}
                        shouldUseDefaultValue={shouldUseDefaultValue}
                        disabled={disabled}
                        placeholder={placeholder}
                        autoFocus={!shouldDelayAutoFocus}
                        ref={internalInputRef}
                    />
                </View>
                {shouldShowHelpLinks && <HelpLinks containerStyles={[styles.mt5]} />}
            </View>
        </FormProvider>
    );
}

SingleFieldStep.displayName = 'SingleFieldStep';

export default forwardRef(SingleFieldStep);
