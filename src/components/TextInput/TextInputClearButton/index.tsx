import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type TextInputClearButtonProps = {
    style?: StyleProp<ViewStyle>;
    onPressButton: () => void;
};

function TextInputClearButton({style, onPressButton}: TextInputClearButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <Tooltip text={translate('common.clear')}>
            <PressableWithoutFeedback
                style={[styles.mt4, styles.mh1, style]}
                accessibilityRole={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('common.clear')}
                onMouseDown={(e) => {
                    e.preventDefault();
                }}
                onPress={onPressButton}
                shouldUseAutoHitSlop
            >
                <Icon
                    src={Expensicons.Clear}
                    width={20}
                    height={20}
                    fill={theme.icon}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default TextInputClearButton;
