import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import Icon from './Icon';

type AttachmentDeletedIndicatorProps = {
    /** Additional styles for container */
    containerStyles?: StyleProp<ViewStyle>;
};

function AttachmentDeletedIndicator({containerStyles}: AttachmentDeletedIndicatorProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
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
                    src={icons.Trashcan}
                    width={variables.iconSizeSuperLarge}
                    height={variables.iconSizeSuperLarge}
                />
            </View>
        </>
    );
}

export default AttachmentDeletedIndicator;
