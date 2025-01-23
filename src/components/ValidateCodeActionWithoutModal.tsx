import React, {forwardRef, useEffect, useRef} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import Text from './Text';
import type {ValidateCodeActionModalProps} from './ValidateCodeActionModal/type';
import ValidateCodeForm from './ValidateCodeActionModal/ValidateCodeForm';
import type {ValidateCodeFormHandle} from './ValidateCodeActionModal/ValidateCodeForm/BaseValidateCodeForm';

type ValidateCodeActionWithoutModalProps = {
    forwardedRef: ForwardedRef<ValidateCodeFormHandle>;
};

type ValidateCodeActionProps = ValidateCodeActionModalProps & ValidateCodeActionWithoutModalProps;

function ValidateCodeActionWithoutModal({
    isVisible,
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

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);

    useEffect(
        () => () => {
            clearError();
            firstRenderRef.current = true;
        },
        [clearError],
    );

    useEffect(() => {
        if (!firstRenderRef.current || !isVisible || hasMagicCodeBeenSent) {
            return;
        }
        firstRenderRef.current = false;
        sendValidateCode();
    }, [isVisible, sendValidateCode, hasMagicCodeBeenSent]);

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

ValidateCodeActionWithoutModal.displayName = 'ValidateCodeActionWithoutModal';

export default forwardRef<ValidateCodeFormHandle, ValidateCodeActionProps>((props, ref) => (
    <ValidateCodeActionWithoutModal
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
