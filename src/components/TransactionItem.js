import React from 'react';
import PropTypes from 'prop-types';
import {Text, View} from 'react-native';
import styles, {webViewStyles} from '../styles/styles';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';

const propTypes = {
    action: PropTypes.shape(ReportActionPropTypes),

    // Transaction to display
    transaction: PropTypes.shape({

        // The transaction currency 
        currency: PropTypes.string,

        // The transaction amount 
        total: PropTypes.number,

        // The transaction comment 
        comment: PropTypes.string,
    }),
};

const defaultProps = {
    iouReport: {
        total: 0,
    },
};

const TransactionItem = props => (
    <View style={[webViewStyles.tagStyles.blockquote]}>
        <Text style={[styles.chatItemMessage]}>
            {/* TODO: display preview component! */}
            {`Requested : ${props.transaction.currency} ${props.transaction.amount} --  ${props.transaction.comment}`}
        </Text>
    </View>
);

TransactionItem.displayName = 'TransactionItem';
TransactionItem.propTypes = propTypes;
TransactionItem.defaultProps = defaultProps;
export default TransactionItem;

