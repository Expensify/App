import React from 'react';
import LoginFormNarrow from './LoginFormNarrow';
import LoginFormWide from './LoginFormWide';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const LoginForm = ({isSmallScreenWidth}) => (
    !isSmallScreenWidth
        ? <LoginFormWide />
        : <LoginFormNarrow />
);

LoginForm.propTypes = propTypes;
LoginForm.displayName = 'LoginForm';

export default withWindowDimensions(LoginForm);
