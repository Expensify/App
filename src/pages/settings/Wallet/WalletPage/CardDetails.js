import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import MenuItemWithTopDescription from '../../../../components/MenuItemWithTopDescription';
import Clipboard from '../../../../libs/Clipboard';
import useLocalize from '../../../../hooks/useLocalize';
import Text from '../../../../components/Text';
import styles from '../../../../styles/styles';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import usePrivatePersonalDetails from '../../../../hooks/usePrivatePersonalDetails';
import ONYXKEYS from '../../../../ONYXKEYS';

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

function CardDetails({pan, expiration, cvv, privatePersonalDetails}) {
    usePrivatePersonalDetails();
    const privateDetails = privatePersonalDetails || {};
    const address = privateDetails.address || {};
    const {translate} = useLocalize();

    /**
     * Applies common formatting to each piece of an address
     *
     * @param {String} piece
     * @returns {String}
     */
    const formatPiece = (piece) => (piece ? `${piece}, ` : '');

    /**
     * Formats an address object into an easily readable string
     *
     * @returns {String}
     */
    const formattedAddress = useMemo(() => {
        const [street1, street2] = (address.street || '').split('\n');
        const formatted = formatPiece(street1) + formatPiece(street2) + formatPiece(address.city) + formatPiece(address.state) + formatPiece(address.zip) + formatPiece(address.country);

        // Remove the last comma of the address
        return formatted.trim().replace(/,$/, '');
    }, [address.city, address.country, address.state, address.street, address.zip]);

    const handleCopyToClipboard = () => {
        Clipboard.setString(pan);
    };

    const handleNavigateToEditAddress = () => {
        Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_ADDRESS);
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
                title={formattedAddress}
                interactive={false}
                wrapperStyle={styles.pb1}
            />
            <Text
                style={[styles.mh5, styles.link, styles.mb3]}
                onPress={handleNavigateToEditAddress}
            >
                Update address
            </Text>
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
