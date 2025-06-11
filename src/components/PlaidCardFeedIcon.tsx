import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
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
    const [isBrokenImage, setIsBrokenImage] = useState<boolean>(false);
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const width = isLarge ? variables.cardPreviewWidth : variables.cardIconWidth;
    const height = isLarge ? variables.cardPreviewHeight : variables.cardIconHeight;

    useEffect(() => {
        if (!plaidUrl) {
            return;
        }
        setIsBrokenImage(false);
    }, [plaidUrl]);

    return (
        <View style={[style]}>
            {isBrokenImage ? (
                <Icon
                    src={illustrations.GenericCompanyCardLarge}
                    height={height}
                    width={width}
                    additionalStyles={styles.cardIcon}
                />
            ) : (
                <>
                    <Image
                        source={{uri: plaidUrl}}
                        style={isLarge ? styles.plaidIcon : styles.plaidIconSmall}
                        cachePolicy="memory-disk"
                        onError={() => setIsBrokenImage(true)}
                    />
                    <Icon
                        src={isLarge ? Illustrations.PlaidCompanyCardDetailLarge : Illustrations.PlaidCompanyCardDetail}
                        height={height}
                        width={width}
                    />
                </>
            )}
        </View>
    );
}

export default PlaidCardFeedIcon;
