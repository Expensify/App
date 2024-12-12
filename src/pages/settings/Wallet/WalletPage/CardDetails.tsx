import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import PressableWithDelayToggle from '@components/Pressable/PressableWithDelayToggle';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PrivatePersonalDetails} from '@src/types/onyx';

const defaultPrivatePersonalDetails: PrivatePersonalDetails = {
    addresses: [
        {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: '',
        },
    ],
};

type CardDetailsOnyxProps = {
    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
};

type CardDetailsProps = CardDetailsOnyxProps & {
    /** Card number */
    pan?: string;

    /** Card expiration date */
    expiration?: string;

    /** 3 digit code */
    cvv?: string;

    /** Domain name */
    domain: string;
};

function CardDetails({pan = '', expiration = '', cvv = '', privatePersonalDetails, domain}: CardDetailsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const handleCopyToClipboard = () => {
        Clipboard.setString(pan);
    };

    return (
        <>
            <MenuItemWithTopDescription
                description={translate('cardPage.cardDetails.cardNumber')}
                title={pan}
                shouldShowRightComponent
                rightComponent={
                    <View style={styles.justifyContentCenter}>
                        <PressableWithDelayToggle
                            tooltipText={translate('reportActionContextMenu.copyToClipboard')}
                            tooltipTextChecked={translate('reportActionContextMenu.copied')}
                            icon={Expensicons.Copy}
                            onPress={handleCopyToClipboard}
                            accessible={false}
                            text=""
                        />
                    </View>
                }
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={translate('cardPage.cardDetails.expiration')}
                title={expiration}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={translate('cardPage.cardDetails.cvv')}
                title={cvv}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={translate('cardPage.cardDetails.address')}
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                title={PersonalDetailsUtils.getFormattedAddress(privatePersonalDetails || defaultPrivatePersonalDetails)}
                interactive={false}
            />
            <TextLink
                style={[styles.link, styles.mh5, styles.mb3]}
                onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_DIGITAL_DETAILS_UPDATE_ADDRESS.getRoute(domain))}
            >
                {translate('cardPage.cardDetails.updateAddress')}
            </TextLink>
        </>
    );
}

CardDetails.displayName = 'CardDetails';

export default withOnyx<CardDetailsProps, CardDetailsOnyxProps>({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
})(CardDetails);
