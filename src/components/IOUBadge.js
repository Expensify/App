import React from 'react';
import PropTypes from 'prop-types';
import {Text, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** IOU Report data object */
    iouReport: PropTypes.shape({
        /** The total amount in cents */
        total: PropTypes.number,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    iouReport: {
        total: 0,
    },
};

const IOUBadge = props => (
    <View
        style={[styles.badge, styles.badgeSuccess, styles.ml2]}
    >
        <Text
            style={styles.badgeText}
            numberOfLines={1}
        >
            {props.numberFormat(
                props.iouReport.total / 100,
                {style: 'currency', currency: props.iouReport.currency},
            )}
        </Text>
    </View>
);

IOUBadge.displayName = 'IOUBadge';
IOUBadge.propTypes = propTypes;
IOUBadge.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        iouReport: {
            key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT_IOUS}${iouReportID}`,
        },
    }),
)(IOUBadge);
