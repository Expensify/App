import React from 'react';
import PropTypes from 'prop-types';
import {Text, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import CONST from '../CONST';

const propTypes = {
    /** IOU Report data object */
    iouReport: PropTypes.shape({
        /** The total amount in cents */
        total: PropTypes.number,

        /** The owner of the IOUReport */
        ownerEmail: PropTypes.string,

        /** The currency of the IOUReport */
        currency: PropTypes.string,
    }),

    /** Session of currently logged in user */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    iouReport: {
        total: 0,
        ownerEmail: null,
        currency: CONST.CURRENCY.USD,
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
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(IOUBadge);
