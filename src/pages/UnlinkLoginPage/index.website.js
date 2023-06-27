import React, {useEffect, useState, useCallback} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import {propTypes as validateLinkPropTypes, defaultProps as validateLinkDefaultProps} from '../ValidateLoginPage/validateLinkPropTypes';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import ValidateCodeModal from '../../components/ValidateCode/ValidateCodeModal';
import Navigation from '../../libs/Navigation/Navigation';
import * as Session from '../../libs/actions/Session';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';

const propTypes = {
    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,

    /** The credentials of the person logging in */
    credentials: PropTypes.shape({
        /** The email the user logged in with */
        login: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    route: validateLinkDefaultProps,
    credentials: {},
};

function UnlinkLoginPage(props) {
    const [isMagicCodePage, setIsMagicCodePage] = useState(false);
    const accountID = lodashGet(props.route.params, 'accountID', '');
    const validateCode = lodashGet(props.route.params, 'validateCode', '');

    const unLinkCallback = useCallback(() => {
        Session.unlinkLogin(accountID, validateCode);
        Navigation.navigate(ROUTES.HOME);
    }, [accountID, validateCode]);

    useEffect(() => {
        const login = lodashGet(props, 'credentials.login', null);

        // A fresh session (i.e: user opens link in incognito browser or requests unlink in desktop but open link in web browser) will not have credentials.login
        // Same as sign in with magic link page, we would like to show the Magic code screen in order to give a chance for user to unlink here or in original device.
        if (!login) {
            setIsMagicCodePage(true);
            return;
        }

        // The user would like to unlink via magic link on the same browser, in another tab.
        unLinkCallback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isMagicCodePage ? (
        <ValidateCodeModal
            code={validateCode}
            justValidateHereText={props.translate('validateCodeModal.unlinkHere')}
            justValidateHereCallback={unLinkCallback}
        />
    ) : (
        <FullScreenLoadingIndicator />
    );
}

UnlinkLoginPage.propTypes = propTypes;
UnlinkLoginPage.defaultProps = defaultProps;
UnlinkLoginPage.displayName = 'UnlinkLoginPage';

export default compose(
    withLocalize,
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
    }),
)(UnlinkLoginPage);
