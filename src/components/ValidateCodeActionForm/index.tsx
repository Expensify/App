import React, {forwardRef, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Text from '@components/Text';
import ValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm';
import type {ValidateCodeFormHandle} from '@components/ValidateCodeActionModal/ValidateCodeForm/BaseValidateCodeForm';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ValidateCodeActionFormProps} from './type';

function ValidateCodeActionForm({
    descriptionPrimary,
    descriptionSecondary,
    validatePendingAction,
    validateError,
    handleSubmitForm,
    clearError,
    sendValidateCode,
    hasMagicCodeBeenSent,
    isLoading,
    submitButtonText,
    forwardedRef,
    shouldSkipInitialValidation,
}: ValidateCodeActionFormProps) {
    const themeStyles = useThemeStyles();

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);

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
            <Text style={[themeStyles.mb3]}>{descriptionPrimary}</Text>
            {!!descriptionSecondary && <Text style={[themeStyles.mb3]}>{descriptionSecondary}</Text>}
            <ValidateCodeForm
                isLoading={isLoading}
                validateCodeAction={validateCodeAction}
                validatePendingAction={validatePendingAction}
                validateError={validateError}
                handleSubmitForm={handleSubmitForm}
                sendValidateCode={sendValidateCode}
                clearError={clearError}
                buttonStyles={[themeStyles.justifyContentEnd, themeStyles.flex1]}
                ref={forwardedRef}
                hasMagicCodeBeenSent={hasMagicCodeBeenSent}
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
