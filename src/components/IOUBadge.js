import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import CONST from '../CONST';
import Badge from './Badge';

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
        reportID: 0,
        chatReportID: 0,
        total: 0,
        ownerEmail: null,
        currency: CONST.CURRENCY.USD,
    },
};

const IOUBadge = (props) => {
    const launchIOUDetailsModal = () => {
        Navigation.navigate(ROUTES.getIouDetailsRoute(props.iouReport.chatReportID, props.iouReport.reportID));
    };
    return (
        <Badge
            pressable
            onPress={launchIOUDetailsModal}
            success={props.session.email === props.iouReport.ownerEmail}
            error={props.session.email !== props.iouReport.ownerEmail}
            text={props.numberFormat(
                props.iouReport.total / 100,
                {style: 'currency', currency: props.iouReport.currency},
            )}
        />
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
