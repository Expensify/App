import React from 'react';
import lodashGet from 'lodash/get';
import {propTypes as validateLinkPropTypes, defaultProps as validateLinkDefaultProps} from './ValidateLoginPage/validateLinkPropTypes';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Navigation from '../libs/Navigation/Navigation';
import * as Session from '../libs/actions/Session';
import ROUTES from '../ROUTES';

const propTypes = {
    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,
};

const defaultProps = {
    route: validateLinkDefaultProps,
};

const UnlinkLoginPage = (props) => {
    const accountID = lodashGet(props.route.params, 'accountID', '');
    const validateCode = lodashGet(props.route.params, 'validateCode', '');

    Session.unlinkLogin(accountID, validateCode);
    Navigation.navigate(ROUTES.HOME);
    return <FullScreenLoadingIndicator />;
};

UnlinkLoginPage.propTypes = propTypes;
UnlinkLoginPage.defaultProps = defaultProps;
UnlinkLoginPage.displayName = 'UnlinkLoginPage';

export default UnlinkLoginPage;
