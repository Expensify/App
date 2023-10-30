import PropTypes from 'prop-types';

const subStepPropTypes = {
    /** is substep being edited from confirmation screen */
    isEditing: PropTypes.bool.isRequired,

    /** method that navigates to next substep */
    onNext: PropTypes.func.isRequired,

    /** method that navigates to passed step from confirmation screen */
    onMove: PropTypes.func.isRequired,
};

export default subStepPropTypes;
