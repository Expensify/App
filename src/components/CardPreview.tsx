import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import ExpensifyCardImage from '@assets/images/expensify-card.svg';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PrivatePersonalDetails, Session} from '@src/types/onyx';
import ImageSVG from './ImageSVG';
import Text from './Text';

type CardPreviewOnyxProps = {
    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type CardPreviewProps = CardPreviewOnyxProps;

function CardPreview({privatePersonalDetails, session}: CardPreviewProps) {
    const styles = useThemeStyles();
    const {legalFirstName, legalLastName} = privatePersonalDetails ?? {};
    const cardHolder = legalFirstName && legalLastName ? `${legalFirstName} ${legalLastName}` : session?.email ?? '';

    return (
        <View style={styles.walletCard}>
            <ImageSVG
                contentFit="contain"
                src={ExpensifyCardImage}
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

export default withOnyx<CardPreviewProps, CardPreviewOnyxProps>({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(CardPreview);
