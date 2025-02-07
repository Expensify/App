import React, {forwardRef, useEffect, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Text from '@components/Text';
import ValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm';
import type {ValidateCodeFormHandle} from '@components/ValidateCodeActionModal/ValidateCodeForm/BaseValidateCodeForm';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ValidateCodeActionFormProps} from './type';

function ValidateCodeActionForm({
    isValidated,
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
    const firstRenderRef = useRef(true);
    const isClosedRef = useRef(false);

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);

    const [canSendHasMagicCodeBeenSent, setCanSendHasMagicCodeBeenSent] = useState(false);

    useEffect(
        () => () => {
            firstRenderRef.current = true;
            isClosedRef.current = true;
        },
        [],
    );

    useEffect(() => {
        if (!firstRenderRef.current || hasMagicCodeBeenSent) {
            // eslint-disable-next-line rulesdir/prefer-early-return
            return () => {
                if (isClosedRef.current && !isValidated) {
                    clearError();
                }
            };
        }
        firstRenderRef.current = false;
        sendValidateCode();
        if (hasMagicCodeBeenSent) {
            InteractionManager.runAfterInteractions(() => {
                setCanSendHasMagicCodeBeenSent(true);
            });
        }
    }, [isValidated, sendValidateCode, hasMagicCodeBeenSent, clearError]);

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
                hasMagicCodeBeenSent={canSendHasMagicCodeBeenSent}
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
