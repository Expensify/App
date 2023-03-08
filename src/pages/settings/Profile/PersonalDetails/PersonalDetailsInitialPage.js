import React from 'react';
import PropTypes from 'prop-types';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
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
import ONYXKEYS from '../../../../ONYXKEYS';

const propTypes = {
    /* Onyx Props */

    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        legalFirstName: PropTypes.string,
        legalLastName: PropTypes.string,
        dob: PropTypes.string,

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
        dob: '',
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

const PersonalDetailsInitialPage = (props) => {
    PersonalDetails.openPersonalDetailsPage();

    const privateDetails = props.privatePersonalDetails || {};
    const address = privateDetails.address || {};
    const legalName = `${privateDetails.legalFirstName || ''} ${privateDetails.legalLastName || ''}`.trim();

    /**
     * Applies common formatting to each piece of an address
     *
     * @param {String} piece
     * @returns {String}
     */
    const formatPiece = piece => (piece ? `${piece}, ` : '');

    /**
     * Formats an address object into an easily readable string
     *
     * @returns {String}
     */
    const getFormattedAddress = () => {
        const [street1, street2] = (address.street || '').split('\n');
        const formattedAddress = formatPiece(street1)
            + formatPiece(street2)
            + formatPiece(address.city)
            + formatPiece(address.state)
            + formatPiece(address.zip)
            + formatPiece(address.country);

        // Remove the last comma of the address
        return formattedAddress.trim().replace(/,$/, '');
    };

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('privatePersonalDetails.personalDetails')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView>
                <View style={styles.flex1}>
                    <View style={[styles.ph5, styles.mb5]}>
                        <Text>
                            {props.translate('privatePersonalDetails.privateDataMessage')}
                        </Text>
                    </View>
                    <MenuItemWithTopDescription
                        title={legalName}
                        description={props.translate('privatePersonalDetails.legalName')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_LEGAL_NAME)}
                    />
                    <MenuItemWithTopDescription
                        title={privateDetails.dob || ''}
                        description={props.translate('common.dob')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH)}
                    />
                    <MenuItemWithTopDescription
                        title={getFormattedAddress()}
                        description={props.translate('privatePersonalDetails.homeAddress')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_ADDRESS)}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

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
