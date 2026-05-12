import React, {useCallback, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import ValidateCodeCountdown from '@components/ValidateCodeCountdown';
import type {ValidateCodeCountdownHandle} from '@components/ValidateCodeCountdown/types';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

type MultifactorAuthenticationValidateCodeResendButtonHandle = {
    resetCountdown: () => void;
};

type MultifactorAuthenticationValidateCodeResendButtonProps = {
    ref?: React.Ref<MultifactorAuthenticationValidateCodeResendButtonHandle>;
    shouldDisableResendCode: boolean;
    hasError: boolean;
    resendButtonText: TranslationPaths;
    onResendValidationCode: () => void;
};

function MultifactorAuthenticationValidateCodeResendButton({
    ref,
    shouldDisableResendCode,
    hasError,
    resendButtonText,
    onResendValidationCode,
}: MultifactorAuthenticationValidateCodeResendButtonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const [isCountdownRunning, setIsCountdownRunning] = useState(true);
    const countdownRef = useRef<ValidateCodeCountdownHandle>(null);

    const handleCountdownFinish = useCallback(() => {
        setIsCountdownRunning(false);
    }, []);

    useImperativeHandle(ref, () => ({
        resetCountdown: () => {
            countdownRef.current?.resetCountdown();
            setIsCountdownRunning(true);
        },
    }));

    return (
        <View style={styles.alignItemsStart}>
            {isCountdownRunning && !isOffline ? (
                <View style={[styles.mt5, styles.flexRow, styles.renderHTML]}>
                    <ValidateCodeCountdown
                        ref={countdownRef}
                        onCountdownFinish={handleCountdownFinish}
                    />
                </View>
            ) : (
                <PressableWithFeedback
                    style={styles.mt5}
                    onPress={onResendValidationCode}
                    disabled={shouldDisableResendCode}
                    hoverDimmingValue={1}
                    pressDimmingValue={0.2}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate(resendButtonText)}
                >
                    <Text style={[StyleUtils.getDisabledLinkStyles(shouldDisableResendCode)]}>
                        {hasError ? translate('validateCodeForm.requestNewCodeAfterErrorOccurred') : translate(resendButtonText)}
                    </Text>
                </PressableWithFeedback>
            )}
        </View>
    );
}

MultifactorAuthenticationValidateCodeResendButton.displayName = 'MultifactorAuthenticationValidateCodeResendButton';

export default MultifactorAuthenticationValidateCodeResendButton;

export type {MultifactorAuthenticationValidateCodeResendButtonHandle};
