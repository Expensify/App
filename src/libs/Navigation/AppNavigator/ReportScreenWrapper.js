import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import ReportScreen from '../../../pages/home/ReportScreen';
import {withNavigationPropTypes} from '../../../components/withNavigation';

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

    ...withNavigationPropTypes,
};

const defaultProps = {};

// This wrapper is reponsible for opening the last accessed report if there is no reportID specified in the route params
class ReportScreenWrapper extends PureComponent {

    render() {
        // Wait until there is reportID in the route params
        if (lodashGet(this.props.route, 'params.reportID', null)) {
            return <ReportScreen route={this.props.route} />;
        }
        // We will return default wiew here
        return <></>;
    }
}

ReportScreenWrapper.propTypes = propTypes;
ReportScreenWrapper.defaultProps = defaultProps;
ReportScreenWrapper.displayName = 'ReportScreenWrapper';

export default ReportScreenWrapper;
