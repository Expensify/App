import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import {
    propTypes as anchorForCommentsOnlyPropTypes,
    defaultProps as anchorForCommentsOnlyDefaultProps,
} from './anchorForCommentsOnlyPropTypes';
import BaseAnchorForCommentsOnly from './BaseAnchorForCommentsOnly';
import addEncryptedAuthTokenToURL from '../../libs/addEncryptedAuthTokenToURL';

const propTypes = {
    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user authToken */
        encryptedAuthToken: PropTypes.string,
    }),

    ...anchorForCommentsOnlyPropTypes,
};

const defaultProps = {
    session: {
        encryptedAuthToken: null,
    },
    ...anchorForCommentsOnlyDefaultProps,
};

const AnchorWithAuthToken = (props) => {
    const urlWithAuthToken = addEncryptedAuthTokenToURL({
        url: props.href,
        encryptedAuthToken: props.session.encryptedAuthToken,
    });
    const propsToPass = _.omit(props, 'session');
    propsToPass.href = urlWithAuthToken;
    propsToPass.shouldDownloadFile = true;
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <BaseAnchorForCommentsOnly {...propsToPass} />;
};

AnchorWithAuthToken.propTypes = propTypes;
AnchorWithAuthToken.defaultProps = defaultProps;
AnchorWithAuthToken.displayName = 'AnchorWithAuthToken';

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(AnchorWithAuthToken);
