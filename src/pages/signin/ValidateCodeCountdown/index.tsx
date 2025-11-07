
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import CONST from '@src/CONST';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ValidateCodeCountdownHandle, ValidateCodeCountdownProps} from './types';

const ValidateCodeCountdown = forwardRef<ValidateCodeCountdownHandle, ValidateCodeCountdownProps>(
({shouldDisableResendValidateCode, hasError, isOffline, onResendValidateCode}, ref) => {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();

    const {translate} = useLocalize();

    const [timeRemaining, setTimeRemaining] = useState(CONST.REQUEST_CODE_DELAY as number);
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useImperativeHandle(ref, () => ({
        resetCountdown: () => setTimeRemaining(CONST.REQUEST_CODE_DELAY as number),
    }));

    useEffect(() => {
        if (timeRemaining > 0) {
            timerRef.current = setTimeout(() => {
                setTimeRemaining((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            clearTimeout(timerRef.current);
        };
    }, [timeRemaining]);

    return (
        <View style={[styles.alignItemsStart]}>
        {timeRemaining > 0 && !isOffline ? (
            <View style={[styles.mt2, styles.flexRow, styles.renderHTML]}>
                <RenderHTML
                    html={translate('validateCodeForm.requestNewCode', {
                        timeRemaining: `00:${String(timeRemaining).padStart(2, '0')}`,
                    })}
                />
            </View>
        ) : (
            <PressableWithFeedback
                style={[styles.mt2]}
                onPress={onResendValidateCode}
                disabled={shouldDisableResendValidateCode}
                hoverDimmingValue={1}
                pressDimmingValue={0.2}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('validateCodeForm.magicCodeNotReceived')}
            >
                <Text style={[StyleUtils.getDisabledLinkStyles(shouldDisableResendValidateCode)]}>
                    {hasError ? translate('validateCodeForm.requestNewCodeAfterErrorOccurred') : translate('validateCodeForm.magicCodeNotReceived')}
                </Text>
            </PressableWithFeedback>
        )}
    </View>
    );
});


export default ValidateCodeCountdown;