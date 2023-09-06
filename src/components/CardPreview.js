import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';

import styles from '../styles/styles';
import Text from './Text';
import usePrivatePersonalDetails from '../hooks/usePrivatePersonalDetails';
import ONYXKEYS from '../ONYXKEYS';

import ExpensifyCardImage from '../../assets/images/expensify-card.svg';

const propTypes = {
    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        legalFirstName: PropTypes.string,
        legalLastName: PropTypes.string,
    }),
    session: PropTypes.shape({
        /** Currently logged-in user email */
        email: PropTypes.string,
    }),
};

const defaultProps = {
    privatePersonalDetails: {
        legalFirstName: '',
        legalLastName: '',
    },
    session: {
        email: '',
    },
};

function CardPreview(props) {
    usePrivatePersonalDetails();
    const legalFirstName = props.privatePersonalDetails.legalFirstName || '';
    const legalLastName = props.privatePersonalDetails.legalLastName || '';

    const cardHolder = legalFirstName && legalLastName ? `${legalFirstName} ${legalLastName}` : props.session.email;

    return (
        <View style={styles.walletCard}>
            <ExpensifyCardImage
                pointerEvents="none"
                height={148}
                width={235}
            />
            <Text
                style={styles.walletCardHolder}
                numberOfLines={2}
                ellipsizeMode="tail"
            >
                {cardHolder}
            </Text>
        </View>
    );
}

CardPreview.propTypes = propTypes;
CardPreview.defaultProps = defaultProps;
CardPreview.displayName = CardPreview;

export default withOnyx({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(CardPreview);
