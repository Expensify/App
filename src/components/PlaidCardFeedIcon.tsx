import React, {useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {useCompanyCardBankIcons, useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';
import ActivityIndicator from './ActivityIndicator';
import Icon from './Icon';
import Image from './Image';
import CardIconSkeleton from './Skeletons/CardIconSkeleton';

type PlaidCardFeedIconProps = {
    plaidUrl: string;
    style?: StyleProp<ViewStyle>;
    isLarge?: boolean;
    isSmall?: boolean;
    useSkeletonLoader?: boolean;
};

function PlaidCardFeedIcon({plaidUrl, style, isLarge, isSmall, useSkeletonLoader = false}: PlaidCardFeedIconProps) {
    const [brokenUrl, setBrokenUrl] = useState<string | null>(null);
    const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
    const isBrokenImage = brokenUrl === plaidUrl;
    const loading = loadedUrl !== plaidUrl && !isBrokenImage;
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const companyCardBankIcons = useCompanyCardBankIcons();
    const width = isLarge ? variables.cardPreviewWidth : variables.cardIconWidth;
    const height = isLarge ? variables.cardPreviewHeight : variables.cardIconHeight;

    const plaidImageStyle = isLarge ? styles.plaidIcon : styles.plaidIconSmall;
    const iconWidth = isSmall ? variables.cardMiniatureWidth : width;
    const iconHeight = isSmall ? variables.cardMiniatureHeight : height;
    const plaidLoadedStyle = isSmall ? styles.plaidIconExtraSmall : plaidImageStyle;

    const reasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'PlaidCardFeedIcon',
        loading,
    };

    return (
        <View style={[style]}>
            {isBrokenImage ? (
                <Icon
                    src={illustrations.GenericCompanyCardLarge}
                    height={iconHeight}
                    width={iconWidth}
                    additionalStyles={isSmall ? styles.cardMiniature : styles.cardIcon}
                />
            ) : (
                <>
                    <Image
                        source={{uri: plaidUrl}}
                        style={plaidLoadedStyle}
                        cachePolicy="memory-disk"
                        onError={() => setBrokenUrl(plaidUrl)}
                        onLoadEnd={() => setLoadedUrl(plaidUrl)}
                    />
                    {loading && useSkeletonLoader && (
                        <CardIconSkeleton
                            width={iconWidth}
                            height={iconHeight}
                        />
                    )}
                    {loading && !useSkeletonLoader && (
                        <View style={[styles.justifyContentCenter, {width: iconWidth, height: iconHeight}]}>
                            <ActivityIndicator
                                size={isSmall ? 10 : 20}
                                reasonAttributes={reasonAttributes}
                            />
                        </View>
                    )}
                    {!loading && (
                        <Icon
                            src={isLarge ? companyCardFeedIcons.PlaidCompanyCardDetailLarge : companyCardBankIcons.PlaidCompanyCardDetail}
                            height={iconHeight}
                            width={iconWidth}
                            additionalStyles={isSmall && styles.cardMiniature}
                        />
                    )}
                </>
            )}
        </View>
    );
}

export default PlaidCardFeedIcon;
