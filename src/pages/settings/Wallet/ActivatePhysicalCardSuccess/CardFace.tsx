/**
 * One side of the physical Expensify Card artwork on the activation success screen, drawn at the same size and with the
 * same rounded corners as CardPreview.
 */
import ExpensifyCardBack from '@assets/images/expensify-card-activation-back.svg';
import ExpensifyCardFront from '@assets/images/expensify-card-activation-front.svg';

import ImageSVG from '@components/ImageSVG';

import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

type CardFaceProps = {
    /** Which side of the card to draw */
    side: 'front' | 'back';
};

function CardFace({side}: CardFaceProps) {
    const styles = useThemeStyles();

    return (
        <View style={styles.walletCard}>
            <ImageSVG
                src={side === 'front' ? ExpensifyCardFront : ExpensifyCardBack}
                contentFit="contain"
                pointerEvents="none"
                width={variables.cardPreviewWidth}
                height={variables.cardPreviewHeight}
            />
        </View>
    );
}

export default CardFace;
