import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';
import usePrivatePersonalDetails from '../hooks/usePrivatePersonalDetails';
import ONYXKEYS from '../ONYXKEYS';
import ExpensifyCardImage from '../../assets/images/expensify-card.svg';
import variables from '../styles/variables';

const propTypes = {
    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        legalFirstName: PropTypes.string,
        legalLastName: PropTypes.string,
    }),
    /** Session info for the currently logged in user. */
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

function CardPreview({privatePersonalDetails: {legalFirstName, legalLastName}, session: {email}}) {
    usePrivatePersonalDetails();
    const cardHolder = legalFirstName && legalLastName ? `${legalFirstName} ${legalLastName}` : email;

    return (
        <View style={styles.walletCard}>
            <ExpensifyCardImage
                pointerEvents="none"
                height={variables.cardPreviewHeight}
                width={variables.cardPreviewWidth}
            />
            <Text
                style={styles.walletCardHolder}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {cardHolder}
            </Text>
        </View>
    );
}

CardPreview.propTypes = propTypes;
CardPreview.defaultProps = defaultProps;
CardPreview.displayName = 'CardPreview';

export default withOnyx({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(CardPreview);
