import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** Card number */
    pan: PropTypes.string,

    /** Card expiration date */
    expiration: PropTypes.string,

    /** 3 digit code */
    cvv: PropTypes.string,

    /** Card owner's address */
    address: PropTypes.string,
});
