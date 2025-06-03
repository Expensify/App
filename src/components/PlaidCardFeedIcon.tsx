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
};

function PlaidCardFeedIcon({plaidUrl, style}: PlaidCardFeedIconProps) {
    const styles = useThemeStyles();
    return (
        <View style={[style]}>
            <Image
                source={{uri: plaidUrl}}
                style={styles.plaidIconSmall}
                cachePolicy="memory-disk"
            />
            <Icon
                src={Illustrations.PlaidCompanyCardDetail}
                height={variables.cardIconHeight}
                width={variables.cardIconWidth}
            />
        </View>
    );
}

export default PlaidCardFeedIcon;
