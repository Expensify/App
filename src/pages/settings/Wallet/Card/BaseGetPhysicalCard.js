import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Form from '@components/Form';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import * as FormActions from '@libs/actions/FormActions';
import * as Wallet from '@libs/actions/Wallet';
import * as CardUtils from '@libs/CardUtils';
import FormUtils from '@libs/FormUtils';
import * as GetPhysicalCardUtils from '@libs/GetPhysicalCardUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import assignedCardPropTypes from '@pages/settings/Wallet/assignedCardPropTypes';
import styles from '@styles/styles';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /* Onyx Props */
    /** List of available assigned cards */
    cardList: PropTypes.objectOf(assignedCardPropTypes),

    /** Draft values used by the get physical card form */
    draftValues: PropTypes.shape({
        addressLine1: PropTypes.string,
        addressLine2: PropTypes.string,
        city: PropTypes.string,
        country: PropTypes.string,
        phoneNumber: PropTypes.string,
        legalFirstName: PropTypes.string,
        legalLastName: PropTypes.string,
        state: PropTypes.string,
        zipPostCode: PropTypes.string,
    }),

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user authToken */
        authToken: PropTypes.string,
    }),

    /** List of available login methods */
    loginList: PropTypes.shape({
        /** The partner creating the account. It depends on the source: website, mobile, integrations, ... */
        partnerName: PropTypes.string,

        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,

        /** The date when the login was validated, used to show the brickroad status */
        validatedDate: PropTypes.string,

        /** Field-specific server side errors keyed by microtime */
        errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),

        /** Field-specific pending states for offline UI status */
        pendingFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    }),

    /* Base Props */
    /** Text displayed below page title */
    headline: PropTypes.string.isRequired,

    /** Children components that will be rendered by renderContent */
    children: PropTypes.node,

    /** Current route from ROUTES */
    currentRoute: PropTypes.string.isRequired,

    /** Expensify card domain */
    domain: PropTypes.string,

    /** Whether or not the current step of the get physical card flow is the confirmation page */
    isConfirmation: PropTypes.bool,

    /** Render prop, used to render form content */
    renderContent: PropTypes.func,

    /** Text displayed on bottom submit button */
    submitButtonText: PropTypes.string.isRequired,

    /** Title displayed on top of the page */
    title: PropTypes.string.isRequired,

    /** Callback executed when validating get physical card form data */
    onValidate: PropTypes.func,
};

const defaultProps = {
    cardList: {},
    children: null,
    domain: '',
    draftValues: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        country: '',
        phoneNumber: '',
        legalFirstName: '',
        legalLastName: '',
        state: '',
        zipPostCode: '',
    },
    session: {},
    loginList: {},
    isConfirmation: false,
    renderContent: (onSubmit, submitButtonText, children = () => {}, onValidate = () => ({})) => (
        <Form
            formID={ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM}
            submitButtonText={submitButtonText}
            onSubmit={onSubmit}
            style={styles.flex1}
            submitButtonStyles={[styles.mh5]}
            validate={onValidate}
        >
            {children}
        </Form>
    ),
    onValidate: () => ({}),
};

function BaseGetPhysicalCard({
    cardList,
    children,
    currentRoute,
    domain,
    draftValues,
    headline,
    isConfirmation,
    loginList,
    renderContent,
    session: {authToken},
    submitButtonText,
    title,
    onValidate,
}) {
    const {addressLine1, addressLine2, city, country, legalFirstName, legalLastName, phoneNumber, state, zipPostCode} = draftValues;
    const updatedPrivatePersonalDetails = {
        legalFirstName,
        legalLastName,
        phoneNumber,
        address: {street: PersonalDetailsUtils.getFormattedStreet(addressLine1, addressLine2), city, country, state, zip: zipPostCode},
    };

    useEffect(() => {
        // Redirect user to previous steps of the flow if he hasn't finished them yet
        GetPhysicalCardUtils.setCurrentRoute(currentRoute, domain, updatedPrivatePersonalDetails, loginList);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = () => {
        // If the current step of the get physical card flow is the confirmation page
        if (isConfirmation) {
            const domainCards = CardUtils.getDomainCards(cardList)[domain];
            const virtualCard = _.find(domainCards, (card) => card.isVirtual) || {};
            const cardID = virtualCard.cardID;
            Wallet.requestPhysicalExpensifyCard(cardID, authToken, updatedPrivatePersonalDetails);
            // Form draft data needs to be erased when the flow is complete,
            // so that no stale data is left on Onyx
            FormActions.clearDraftValues(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM);
            Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(domain));
            return;
        }
        GetPhysicalCardUtils.goToNextPhysicalCardRoute(domain, updatedPrivatePersonalDetails, loginList);
    };
    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
            testID={BaseGetPhysicalCard.displayName}
        >
            <HeaderWithBackButton
                title={title}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(domain))}
            />
            <Text style={[styles.textHeadline, styles.mh5]}>{headline}</Text>
            {renderContent(onSubmit, submitButtonText, children, onValidate)}
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
    session: {
        key: ONYXKEYS.SESSION,
    },
    draftValues: {
        key: FormUtils.getDraftKey(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM),
    },
})(BaseGetPhysicalCard);
