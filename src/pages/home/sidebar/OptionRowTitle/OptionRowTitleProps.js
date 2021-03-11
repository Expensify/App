/* eslint-disable react/forbid-prop-types */
import PropTypes from 'prop-types';
import optionPropTypes from '../optionPropTypes';

const propTypes = {
    // styles of the title
    style: PropTypes.arrayOf(PropTypes.object),

    // Does tooltip is needed
    // When true, triggers complex title rendering
    tooltipEnabled: PropTypes.bool,

    // Option to allow the user to choose from can be type 'report' or 'user'
    option: optionPropTypes.isRequired,

};
export default propTypes;
