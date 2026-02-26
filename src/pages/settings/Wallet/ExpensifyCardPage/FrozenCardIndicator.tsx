import React, {useMemo} from 'react';
import type {ViewStyle} from 'react-native';
import cardScarf from '@assets/images/card-scarf.svg';
import CardPreview from '@components/CardPreview';
import FrozenCardHeader from '@components/FrozenCardHeader';
import variables from '@styles/variables';

type FrozenCardIndicatorProps = {
    cardID: string;
    onUnfreezePress: () => void;
};

function FrozenCardIndicator({cardID, onUnfreezePress}: FrozenCardIndicatorProps) {
    const scarfOverlayStyle = useMemo<ViewStyle>(
        () => ({
            top: 0,
            left: (variables.cardPreviewWidth - variables.cardScarfOverlayWidth) / 2,
            zIndex: variables.cardScarfOverlayZIndex,
            width: variables.cardScarfOverlayWidth,
            height: variables.cardScarfOverlayHeight,
        }),
        [],
    );

    return (
        <FrozenCardHeader
            cardID={cardID}
            onUnfreezePress={onUnfreezePress}
            cardPreview={
                <CardPreview
                    overlayImage={cardScarf}
                    overlayContainerStyle={scarfOverlayStyle}
                />
            }
        />
    );
}

export default FrozenCardIndicator;
