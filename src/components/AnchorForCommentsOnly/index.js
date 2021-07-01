import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {
    propTypes as anchorForCommentsOnlyPropTypes,
    defaultProps as anchorForCommentsOnlyDefaultProps,
} from './anchorForCommentsOnlyPropTypes';
import BaseAnchorForCommentsOnly from './BaseAnchorForCommentsOnly';
import addEncryptedAuthTokenToURL from '../../libs/addEncryptedAuthTokenToURL';

const propTypes = {
    /** Do we need an auth token to view this link or download the remote resource? */
    isAuthTokenRequired: PropTypes.bool,

    ...anchorForCommentsOnlyPropTypes,
};

const defaultProps = {
    isAuthTokenRequired: false,
    ...anchorForCommentsOnlyDefaultProps,
};

/*
 * This component acts as a switch between AnchorWithAuthToken and default BaseAnchorForCommentsOnly.
 * It is an optimization so that we can attach an auth token to a URL when one is required,
 * without using Onyx.connect on links that don't need an authToken.
 */
const AnchorForCommentsOnly = (props) => {
    const propsToPass = _.omit(props, 'isAuthTokenRequired');
    if (props.isAuthTokenRequired) {
        propsToPass.href = addEncryptedAuthTokenToURL(props.href);
        propsToPass.shouldDownloadFile = true;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <BaseAnchorForCommentsOnly {...propsToPass} />;
};

AnchorForCommentsOnly.propTypes = propTypes;
AnchorForCommentsOnly.defaultProps = defaultProps;
AnchorForCommentsOnly.displayName = 'AnchorForCommentsOnly';

export default AnchorForCommentsOnly;
