import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import Icon from './Icon';
import * as Illustrations from './Icon/Illustrations';
import Image from './Image';

type PlaidCardFeedIconProps = {
    plaidUrl: string;
    style?: StyleProp<ViewStyle>;
    isLarge?: boolean;
};

function PlaidCardFeedIcon({plaidUrl, style, isLarge}: PlaidCardFeedIconProps) {
    const styles = useThemeStyles();
    return (
        <View style={[style]}>
            <Image
                source={{uri: plaidUrl}}
                style={isLarge ? styles.plaidIcon : styles.plaidIconSmall}
                cachePolicy="memory-disk"
            />
            <Icon
                src={isLarge ? Illustrations.PlaidCompanyCardDetailLarge : Illustrations.PlaidCompanyCardDetail}
                height={isLarge ? variables.cardPreviewHeight : variables.cardIconHeight}
                width={isLarge ? variables.cardPreviewWidth : variables.cardIconWidth}
            />
        </View>
    );
}

export default PlaidCardFeedIcon;
