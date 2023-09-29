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
import navigationRef from '../../../../libs/Navigation/navigationRef';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';

const getDomainFromRoute = () => {
    const currentRoute = navigationRef.current && navigationRef.current.getCurrentRoute();
    return (currentRoute && currentRoute.params && currentRoute.params.domain) || '';
};

const goToGetPhysicalCardName = () => {
    Navigation.navigate(ROUTES.SETTINGS_WALLET_CARDS_GET_PHYSICAL_NAME.getRoute(getDomainFromRoute()));
};

const goToGetPhysicalCardPhone = () => {
    Navigation.navigate(ROUTES.SETTINGS_WALLET_CARDS_GET_PHYSICAL_PHONE.getRoute(getDomainFromRoute()));
};

const goToGetPhysicalCardAddress = () => {
    Navigation.navigate(ROUTES.SETTINGS_WALLET_CARDS_GET_PHYSICAL_ADDRESS.getRoute(getDomainFromRoute()));
};

const propTypes = {
    draftValues: PropTypes.shape({
        address: PropTypes.string,
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        phoneNumber: PropTypes.string,
    }),
};

const defaultProps = {
    draftValues: {
        address: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
    },
};

function GetPhysicalCardConfirm({draftValues: {address, firstName, lastName, phoneNumber}}) {
    const {translate} = useLocalize();

    return (
        <BaseGetPhysicalCard
            headline={translate('getPhysicalCard.confirmMessage')}
            submitButtonText={translate('getPhysicalCard.shipCard')}
            title={translate('getPhysicalCard.header')}
        >
            <Text style={[styles.baseFontStyle, styles.mt5]}>{translate('getPhysicalCard.estimatedDeliveryMessage')}</Text>
            <MenuItemWithTopDescription
                description={translate('getPhysicalCard.legalName')}
                iconRight={Expensicons.ArrowRight}
                onPress={goToGetPhysicalCardName}
                shouldShowRightIcon
                style={[styles.flexRow, styles.justifyContentBetween, styles.mt5]}
                title={`${firstName} ${lastName}`}
            />
            <MenuItemWithTopDescription
                description={translate('getPhysicalCard.phoneNumber')}
                iconRight={Expensicons.ArrowRight}
                onPress={goToGetPhysicalCardPhone}
                shouldShowRightIcon
                style={[styles.flexRow, styles.justifyContentBetween, styles.mt5]}
                title={phoneNumber}
            />
            <MenuItemWithTopDescription
                description={translate('getPhysicalCard.address')}
                iconRight={Expensicons.ArrowRight}
                onPress={goToGetPhysicalCardAddress}
                shouldShowRightIcon
                style={[styles.flexRow, styles.justifyContentBetween, styles.mt5]}
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
        key: `${ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM}Draft`,
    },
})(GetPhysicalCardConfirm);
