import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle} from 'react-native';
import Icon from '@components/Icon';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';

type TextWithIconCellProps = {
    icon: IconAsset;
    text?: string;
    showTooltip: boolean;
    textStyle?: StyleProp<TextStyle>;
};

export default function TextWithIconCell({icon, text, showTooltip, textStyle}: TextWithIconCellProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    if (!text) {
        return null;
    }

    return (
        <Tooltip
            shouldRender={showTooltip}
            text={text}
        >
            <View style={[styles.flexRow, styles.flexShrink1, styles.gap1]}>
                <Icon
                    src={icon}
                    fill={theme.icon}
                    height={12}
                    width={12}
                />
                <Text
                    numberOfLines={1}
                    style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter, styles.textMicro, styles.textSupporting, styles.flexShrink1, textStyle]}
                >
                    {text}
                </Text>
            </View>
        </Tooltip>
    );
}
