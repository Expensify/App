import PropTypes from 'prop-types';
import {getDomainInfo} from '../../libs/actions/User';

export default PropTypes.shape({
    /** error associated with adding a secondary login */
    error: PropTypes.string,

    /** Wether or not the user is on a public domain email account or not */
    isFromPublicDomain: PropTypes.bool,

    /** Whether the form is being submitted */
    loading: PropTypes.bool,

    /** Whether or not the user is subscribed to news updates */
    loginList: PropTypes.arrayOf(PropTypes.shape({

        /** Value of partner name */
        partnerName: PropTypes.string,

        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,

        /** Date of when login was validated */
        validatedDate: PropTypes.string,
    })),
});
