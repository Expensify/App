import React from 'react';
import {View} from 'react-native';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import ImageSVG from './ImageSVG';
import Text from './Text';

function CardPreview() {
    const styles = useThemeStyles();
    const lazyIllustrations = useMemoizedLazyIllustrations(['ExpensifyCardImage']);

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});

    const {legalFirstName, legalLastName} = privatePersonalDetails ?? {};
    const cardHolder = legalFirstName && legalLastName ? `${legalFirstName} ${legalLastName}` : (session?.email ?? '');

    return (
        <View style={styles.walletCard}>
            <ImageSVG
                contentFit="contain"
                src={lazyIllustrations.ExpensifyCardImage}
                pointerEvents="none"
                height={variables.cardPreviewHeight}
                width={variables.cardPreviewWidth}
            />
            <Text
                style={styles.walletCardHolder}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {cardHolder}
            </Text>
        </View>
    );
}

CardPreview.displayName = 'CardPreview';

export default CardPreview;
