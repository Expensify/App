import React, {useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Text from './Text';
import * as IOU from '../libs/actions/IOU';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /** The transactionID of this request */
    transactionID: PropTypes.string,
};

const defaultProps = {
    transactionID: '',
};

function DistanceRequest(props) {
    useEffect(() => {
        if (props.transactionID) {
            return;
        }
        IOU.createEmptyTransaction();
    }, [props.transactionID]);

    return (
        <View style={[styles.flex1, styles.flexColumn, styles.w100, styles.alignItemsCenter, styles.mt4]}>
            <Text>Distance Request</Text>
            <Text>transactionID: {props.transactionID}</Text>
        </View>
    );
}

DistanceRequest.displayName = 'DistanceRequest';
DistanceRequest.propTypes = propTypes;
DistanceRequest.defaultProps = defaultProps;
export default withOnyx({
    transactionID: {key: ONYXKEYS.IOU, selector: (iou) => (iou && iou.transactionID) || ''},
})(DistanceRequest);
