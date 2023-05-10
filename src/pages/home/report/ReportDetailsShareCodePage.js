import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import reportPropTypes from '../../reportPropTypes';
import ONYXKEYS from '../../../ONYXKEYS';
import ShareCodePage from '../../ShareCodePage';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** Route specific parameters used on this screen */
        params: PropTypes.shape({
            reportID: PropTypes.string,
        }).isRequired,
    }).isRequired,

    /** The report currently being looked at */
    report: reportPropTypes,
};

const defaultProps = {
    report: undefined,
};

// eslint-disable-next-line react/prefer-stateless-function
class ReportDetailsShareCodePage extends React.Component {
    render() {
        // eslint-disable-next-line es/no-optional-chaining

        return (
            <ShareCodePage report={this.props.report} />
        );
    }
}

ReportDetailsShareCodePage.propTypes = propTypes;
ReportDetailsShareCodePage.defaultProps = defaultProps;

export default withOnyx({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
    },
})(ReportDetailsShareCodePage);
