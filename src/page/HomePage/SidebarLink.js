import React from 'react';
import PropTypes from 'prop-types';
import {Link} from '../../lib/Router';

const propTypes = {
    // The ID of the report for this link
    reportID: PropTypes.number.isRequired,

    // The name of the report to use as the text for this link
    reportName: PropTypes.string.isRequired,
};

class SidebarLink extends React.Component {
    render() {
        return (
            <Link to={`/${this.props.reportID}`}>
                {this.props.reportName}
            </Link>
        );
    }
}
SidebarLink.propTypes = propTypes;

export default SidebarLink;
