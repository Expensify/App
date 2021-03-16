import PropTypes from 'prop-types';
import {participantPropTypes} from '../optionPropTypes';

const propTypes = {
    // Styles of the title
    style: PropTypes.arrayOf(PropTypes.any),

    // Lines before wrapping
    numberOfLines: PropTypes.number,

    // Is tooltip needed?
    // When true, triggers complex title rendering
    tooltipEnabled: PropTypes.bool,

    // Option to allow the user to choose from can be type 'report' or 'user'
    option: PropTypes.shape({
        // The full name of the user if available, otherwise the login (email/phone number) of the user
        text: PropTypes.string.isRequired,

        // List of particiapants of the report
        participantsList: PropTypes.arrayOf(participantPropTypes).isRequired,

        // Text to show for tooltip
        tooltipText: PropTypes.string,
    }).isRequired,

};

const defaultProps = {
    style: null,
    tooltipEnabled: false,
    numberOfLines: 1,
};
export {
    propTypes,
    defaultProps,
};
