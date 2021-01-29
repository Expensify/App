import React from 'react';
import variables from '../../../styles/variables';
import LoginFormNarrow from './LoginFormNarrow';
import LoginFormWide from './LoginFormWide';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const LoginForm = ({windowDimensions}) => (
    windowDimensions.width > variables.mobileResponsiveWidthBreakpoint
        ? <LoginFormWide />
        : <LoginFormNarrow />
);

LoginForm.propTypes = propTypes;
LoginForm.displayName = 'LoginForm';

export default withWindowDimensions(LoginForm);
