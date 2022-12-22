import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import IOUQuote from './IOUQuote';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import IOUPreview from './IOUPreview';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** The associated chatReport */
    chatReportID: PropTypes.string.isRequired,

    /** Is this IOUACTION the most recent? */
    isMostRecentIOUReportAction: PropTypes.bool.isRequired,

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor: PropTypes.shape({current: PropTypes.elementType}),

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive: PropTypes.func,

    /* Onyx Props */
    /** chatReport associated with iouReport */
    chatReport: PropTypes.shape({
        /** The participants of this report */
        participants: PropTypes.arrayOf(PropTypes.string),

        /** Whether the chat report has an outstanding IOU */
        hasOutstandingIOU: PropTypes.bool.isRequired,
    }),

    /** Whether the IOU is hovered so we can modify its style */
    isHovered: PropTypes.bool,

};

const defaultProps = {
    contextMenuAnchor: undefined,
    checkIfContextMenuActive: () => {},
    chatReport: {
        participants: [],
    },
    isHovered: false,
};

const IOUAction = (props) => {
    const launchDetailsModal = () => {
        Navigation.navigate(ROUTES.getIouDetailsRoute(props.chatReportID, props.action.originalMessage.IOUReportID));
    };

    const shouldShowIOUPreview = (
        props.isMostRecentIOUReportAction
        && Boolean(props.action.originalMessage.IOUReportID)
        && props.chatReport.hasOutstandingIOU) || props.action.originalMessage.type === 'pay';

    return (
        <>
            <IOUQuote
                action={props.action}
                shouldAllowViewDetails={Boolean(props.action.originalMessage.IOUReportID)}
                onViewDetailsPressed={launchDetailsModal}
            />
            {shouldShowIOUPreview && (
                <IOUPreview
                    pendingAction={lodashGet(props.action, 'pendingAction', null)}
                    iouReportID={props.action.originalMessage.IOUReportID.toString()}
                    chatReportID={props.chatReportID}
                    action={props.action}
                    contextMenuAnchor={props.contextMenuAnchor}
                    checkIfContextMenuActive={props.checkIfContextMenuActive}
                    onPayButtonPressed={launchDetailsModal}
                    onPreviewPressed={launchDetailsModal}
                    containerStyles={[
                        styles.cursorPointer,
                        props.isHovered
                            ? styles.iouPreviewBoxHover
                            : undefined,
                    ]}
                    isHovered={props.isHovered}
                />
            )}
        </>
    );
};

IOUAction.propTypes = propTypes;
IOUAction.defaultProps = defaultProps;
IOUAction.displayName = 'IOUAction';

export default withOnyx({
    chatReport: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
    },
})(IOUAction);
