import PropTypes from 'prop-types';

const TwoFactorAuthPropTypes = {
    account: PropTypes.shape({
        /** Whether this account has 2FA enabled or not */
        requiresTwoFactorAuth: PropTypes.bool,

        /** Secret key to enable 2FA within the authenticator app */
        twoFactorAuthSecretKey: PropTypes.string,

        /** User primary login to attach to the authenticator QRCode */
        primaryLogin: PropTypes.string,

        /** User is submitting the authentication code */
        isLoading: PropTypes.bool,

        /** Server-side errors in the submitted authentication code */
        errors: PropTypes.objectOf(PropTypes.string),
    }),
};

const defaultAccount = {
    requiresTwoFactorAuth: false,
    twoFactorAuthStep: '',
};

export {TwoFactorAuthPropTypes, defaultAccount};
