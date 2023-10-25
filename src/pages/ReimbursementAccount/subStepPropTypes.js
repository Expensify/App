import PropTypes from 'prop-types';

const subStepPropTypes = {
    isEditing: PropTypes.bool.isRequired,
    onNext: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
};

export default subStepPropTypes;
