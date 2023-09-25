import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import MenuItemWithTopDescription from '../../../../components/MenuItemWithTopDescription';
import Clipboard from '../../../../libs/Clipboard';
import useLocalize from '../../../../hooks/useLocalize';
import usePrivatePersonalDetails from '../../../../hooks/usePrivatePersonalDetails';
import ONYXKEYS from '../../../../ONYXKEYS';
import TextLink from '../../../../components/TextLink';
import styles from '../../../../styles/styles';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';

const propTypes = {
    /** Card number */
    pan: PropTypes.string,

    /** Card expiration date */
    expiration: PropTypes.string,

    /** 3 digit code */
    cvv: PropTypes.string,

    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        /** User's home address */
        address: PropTypes.shape({
            street: PropTypes.string,
            city: PropTypes.string,
            state: PropTypes.string,
            zip: PropTypes.string,
            country: PropTypes.string,
        }),
    }),

    /** Domain of the card */
    domain: PropTypes.string.isRequired,
};

const defaultProps = {
    pan: '',
    expiration: '',
    cvv: '',
    privatePersonalDetails: {
        address: {
            street: '',
            street2: '',
            city: '',
            state: '',
            zip: '',
            country: '',
        },
    },
};

function CardDetails({pan, expiration, cvv, privatePersonalDetails, domain}) {
    usePrivatePersonalDetails();
    const privateDetails = privatePersonalDetails || {};
    const address = privateDetails.address || {};
    const {translate} = useLocalize();

    /**
     * Formats an address object into an easily readable string
     *
     * @returns {String}
     */
    const getFormattedAddress = () => {
        const [street1, street2] = (address.street || '').split('\n');
        const formatted = [street1, street2, address.city, address.state, address.zip, address.country].join(', ');

        // Remove the last comma of the address
        return formatted.trim().replace(/,$/, '');
    };

    const handleCopyToClipboard = () => {
        Clipboard.setString(pan);
    };

    return (
        <>
            <MenuItemWithTopDescription
                description={translate('walletPage.cardDetails.cardNumber')}
                title={pan}
                iconRight={Expensicons.Copy}
                shouldShowRightIcon
                interactive={false}
                onIconRightPress={handleCopyToClipboard}
                iconRightAccessibilityLabel={translate('walletPage.cardDetails.copyCardNumber')}
            />
            <MenuItemWithTopDescription
                description={translate('walletPage.cardDetails.expiration')}
                title={expiration}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={translate('walletPage.cardDetails.cvv')}
                title={cvv}
                interactive={false}
            />
            <MenuItemWithTopDescription
                description={translate('walletPage.cardDetails.address')}
                title={getFormattedAddress()}
                interactive={false}
            />
            <TextLink
                style={[styles.link, styles.mh5, styles.mb3]}
                onPress={() => Navigation.navigate(ROUTES.getSettingsWalletCardsDigitalDetailsUpdateAddressRoute(domain))}
            >
                {translate('walletPage.cardDetails.updateAddress')}
            </TextLink>
        </>
    );
}

CardDetails.displayName = 'CardDetails';
CardDetails.propTypes = propTypes;
CardDetails.defaultProps = defaultProps;

export default withOnyx({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
})(CardDetails);
