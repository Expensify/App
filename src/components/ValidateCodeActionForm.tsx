import React, {forwardRef, useEffect, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {InteractionManager, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import Text from './Text';
import type {ValidateCodeActionModalProps} from './ValidateCodeActionModal/type';
import ValidateCodeForm from './ValidateCodeActionModal/ValidateCodeForm';
import type {ValidateCodeFormHandle} from './ValidateCodeActionModal/ValidateCodeForm/BaseValidateCodeForm';

type ValidateCodeActionFormProps = {
    /** Ref for validate code form */
    forwardedRef: ForwardedRef<ValidateCodeFormHandle>;
    isValidated: boolean;
};

type ValidateCodeActionProps = ValidateCodeActionModalProps & ValidateCodeActionFormProps;

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
}: ValidateCodeActionProps) {
    const themeStyles = useThemeStyles();
    const firstRenderRef = useRef(true);
    const isClosedRef = useRef(false);

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);

    const [canSendHasMagicCodeBeenSent, setCanSendHasMagicCodeBeenSent] = useState(false);
    const [shouldValidate, setShouldValidate] = useState(!isValidated);

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
		    console.log('shouldValidate,: ', shouldValidate)
                if (isClosedRef.current && shouldValidate) {
			console.log('clearError/////////////////////////')
                    clearError();
                }
            };
        }
        firstRenderRef.current = false;
        if (shouldValidate) {
		console.log('sendValidateCode****************************')
            sendValidateCode();
        }
        if (hasMagicCodeBeenSent) {
            InteractionManager.runAfterInteractions(() => {
                setCanSendHasMagicCodeBeenSent(true);
            });
        }
    }, [sendValidateCode, hasMagicCodeBeenSent, clearError]);

    if (shouldValidate) {
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
}

ValidateCodeActionForm.displayName = 'ValidateCodeActionForm';

export default forwardRef<ValidateCodeFormHandle, ValidateCodeActionProps>((props, ref) => (
    <ValidateCodeActionForm
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
