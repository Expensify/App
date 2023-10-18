import PropTypes from 'prop-types';
import React from 'react';
import {Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../../../ONYXKEYS';
import Form from '../../../../components/Form';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import * as Wallet from '../../../../libs/actions/Wallet';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import styles from '../../../../styles/styles';
import * as CardUtils from '../../../../libs/CardUtils';
import assignedCardPropTypes from '../assignedCardPropTypes';

const propTypes = {
    cardList: PropTypes.objectOf(assignedCardPropTypes),
    children: PropTypes.element,
    domain: PropTypes.string,
    headline: PropTypes.string.isRequired,
    isConfirmation: PropTypes.bool,
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
    loginList: PropTypes.shape({}),
    renderContent: PropTypes.func,
    submitButtonText: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
};

const defaultProps = {
    cardList: {},
    children: null,
    domain: '',
    privatePersonalDetails: {},
    loginList: {},
    isConfirmation: false,
    renderContent: (onSubmit, submitButtonText, children = () => {}) => (
        <Form
            formID={ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM}
            submitButtonText={submitButtonText}
            onSubmit={onSubmit}
            style={[styles.mh5, styles.flex1]}
        >
            {children}
        </Form>
    ),
};

function BaseGetPhysicalCard({cardList, children, domain, headline, isConfirmation, loginList, privatePersonalDetails, renderContent, submitButtonText, title}) {
    const onSubmit = () => {
        if (isConfirmation) {
            const domainCards = CardUtils.getDomainCards(cardList)[domain];
            const virtualCard = _.find(domainCards, (card) => card.isVirtual) || {};
            const cardID = virtualCard.cardID;
            Wallet.requestPhysicalExpensifyCard(cardID, privatePersonalDetails);
            Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(domain));
            return;
        }
        Navigation.goToNextPhysicalCardRoute(privatePersonalDetails, loginList);
    };
    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
            testID={BaseGetPhysicalCard.displayName}
        >
            <HeaderWithBackButton
                title={title}
                // TODO: Should form draft data be erased when a user exits the flow?
                onBackButtonPress={Navigation.goBack}
            />
            <Text style={[styles.textHeadline, styles.mh5]}>{headline}</Text>
            {renderContent(onSubmit, submitButtonText, children)}
        </ScreenWrapper>
    );
}

BaseGetPhysicalCard.defaultProps = defaultProps;
BaseGetPhysicalCard.displayName = 'BaseGetPhysicalCard';
BaseGetPhysicalCard.propTypes = propTypes;

export default withOnyx({
    cardList: {
        key: ONYXKEYS.CARD_LIST,
    },
    loginList: {
        key: ONYXKEYS.LOGIN_LIST,
    },
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
})(BaseGetPhysicalCard);
