import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import ReportActionItemIOUQuote from './ReportActionItemIOUQuote';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';
import ReportActionItemIOUPreview from './ReportActionItemIOUPreview';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // The associated chatReport
    chatReportID: PropTypes.number.isRequired,

    // Should render the preview Component?
    shouldDisplayPreviewComp: PropTypes.bool.isRequired,

    /* --- Onyx Props --- */
    // ChatReport associated with iouReport
    chatReport: PropTypes.shape({
        // The participants of this report
        participants: PropTypes.arrayOf(PropTypes.string),
    }),

    // Session info for the currently logged in user.
    session: PropTypes.shape({
        // Currently logged in user email
        email: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
    chatReport: {},
};

class ReportActionItemIOUAction extends Component {
    constructor(props) {
        super(props);

        this.launchIOUDetailsModal = this.launchIOUDetailsModal.bind(this);
    }

    /**
     *
     * Launch the IOU Details Modal, using data from the report action
     */
    launchIOUDetailsModal() {
        Navigation.navigate(ROUTES.getIouDetailsRoute(
            this.props.chatReportID, this.props.action.originalMessage.IOUReportID,
        ));
    }

    render() {
        const isDMChat = this.props.chatReport.participants.length === 1;
        return (
            <View>
                <ReportActionItemIOUQuote
                    action={this.props.action}
                    showViewDetailsLink={isDMChat}
                    onViewDetailsPressed={this.launchIOUDetailsModal}
                />
                {this.props.shouldDisplayPreviewComp && (
                    <ReportActionItemIOUPreview
                        iouReportID={this.props.action.originalMessage.IOUReportID}
                        session={this.props.session}
                        onPayButtonPressed={this.launchIOUDetailsModal}
                    />
                )}
            </View>
        );
    }
}

ReportActionItemIOUAction.propTypes = propTypes;
ReportActionItemIOUAction.defaultProps = defaultProps;
ReportActionItemIOUAction.displayName = 'ReportActionItemIOUAction';

export default withOnyx({
    chatReport: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ReportActionItemIOUAction);
