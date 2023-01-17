import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ROUTES from '../../../../ROUTES';
import Text from '../../../../components/Text';
import styles from '../../../../styles/styles';
import Navigation from '../../../../libs/Navigation/Navigation';
import compose from '../../../../libs/compose';
import MenuItemWithTopDescription from '../../../../components/MenuItemWithTopDescription';
import * as PersonalDetails from '../../../../libs/actions/PersonalDetails';
import { withOnyx } from 'react-native-onyx';
import ONYXKEYS from '../../../../ONYXKEYS';

const propTypes = {
    /* Onyx Props */

    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        legalFirstName: PropTypes.string,
        legalLastName: PropTypes.string,
        dateOfBirth: PropTypes.string,

        /** User's home address */
        address: PropTypes.shape({
            street: PropTypes.string,
            city: PropTypes.string,
            state: PropTypes.string,
            zip: PropTypes.string,
            country: PropTypes.string,
        }),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    privatePersonalDetails: {
        legalFirstName: '',
        legalLastName: '',
        dateOfBirth: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: '',
        },
    },
};

const PersonalDetailsInitialPage = (props) => {
    PersonalDetails.openPersonalDetailsPage();

    const privateDetails = props.privatePersonalDetails || {};
    const legalName = `${privateDetails.legalFirstName || ''} ${privateDetails.legalLastName || ''}`.trim();

    /**
     * Applies common formatting to each piece of an address
     *
     * @param {String} piece
     * @returns {String}
     */
    const formatPiece = (piece) => {
        return piece ? `${piece}, ` : '';
    }

    /**
     * Formats an address object into a string
     *
     * @param {Object} address
     * @param {String} address.street
     * @param {String} address.city
     * @param {String} address.state
     * @param {String} address.zip
     * @param {String} address.country
     * @returns {String}
     */
    const formatAddress = (address = {}) => {
        const formattedAddress = formatPiece(address.street)
            + formatPiece(address.city)
            + formatPiece(address.state)
            + formatPiece(address.zip)
            + formatPiece(address.country);

        // Remove the last comma of the address
        return formattedAddress.replace(/,$/, '').trim();
    }

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('personalDetailsPages.personalDetails')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <View style={styles.flex1}>
                <View style={[styles.ph5, styles.mb5]}>
                    <Text>
                        {props.translate('personalDetailsPages.privateDataMessage')}
                    </Text>
                </View>
                <MenuItemWithTopDescription
                    title={legalName}
                    description={props.translate('personalDetailsPages.legalName')}
                    shouldShowRightIcon
                    wrapperStyle={[styles.ph2]}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_LEGAL_NAME)}
                />
                <MenuItemWithTopDescription
                    title={privateDetails.dateOfBirth || ''}
                    description={props.translate('personalDetailsPages.dateOfBirth')}
                    shouldShowRightIcon
                    wrapperStyle={[styles.ph2]}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH)}
                />
                <MenuItemWithTopDescription
                    title={formatAddress(privateDetails.address)}
                    description={props.translate('personalDetailsPages.homeAddress')}
                    shouldShowRightIcon
                    wrapperStyle={[styles.ph2]}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_ADDRESS)}
                />
            </View>
        </ScreenWrapper>
    );
}

PersonalDetailsInitialPage.propTypes = propTypes;
PersonalDetailsInitialPage.defaultProps = defaultProps;
PersonalDetailsInitialPage.displayName = 'PersonalDetailsInitialPage';

export default compose(
    withLocalize,
    withOnyx({
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
    }),
)(PersonalDetailsInitialPage);
