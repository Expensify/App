import PropTypes from 'prop-types';

const plaidLinkPropTypes = {
    // Plaid Link SDK public token used to intialize the Plaid SDK
    token: PropTypes.string.isRequired,

    // Callback to execute once the user taps continue after successfully entering their account information
    onSuccess: PropTypes.func,

    // Callback to execute when there is an error event emitted by the Plaid SDK
    onError: PropTypes.func,

    // Callback to execute when the user leaves the Plaid widget flow without entering any information
    onExit: PropTypes.func,
};

const plaidLinkDefaultProps = {
    onSuccess: () => {},
    onError: () => {},
    onExit: () => {},
};

export {
    plaidLinkPropTypes,
    plaidLinkDefaultProps,
};
