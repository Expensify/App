import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** This is always 'PayPal.me' */
    title: PropTypes.string,

    /** The paypalMe address */
    description: PropTypes.string,

    /** This is always 'payPalMe' */
    methodID: PropTypes.string,

    /** This is always 'payPalMe' */
    accountType: PropTypes.string,
});
