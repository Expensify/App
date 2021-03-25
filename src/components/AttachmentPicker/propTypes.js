import PropTypes from 'prop-types';

const propTypes = {
    /** renderProp with the following interface
     * @example
     * function ({ openPicker: ({ onPicked: (file): void }}): void }): ReactNode */
    children: PropTypes.func.isRequired,
};

export default propTypes;
