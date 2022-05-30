import PropTypes from 'prop-types';
import {windowDimensionsPropTypes} from '../withWindowDimensions';
import {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    /** If this is the Concierge chat, we'll open the modal for requesting a setup call instead of showing popover menu */
    isConcierge: PropTypes.bool,

    /** Link to open when user wants to create a new google meet meeting */
    googleMeetURL: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    isConcierge: false,
};

export {propTypes, defaultProps};
