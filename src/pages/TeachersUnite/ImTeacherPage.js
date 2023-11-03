import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import * as LoginUtils from '@libs/LoginUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ImTeacherUpdateEmailPage from './ImTeacherUpdateEmailPage';
import IntroSchoolPrincipalPage from './IntroSchoolPrincipalPage';

const propTypes = {
    /** Current user session */
    session: PropTypes.shape({
        /** Current user primary login */
        email: PropTypes.string.isRequired,
    }),
};

const defaultProps = {
    session: {
        email: null,
    },
};

function ImTeacherPage(props) {
    const isLoggedInEmailPublicDomain = LoginUtils.isEmailPublicDomain(props.session.email);
    return isLoggedInEmailPublicDomain ? <ImTeacherUpdateEmailPage /> : <IntroSchoolPrincipalPage />;
}

ImTeacherPage.propTypes = propTypes;
ImTeacherPage.defaultProps = defaultProps;
ImTeacherPage.displayName = 'ImTeacherPage';

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ImTeacherPage);
