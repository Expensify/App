import React, {memo} from 'react';
import {View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

type MFAValidateCodeResendButtonProps = {
    shouldShowTimer: boolean;
    timeRemaining: number;
    shouldDisableResendCode: boolean;
    hasError: boolean;
    resendButtonText: TranslationPaths;
    onResendValidationCode: () => void;
};

function MFAValidateCodeResendButton({shouldShowTimer, timeRemaining, shouldDisableResendCode, hasError, resendButtonText, onResendValidationCode}: MFAValidateCodeResendButtonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    if (shouldShowTimer) {
        return (
            <View style={[styles.mt5, styles.flexRow, styles.renderHTML]}>
                <RenderHTML
                    html={translate('validateCodeForm.requestNewCode', {
                        timeRemaining: `00:${String(timeRemaining).padStart(2, '0')}`,
                    })}
                />
            </View>
        );
    }

    return (
        <PressableWithFeedback
            style={[styles.mt5]}
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
    );
}

MFAValidateCodeResendButton.displayName = 'MFAValidateCodeResendButton';

export default memo(MFAValidateCodeResendButton);
