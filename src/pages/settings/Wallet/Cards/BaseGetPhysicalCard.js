import PropTypes from 'prop-types';
import React from 'react';
import {Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../../ONYXKEYS';
import Form from '../../../../components/Form';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Navigation from '../../../../libs/Navigation/Navigation';
import styles from '../../../../styles/styles';
import * as Wallet from '../../../../libs/actions/Wallet';

const propTypes = {
    children: PropTypes.node.isRequired,
    headline: PropTypes.string.isRequired,
    isConfirmation: PropTypes.bool,
    // TODO: Confirm what is the correct type of loginList
    loginList: PropTypes.shape({}).isRequired,
    submitButtonText: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
};

const defaultProps = {
    isConfirmation: false,
};

function BaseGetPhysicalCard({children, headline, isConfirmation, loginList, submitButtonText, title}) {
    const onSubmit = (formData) => {
        if (isConfirmation) {
            // TODO: Use cardID and pass formatted formData here
            Wallet.requestPhysicalExpensifyCard('', formData);
            // TODO: Redirect user to the domain card page (?)
            return;
        }
        Navigation.goToNextPhysicalCardRoute(formData, loginList);
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
            <Form
                formID={ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM}
                submitButtonText={submitButtonText}
                onSubmit={onSubmit}
                style={[styles.mh5, styles.flex1]}
            >
                <Text style={styles.textHeadline}>{headline}</Text>
                {children}
            </Form>
        </ScreenWrapper>
    );
}

BaseGetPhysicalCard.defaultProps = defaultProps;
BaseGetPhysicalCard.displayName = 'BaseGetPhysicalCard';
BaseGetPhysicalCard.propTypes = propTypes;

export default withOnyx({
    loginList: {
        key: ONYXKEYS.LOGIN_LIST,
    },
})(BaseGetPhysicalCard);
