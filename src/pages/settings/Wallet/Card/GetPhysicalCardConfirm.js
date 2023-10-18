import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '../../../../hooks/useLocalize';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import MenuItemWithTopDescription from '../../../../components/MenuItemWithTopDescription';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import ONYXKEYS from '../../../../ONYXKEYS';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import * as PersonalDetailsUtils from '../../../../libs/PersonalDetailsUtils';
import * as UserUtils from '../../../../libs/UserUtils';

const goToGetPhysicalCardName = (domain) => {
    Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_NAME.getRoute(domain));
};

const goToGetPhysicalCardPhone = (domain) => {
    Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_PHONE.getRoute(domain));
};

const goToGetPhysicalCardAddress = (domain) => {
    Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_ADDRESS.getRoute(domain));
};

const propTypes = {
    /* Onyx Props */
    loginList: PropTypes.shape({}),
    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        legalFirstName: PropTypes.string,
        legalLastName: PropTypes.string,
        phoneNumber: PropTypes.string,
        /** User's home address */
        address: PropTypes.shape({
            street: PropTypes.string,
            city: PropTypes.string,
            state: PropTypes.string,
            zip: PropTypes.string,
            country: PropTypes.string,
        }),
    }),

    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** domain passed via route /settings/wallet/card/:domain */
            domain: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    loginList: {},
    privatePersonalDetails: {
        legalFirstName: '',
        legalLastName: '',
        phoneNumber: null,
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: '',
        },
    },
};

function GetPhysicalCardConfirm({
    loginList,
    privatePersonalDetails,
    route: {
        params: {domain},
    },
}) {
    const {legalFirstName, legalLastName, phoneNumber} = privatePersonalDetails;
    const {translate} = useLocalize();

    return (
        <BaseGetPhysicalCard
            domain={domain}
            headline={translate('getPhysicalCard.confirmMessage')}
            isConfirmation
            submitButtonText={translate('getPhysicalCard.shipCard')}
            title={translate('getPhysicalCard.header')}
        >
            <Text style={[styles.baseFontStyle, styles.mt5]}>{translate('getPhysicalCard.estimatedDeliveryMessage')}</Text>
            <MenuItemWithTopDescription
                description={translate('getPhysicalCard.legalName')}
                iconRight={Expensicons.ArrowRight}
                onPress={() => goToGetPhysicalCardName(domain)}
                shouldShowRightIcon
                style={[styles.flexRow, styles.justifyContentBetween, styles.mt5]}
                title={`${legalFirstName} ${legalLastName}`}
            />
            <MenuItemWithTopDescription
                description={translate('getPhysicalCard.phoneNumber')}
                iconRight={Expensicons.ArrowRight}
                onPress={() => goToGetPhysicalCardPhone(domain)}
                shouldShowRightIcon
                style={[styles.flexRow, styles.justifyContentBetween, styles.mt5]}
                title={phoneNumber || UserUtils.getSecondaryPhoneLogin(loginList)}
            />
            <MenuItemWithTopDescription
                description={translate('getPhysicalCard.address')}
                iconRight={Expensicons.ArrowRight}
                onPress={() => goToGetPhysicalCardAddress(domain)}
                shouldShowRightIcon
                style={[styles.flexRow, styles.justifyContentBetween, styles.mt5]}
                title={PersonalDetailsUtils.getFormattedAddress(privatePersonalDetails)}
            />
        </BaseGetPhysicalCard>
    );
}

GetPhysicalCardConfirm.defaultProps = defaultProps;
GetPhysicalCardConfirm.displayName = 'GetPhysicalCardConfirm';
GetPhysicalCardConfirm.propTypes = propTypes;

export default withOnyx({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
    loginList: {
        key: ONYXKEYS.LOGIN_LIST,
    },
})(GetPhysicalCardConfirm);
