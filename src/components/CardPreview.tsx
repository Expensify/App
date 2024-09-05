import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import ExpensifyCardImage from '@assets/images/expensify-card.svg';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PrivatePersonalDetails, Session} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
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

export default function CardPreviewOnyx(props: Omit<CardPreviewProps, keyof CardPreviewOnyxProps>) {
    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [session, sessionMetadata] = useOnyx(ONYXKEYS.SESSION);

    if (isLoadingOnyxValue(privatePersonalDetailsMetadata, sessionMetadata)) {
        return null;
    }

    return (
        <CardPreview
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            privatePersonalDetails={privatePersonalDetails}
            session={session}
        />
    );
}
