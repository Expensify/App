import React, {useEffect} from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Text from './Text';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import createInitialWaypoints from '../libs/actions/Transaction';

const propTypes = {
    /** The transactionID of this request */
    transactionID: PropTypes.string,

    /** The optimistic transaction for this request */
    transaction: PropTypes.shape({
        transactionID: PropTypes.string,
        comment: PropTypes.shape({
            waypoints: PropTypes.shape({
                lat: PropTypes.number,
                lng: PropTypes.number,
                address: PropTypes.string,
            })
        }),
    }),
};

const defaultProps = {
    transactionID: '',
    transaction: {},
};

function DistanceRequest({transaction, transactionID}) {
    useEffect(() => {
        const waypoints = lodashGet(transaction, 'comment.waypoints');
        if (!transaction.transactionID || !_.isEmpty(waypoints)) {
            return;
        }
        // Create the initial start and stop waypoints
        createInitialWaypoints(transaction.transactionID);
    }, [transaction]);

    return (
        <View style={[styles.flex1, styles.flexColumn, styles.w100, styles.alignItemsCenter, styles.mt4]}>
            <Text>Distance Request</Text>
            <Text>transactionID: {transactionID}</Text>
        </View>
    );
}

DistanceRequest.displayName = 'DistanceRequest';
DistanceRequest.propTypes = propTypes;
DistanceRequest.defaultProps = defaultProps;
export default withOnyx({
    transaction: {key: (props) => `${ONYXKEYS.COLLECTION.TRANSACTION}${props.transactionID}`, selector: (transaction) => ({transactionID: transaction.transactionID, comment: {waypoints: lodashGet(transaction, 'comment.waypoints')}})},
})(DistanceRequest);
