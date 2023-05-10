import PropTypes from 'prop-types';

const propTypes = {
    /** Name to the file that will be downloaded */
    fileName: PropTypes.string.isRequired,
    /** Text content to the file that will be downloaded */
    textContent: PropTypes.string.isRequired,
    children: PropTypes.func,
};

const defaultProps = {
    fileName: 'download',
    textContent: '',
    children: () => {},
};

export {propTypes, defaultProps};
