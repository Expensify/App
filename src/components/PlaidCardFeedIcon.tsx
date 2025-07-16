import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useTheme from '@hooks/useTheme';
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
    const theme = useTheme();
    const width = isLarge ? variables.cardPreviewWidth : variables.cardIconWidth;
    const height = isLarge ? variables.cardPreviewHeight : variables.cardIconHeight;
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!plaidUrl) {
            return;
        }
        setIsBrokenImage(false);
        setLoading(true);
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
                        onLoadEnd={() => setLoading(false)}
                    />
                    {loading ? (
                        <View style={[styles.justifyContentCenter, {width, height}]}>
                            <ActivityIndicator
                                color={theme.spinner}
                                size={20}
                            />
                        </View>
                    ) : (
                        <Icon
                            src={isLarge ? Illustrations.PlaidCompanyCardDetailLarge : Illustrations.PlaidCompanyCardDetail}
                            height={height}
                            width={width}
                        />
                    )}
                </>
            )}
        </View>
    );
}

export default PlaidCardFeedIcon;
