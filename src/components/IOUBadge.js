import React from 'react';
import PropTypes from 'prop-types';
import {Text, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Num from 'expensify-common/lib/Num';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';

const propTypes = {
    /** IOU Report data object */
    iouReport: PropTypes.shape({
        /** The total amount in cents */
        total: PropTypes.number,

        /** The owner of the IOUReport */
        ownerEmail: PropTypes.string,
    }),

    /** Session of currently logged in user */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }).isRequired,
};

const defaultProps = {
    iouReport: {
        total: 0,
        ownerEmail: null,
    },
};

const IOUBadge = props => (
    <View
        style={[
            styles.badge,
            styles.ml2,
            props.session.email === props.iouReport.ownerEmail ? styles.badgeSuccess : styles.badgeDanger,
        ]}
    >
        <Text
            style={styles.badgeText}
            numberOfLines={1}
        >
            {`$${Num.number_format(props.iouReport.total / 100, 2)}`}
        </Text>
    </View>
);

IOUBadge.displayName = 'IOUBadge';
IOUBadge.propTypes = propTypes;
IOUBadge.defaultProps = defaultProps;
export default withOnyx({
    iouReport: {
        key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT_IOUS}${iouReportID}`,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(IOUBadge);
