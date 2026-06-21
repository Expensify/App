import React from 'react';
import {View} from 'react-native';
import ImageSVG from '@components/ImageSVG';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type BannerFit = 'contain' | 'cover';

type BannerProps = {
    src: IconAsset;
    fit?: BannerFit;
};

function Banner({src, fit = 'contain'}: BannerProps) {
    const styles = useThemeStyles();
    return (
        <View>
            <ImageSVG
                contentFit={fit}
                src={src}
                height={CONST.CONFIRM_CONTENT_SVG_SIZE.HEIGHT}
                width={fit === 'cover' ? '100%' : CONST.CONFIRM_CONTENT_SVG_SIZE.WIDTH}
                preserveAspectRatio={fit === 'cover' ? 'xMidYMid slice' : undefined}
                style={styles.alignSelfCenter}
            />
        </View>
    );
}

export default Banner;
export type {BannerProps, BannerFit};
