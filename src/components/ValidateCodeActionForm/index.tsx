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
    forwardedRef,
}: ValidateCodeActionFormProps) {
    const themeStyles = useThemeStyles();
    const isInitialized = useRef(false);
    const isClosedRef = useRef(false);

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);

    useEffect(
        () => () => {
            isInitialized.current = false;
            isClosedRef.current = true;
        },
        [],
    );

    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            sendValidateCode();
        }
        // eslint-disable-next-line rulesdir/prefer-early-return
        return () => {
            // We need to run clearError in cleanup function to use as onClose function.
            // As 'useEffect cleanup function' runs whenever a dependency is called, we need to put clearError() in the if condition.
            // So clearError() will not run when the form is unmounted.
            if (isClosedRef.current) {
                clearError();
            }
        };
    }, [sendValidateCode, clearError]);

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
