import React, {Component} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import ReportScreen from '../../../pages/home/ReportScreen';
import {withNavigationPropTypes} from '../../../components/withNavigation';
import * as App from '../../actions/App';
import ONYXKEYS from '../../../ONYXKEYS';
import * as Report from '../../actions/Report';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** Route specific parameters used on this screen */
        params: PropTypes.shape({
            /** If the admin room should be opened */
            openOnAdminRoom: PropTypes.bool,

            /** The ID of the report this screen should display */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    /** Last reportID of the report that user accessed */
    lastAccessedReportID: PropTypes.string,

    ...withNavigationPropTypes,
};

const defaultProps = {
    lastAccessedReportID: '',
};

// This wrapper is reponsible for opening the last accessed report if there is no reportID specified in the route params
class ReportScreenWrapper extends Component {
    constructor(props) {
        super(props);

        if (!lodashGet(this.props.route, 'params.reportID', null)) {
            const reportID = lodashGet(this.props.route, 'params.reportID', null) || this.props.lastAccessedReportID;

            // It's possible that props.reports aren't fully loaded yet
            // in that case the reportID is undefined
            if (reportID) {
                this.props.navigation.setParams({reportID: String(reportID)});
            } else {
                App.confirmReadyToOpenApp();
            }
        }
    }

    render() {
        const reportID = lodashGet(this.props.route, 'params.reportID', null);
        // Wait until there is reportID in the route params
        if (reportID) {
            if (reportID.toString() !== this.props.lastAccessedReportID) Report.setLastAccessedReportID(reportID);
            return <ReportScreen route={this.props.route} />;
        }

        // We will return default wiew here
        return <></>;
    }
}

ReportScreenWrapper.propTypes = propTypes;
ReportScreenWrapper.defaultProps = defaultProps;
ReportScreenWrapper.displayName = 'ReportScreenWrapper';

export default withOnyx({
    lastAccessedReportID: {
        key: ONYXKEYS.LAST_ACCESSED_REPORT_ID,
    },
})(ReportScreenWrapper);
