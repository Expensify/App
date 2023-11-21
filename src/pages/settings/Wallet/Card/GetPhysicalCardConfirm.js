import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import FormUtils from '@libs/FormUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';

const goToGetPhysicalCardName = (domain) => {
    Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_NAME.getRoute(domain), CONST.NAVIGATION.ACTION_TYPE.PUSH);
};

const goToGetPhysicalCardPhone = (domain) => {
    Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_PHONE.getRoute(domain), CONST.NAVIGATION.ACTION_TYPE.PUSH);
};

const goToGetPhysicalCardAddress = (domain) => {
    Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_ADDRESS.getRoute(domain), CONST.NAVIGATION.ACTION_TYPE.PUSH);
};

const propTypes = {
    /* Onyx Props */
    /** Draft values used by the get physical card form */
    draftValues: PropTypes.shape({
        addressLine1: PropTypes.string,
        addressLine2: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        country: PropTypes.string,
        zipPostCode: PropTypes.string,
        phoneNumber: PropTypes.string,
        legalFirstName: PropTypes.string,
        legalLastName: PropTypes.string,
    }),

    /* Navigation Props */
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** domain passed via route /settings/wallet/card/:domain */
            domain: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    draftValues: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        zipPostCode: '',
        phoneNumber: '',
        legalFirstName: '',
        legalLastName: '',
    },
};

function GetPhysicalCardConfirm({
    draftValues: {addressLine1, addressLine2, city, state, country, zipPostCode, legalFirstName, legalLastName, phoneNumber},
    route: {
        params: {domain},
    },
}) {
    const {translate} = useLocalize();

    return (
        <BaseGetPhysicalCard
            currentRoute={ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_CONFIRM.getRoute(domain)}
            domain={domain}
            headline={translate('getPhysicalCard.confirmMessage')}
            isConfirmation
            submitButtonText={translate('getPhysicalCard.shipCard')}
            title={translate('getPhysicalCard.header')}
        >
            <Text style={[styles.baseFontStyle, styles.mv5, styles.mh5]}>{translate('getPhysicalCard.estimatedDeliveryMessage')}</Text>
            <MenuItemWithTopDescription
                description={translate('getPhysicalCard.legalName')}
                iconRight={Expensicons.ArrowRight}
                onPress={() => goToGetPhysicalCardName(domain)}
                shouldShowRightIcon
                title={`${legalFirstName} ${legalLastName}`}
            />
            <MenuItemWithTopDescription
                description={translate('getPhysicalCard.phoneNumber')}
                iconRight={Expensicons.ArrowRight}
                onPress={() => goToGetPhysicalCardPhone(domain)}
                shouldShowRightIcon
                title={phoneNumber}
            />
            <MenuItemWithTopDescription
                description={translate('getPhysicalCard.address')}
                iconRight={Expensicons.ArrowRight}
                onPress={() => goToGetPhysicalCardAddress(domain)}
                shouldShowRightIcon
                title={PersonalDetailsUtils.getFormattedAddress({
                    address: {
                        street: PersonalDetailsUtils.getFormattedStreet(addressLine1, addressLine2),
                        city,
                        state,
                        zip: zipPostCode,
                        country,
                    },
                })}
            />
        </BaseGetPhysicalCard>
    );
}

GetPhysicalCardConfirm.defaultProps = defaultProps;
GetPhysicalCardConfirm.displayName = 'GetPhysicalCardConfirm';
GetPhysicalCardConfirm.propTypes = propTypes;

export default withOnyx({
    draftValues: {
        key: FormUtils.getDraftKey(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM),
    },
})(GetPhysicalCardConfirm);
