import React, {forwardRef, useEffect, useRef} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import ValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm';
import type {ValidateCodeFormHandle} from '@components/ValidateCodeActionModal/ValidateCodeForm/BaseValidateCodeForm';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ValidateCodeActionFormProps} from './type';

function ValidateCodeActionForm({
    descriptionPrimary,
    descriptionSecondary,
    descriptionPrimaryStyles,
    descriptionSecondaryStyles,
    validatePendingAction,
    validateError,
    hasMagicCodeBeenSent,
    handleSubmitForm,
    clearError,
    sendValidateCode,
    isLoading,
    submitButtonText,
    forwardedRef,
    shouldSkipInitialValidation,
}: ValidateCodeActionFormProps) {
    const themeStyles = useThemeStyles();
    const isUnmounted = useRef(false);

    useEffect(() => {
        if (!shouldSkipInitialValidation) {
            sendValidateCode();
        }

        return () => {
            isUnmounted.current = true;
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldSkipInitialValidation]);

    useEffect(() => {
        return () => {
            if (!isUnmounted.current) {
                return;
            }
            clearError();
        };
    }, [clearError]);

    return (
        <View style={[themeStyles.ph5, themeStyles.mt3, themeStyles.mb5, themeStyles.flex1]}>
            <Text style={[themeStyles.mb6, descriptionPrimaryStyles]}>{descriptionPrimary}</Text>
            {!!descriptionSecondary && <Text style={[themeStyles.mb6, descriptionSecondaryStyles]}>{descriptionSecondary}</Text>}
            <ValidateCodeForm
                isLoading={isLoading}
                hasMagicCodeBeenSent={hasMagicCodeBeenSent}
                validatePendingAction={validatePendingAction}
                validateCodeActionErrorField="validateLogin"
                validateError={validateError}
                handleSubmitForm={handleSubmitForm}
                sendValidateCode={sendValidateCode}
                clearError={clearError}
                buttonStyles={[themeStyles.justifyContentEnd, themeStyles.flex1]}
                ref={forwardedRef}
                submitButtonText={submitButtonText}
            />
        </View>
    );
}

ValidateCodeActionForm.displayName = 'ValidateCodeActionForm';

export default forwardRef<ValidateCodeFormHandle, ValidateCodeActionFormProps>((props, ref) => (
    <ValidateCodeActionForm
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
