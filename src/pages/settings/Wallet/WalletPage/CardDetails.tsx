import React from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getFormattedAddress} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
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

type CardDetailsProps = Omit<PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DOMAIN_CARD>, 'navigation'> & {
    /** Card number */
    pan?: string;

    /** Card expiration date */
    expiration?: string;

    /** 3 digit code */
    cvv?: string;

    /** Domain name */
    domain: string;

    /** Card ID */
    cardID: number;
};

function CardDetails({pan = '', expiration = '', cvv = '', domain, cardID, route}: CardDetailsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});

    return (
        <View fsClass={CONST.FULLSTORY.CLASS.MASK}>
            {pan?.length > 0 && (
                <MenuItemWithTopDescription
                    description={translate('cardPage.cardDetails.cardNumber')}
                    title={pan}
                    interactive={false}
                    copyValue={pan}
                    copyable
                />
            )}
            {expiration?.length > 0 && (
                <MenuItemWithTopDescription
                    description={translate('cardPage.cardDetails.expiration')}
                    title={expiration}
                    interactive={false}
                    copyable
                />
            )}
            {cvv?.length > 0 && (
                <MenuItemWithTopDescription
                    description={translate('cardPage.cardDetails.cvv')}
                    title={cvv}
                    interactive={false}
                    copyable
                />
            )}
            {pan?.length > 0 && (
                <>
                    <MenuItemWithTopDescription
                        description={translate('cardPage.cardDetails.address')}
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        title={getFormattedAddress(privatePersonalDetails || defaultPrivatePersonalDetails)}
                        interactive={false}
                        copyable
                    />
                    <TextLink
                        style={[styles.link, styles.mh5, styles.mb3]}
                        onPress={() => {
                            if (route.name === SCREENS.SETTINGS.WALLET.DOMAIN_CARD) {
                                Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_DIGITAL_DETAILS_UPDATE_ADDRESS.getRoute(domain));
                                return;
                            }
                            Navigation.navigate(ROUTES.SETTINGS_DOMAIN_CARD_UPDATE_ADDRESS.getRoute(cardID.toString()));
                        }}
                    >
                        {translate('cardPage.cardDetails.updateAddress')}
                    </TextLink>
                </>
            )}
        </View>
    );
}

CardDetails.displayName = 'CardDetails';

export default CardDetails;
