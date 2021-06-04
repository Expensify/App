import React from 'react';
import PropTypes from 'prop-types';
import {Text, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** IOU Report data object */
    iouReport: PropTypes.shape({
        /** The report ID of the IOU */
        reportID: PropTypes.number,

        /** The report ID of the chat associated with the IOU */
        chatReportID: PropTypes.number,

        /** The total amount in cents */
        total: PropTypes.number,

        /** The owner of the IOUReport */
        ownerEmail: PropTypes.string,
    }),

    /** Session of currently logged in user */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    iouReport: {
        reportID: 0,
        chatReportID: 0,
        total: 0,
        ownerEmail: null,
    },
};

const IOUBadge = (props) => {
    const launchIOUDetailsModal = () => {
        Navigation.navigate(ROUTES.getIouDetailsRoute(props.iouReport.chatReportID, props.iouReport.reportID));
    };
    return (
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
                onPress={launchIOUDetailsModal}
            >
                {props.numberFormat(
                    props.iouReport.total / 100,
                    {style: 'currency', currency: props.iouReport.currency},
                )}
            </Text>
        </View>
    );
};

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
