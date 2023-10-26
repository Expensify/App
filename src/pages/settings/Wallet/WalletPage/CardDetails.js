import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import MenuItemWithTopDescription from '../../../../components/MenuItemWithTopDescription';
import Clipboard from '../../../../libs/Clipboard';
import useLocalize from '../../../../hooks/useLocalize';
import usePrivatePersonalDetails from '../../../../hooks/usePrivatePersonalDetails';
import ONYXKEYS from '../../../../ONYXKEYS';
import * as PersonalDetailsUtils from '../../../../libs/PersonalDetailsUtils';
import PressableWithDelayToggle from '../../../../components/Pressable/PressableWithDelayToggle';
import styles from '../../../../styles/styles';
import TextLink from '../../../../components/TextLink';
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

    /** Domain name */
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
                title={PersonalDetailsUtils.getFormattedAddress(privatePersonalDetails)}
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
CardDetails.propTypes = propTypes;
CardDetails.defaultProps = defaultProps;

export default withOnyx({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
})(CardDetails);
