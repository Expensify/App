import PropTypes from 'prop-types';

const propTypes = {
    /** Children to render. */
    children: PropTypes.node.isRequired,
};

function DeeplinkWrapper({children}) {
    return children;
}

DeeplinkWrapper.propTypes = propTypes;

export default DeeplinkWrapper;
