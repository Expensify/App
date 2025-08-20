import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle} from 'react-native';
import Icon from '@components/Icon';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';
import TextWithTooltip from '@components/TextWithTooltip';

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
        <View style={[styles.flexRow, styles.flexShrink1, styles.gap1]}>
        <Icon
            src={icon}
            fill={theme.icon}
            height={12}
            width={12}
        />
        <TextWithTooltip
            text={text}
            shouldShowTooltip={showTooltip}
            style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter, styles.textMicro, styles.textSupporting, styles.flexShrink1, textStyle]}
        />
    </View>
    );
}
