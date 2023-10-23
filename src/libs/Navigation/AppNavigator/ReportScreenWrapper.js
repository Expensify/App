import PropTypes from 'prop-types';
import React from 'react';
import ReportScreen from '../../../pages/home/ReportScreen';
import ReportScreenIDSetter from './ReportScreenIDSetter';

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

    /* Navigation functions provided by React Navigation */
    navigation: PropTypes.shape({
        setParams: PropTypes.func.isRequired,
    }).isRequired,
};

const defaultProps = {};

function ReportScreenWrapper(props) {
    // The ReportScreen without the reportID set will display a skeleton
    // until the reportID is loaded and set in the route param
    return (
        <>
            <ReportScreen route={props.route} />
            <ReportScreenIDSetter
                route={props.route}
                navigation={props.navigation}
            />
        </>
    );
}

ReportScreenWrapper.propTypes = propTypes;
ReportScreenWrapper.defaultProps = defaultProps;
ReportScreenWrapper.displayName = 'ReportScreenWrapper';

export default ReportScreenWrapper;
