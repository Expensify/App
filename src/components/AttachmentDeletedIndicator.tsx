import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';

type AttachmentOfflineIndicatorProps = {
    /** Any additional styles to apply */
    containerStyles?: StyleProp<ViewStyle>;
};

function AttachmentDeletedIndicator({containerStyles}: AttachmentOfflineIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    if (!isOffline) {
        return null;
    }

    return (
        <>
            <View
                style={[styles.pAbsolute, styles.alignItemsCenter, styles.justifyContentCenter, styles.highlightBG, styles.deletedIndicatorOverlay, styles.deletedIndicator, containerStyles]}
            />
            <View style={[styles.pAbsolute, styles.deletedIndicator, styles.alignItemsCenter, styles.justifyContentCenter, containerStyles]}>
                <Icon
                    fill={theme.icon}
                    src={Expensicons.Trashcan}
                    width={variables.iconSizeSuperLarge}
                    height={variables.iconSizeSuperLarge}
                />
            </View>
        </>
    );
}

AttachmentDeletedIndicator.displayName = 'AttachmentDeletedIndicator';

export default AttachmentDeletedIndicator;
