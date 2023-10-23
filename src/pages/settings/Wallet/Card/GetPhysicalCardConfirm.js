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
import FormUtils from '../../../../libs/FormUtils';

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
    /** Draft values used by the get physical card form */
    draftValues: PropTypes.shape({
        address: PropTypes.string,
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
        address: '',
        phoneNumber: '',
        legalFirstName: '',
        legalLastName: '',
    },
};

function GetPhysicalCardConfirm({
    draftValues: {address, legalFirstName, legalLastName, phoneNumber},
    route: {
        params: {domain},
    },
}) {
    const {translate} = useLocalize();

    return (
        <BaseGetPhysicalCard
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
                title={address}
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
