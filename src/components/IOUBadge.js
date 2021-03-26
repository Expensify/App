import React from 'react';
import PropTypes from 'prop-types';
import {Text, TouchableOpacity} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Num from 'expensify-common/lib/Num';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';

const propTypes = {
    // IOU Report data object
    iouReport: {
        // The total amount in cents
        total: PropTypes.number,
    },
};

const defaultProps = {
    iouReport: {
        total: 0,
    },
};

const IOUBadge = props => (
    <TouchableOpacity
        style={[styles.pill, styles.ml2]}
    >
        <Text
            style={styles.pillText}
            numberOfLines={1}
        >
            {`$${Num.number_format(props.iouReport.total / 100, 2)}`}
        </Text>
    </TouchableOpacity>
);

IOUBadge.displayName = 'IOUBadge';
IOUBadge.propTypes = propTypes;
IOUBadge.defaultProps = defaultProps;
export default withOnyx({
    iouReport: {
        key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT_IOUS}${iouReportID}`,
    },
})(IOUBadge);
