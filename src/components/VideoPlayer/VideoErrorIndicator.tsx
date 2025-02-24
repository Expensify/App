import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

function VideoErrorIndicator() {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter, styles.pAbsolute, styles.h100, styles.w100, styles.highlightBG]}>
            <Icon
                fill={theme.activeComponentBG}
                src={Expensicons.VideoSlash}
                width={variables.iconSizeSuperLarge}
                height={variables.iconSizeSuperLarge}
            />
        </View>
    );
}

VideoErrorIndicator.displayName = 'VideoErrorIndicator';

export default VideoErrorIndicator;
