import PropTypes from 'prop-types';

export default {
    /** User's wallet information */
    userWallet: PropTypes.shape({
        /** What step in the activation flow are we on? */
        currentStep: PropTypes.string,

        /** Status of wallet - e.g. SILVER or GOLD */
        tierName: PropTypes.string,

        /** Linked Bank account to the user wallet */
        // eslint-disable-next-line react/forbid-prop-types
        linkedBankAccount: PropTypes.object,

        /** The user's current wallet balance */
        availableBalance: PropTypes.number,
    }),
};
