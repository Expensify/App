import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';

type AttachmentDeletedIndicatorProps = {
    /** Additional styles for container */
    containerStyles?: StyleProp<ViewStyle>;
};

function AttachmentDeletedIndicator({containerStyles}: AttachmentDeletedIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    if (!isOffline) {
        return null;
    }

    return (
        <>
            <View
                style={[
                    styles.pAbsolute,
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                    styles.highlightBG,
                    styles.deletedIndicatorOverlay,
                    styles.deletedAttachmentIndicator,
                    containerStyles,
                ]}
            />
            <View style={[styles.pAbsolute, styles.deletedAttachmentIndicator, styles.alignItemsCenter, styles.justifyContentCenter, containerStyles]}>
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
