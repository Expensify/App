import React from 'react';
import {useOnyx} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getFormattedAddress} from '@libs/PersonalDetailsUtils';
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

type CardDetailsProps = {
    /** Card number */
    pan?: string;

    /** Card expiration date */
    expiration?: string;

    /** 3 digit code */
    cvv?: string;

    /** Domain name */
    domain: string;
};

function CardDetails({pan = '', expiration = '', cvv = '', domain}: CardDetailsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);

    return (
        <>
            {pan?.length > 0 && (
                <MenuItemWithTopDescription
                    description={translate('cardPage.cardDetails.cardNumber')}
                    title={pan}
                    interactive={false}
                    copyValue={pan}
                />
            )}
            {expiration?.length > 0 && (
                <MenuItemWithTopDescription
                    description={translate('cardPage.cardDetails.expiration')}
                    title={expiration}
                    interactive={false}
                />
            )}
            {cvv?.length > 0 && (
                <MenuItemWithTopDescription
                    description={translate('cardPage.cardDetails.cvv')}
                    title={cvv}
                    interactive={false}
                />
            )}
            {pan?.length > 0 && (
                <>
                    <MenuItemWithTopDescription
                        description={translate('cardPage.cardDetails.address')}
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        title={getFormattedAddress(privatePersonalDetails || defaultPrivatePersonalDetails)}
                        interactive={false}
                    />
                    <TextLink
                        style={[styles.link, styles.mh5, styles.mb3]}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_DIGITAL_DETAILS_UPDATE_ADDRESS.getRoute(domain))}
                    >
                        {translate('cardPage.cardDetails.updateAddress')}
                    </TextLink>
                </>
            )}
        </>
    );
}

CardDetails.displayName = 'CardDetails';

export default CardDetails;
