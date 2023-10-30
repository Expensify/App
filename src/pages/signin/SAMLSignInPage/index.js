import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import SAMLLoadingIndicator from '../../../components/SAMLLoadingIndicator';


const propTypes = {
    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email/phone the user logged in with */
        login: PropTypes.string,
    }),
};

const defaultProps = {
    credentials: {},
};

function SAMLSignInPage({credentials}) {
    useEffect(() => {
        window.open(`${CONFIG.EXPENSIFY.SAML_URL}?email=${credentials.login}&referer=${CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER}`, '_self');
    }, [credentials.login]);

    return <SAMLLoadingIndicator />;
}

SAMLSignInPage.propTypes = propTypes;
SAMLSignInPage.defaultProps = defaultProps;

export default withOnyx({
    credentials: {key: ONYXKEYS.CREDENTIALS},
})(SAMLSignInPage);
