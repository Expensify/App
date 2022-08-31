import PropTypes from 'prop-types';

/** Prop types related to the Terms step of KYC flow */
export default PropTypes.shape({
    /** Any error message to show */
    errors: PropTypes.objectOf(PropTypes.string),
});
