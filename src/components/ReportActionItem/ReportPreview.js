import _, { compose } from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import IOUQuote from './IOUQuote';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import withLocalize from '../withLocalize';
import { withOnyx } from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** The ID of the associated chatReport */
    chatReportID: PropTypes.string.isRequired,

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor: PropTypes.shape({current: PropTypes.elementType}),

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive: PropTypes.func,

    /** Whether the IOU is hovered so we can modify its style */
    isHovered: PropTypes.bool,

    /** The active IOUReport, used for Onyx subscription */
    // eslint-disable-next-line react/no-unused-prop-types
    iouReportID: PropTypes.string.isRequired,

    /* Onyx Props */
    /** Active IOU Report for current report */
    iouReport: PropTypes.shape({
        /** Email address of the manager in this iou report */
        managerEmail: PropTypes.string,

        /** Email address of the creator of this iou report */
        ownerEmail: PropTypes.string,

        /** Outstanding amount in cents of this transaction */
        total: PropTypes.number,

        /** Currency of outstanding amount of this transaction */
        currency: PropTypes.string,

        /** Does the iouReport have an outstanding IOU? */
        hasOutstandingIOU: PropTypes.bool,
    }),
};

const defaultProps = {
    contextMenuAnchor: undefined,
    checkIfContextMenuActive: () => {},
    isHovered: false,
};

const ReportPreview = (props) => {

    if (props.iouReport.total === 0) {
        return null;
    }
    
    const launchDetailsModal = () => {
        Navigation.navigate(ROUTES.getIouDetailsRoute(props.chatReportID, props.action.originalMessage.IOUReportID));
    };

    const cachedTotal = props.iouReport.total && props.iouReport.currency
        ? props.numberFormat(
            Math.abs(props.iouReport.total) / 100,
            {style: 'currency', currency: props.iouReport.currency},
        ) : '';

    return (
        <>
            <IOUQuote
                action={props.action}
                iouReportID={props.action.originalMessage.IOUReportID.toString()}
                chatReportID={props.chatReportID}
                contextMenuAnchor={props.contextMenuAnchor}
                shouldAllowViewDetails={Boolean(props.action.originalMessage.IOUReportID)}
                onViewDetailsPressed={launchDetailsModal}
                checkIfContextMenuActive={props.checkIfContextMenuActive}
                isHovered={props.isHovered}
            />
        </>
    );
};

ReportPreview.propTypes = propTypes;
ReportPreview.defaultProps = defaultProps;
ReportPreview.displayName = 'ReportPreview';

export default compose(
    withLocalize,
    withOnyx({
        iouReport: {
            key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
        },
    }),
)(ReportPreview);
