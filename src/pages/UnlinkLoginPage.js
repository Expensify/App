import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import {propTypes as validateLinkPropTypes, defaultProps as validateLinkDefaultProps} from './ValidateLoginPage/validateLinkPropTypes';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Navigation from '../libs/Navigation/Navigation';
import * as Session from '../libs/actions/Session';
import ROUTES from '../ROUTES';
import usePrevious from '../hooks/usePrevious';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether a sign is loading */
        isLoading: PropTypes.bool,
    }),
};

const defaultProps = {
    route: validateLinkDefaultProps,
    account: {
        isLoading: false,
    },
};

function UnlinkLoginPage(props) {
    const accountID = lodashGet(props.route.params, 'accountID', '');
    const validateCode = lodashGet(props.route.params, 'validateCode', '');
    const prevIsLoading = usePrevious(props.account.isLoading);

    useEffect(() => {
        Session.unlinkLogin(accountID, validateCode);
        // We only want this to run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Only navigate when the unlink login request is completed
        if (!prevIsLoading || props.account.isLoading) {
            return;
        }

        Navigation.navigate(ROUTES.HOME);
    }, [prevIsLoading, props.account.isLoading]);

    return <FullScreenLoadingIndicator />;
}

UnlinkLoginPage.propTypes = propTypes;
UnlinkLoginPage.defaultProps = defaultProps;
UnlinkLoginPage.displayName = 'UnlinkLoginPage';

export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
})(UnlinkLoginPage);
