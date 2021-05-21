import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {
    propTypes as anchorForCommentsOnlyPropTypes,
    defaultProps as anchorForCommentsOnlyDefaultProps,
} from './anchorForCommentsOnlyPropTypes';
import AnchorWithAuthToken from './AnchorWithAuthToken';
import BaseAnchorForCommentsOnly from './BaseAnchorForCommentsOnly';

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
 * This component acts as a switch between AnchorWithAuthToken and DefaultAnchor.
 * It is an optimization so that we can attach an auth token to a URL when one is required,
 * without using Onyx.connect on links that don't need an authToken.
 */
const AnchorForCommentsOnly = (props) => {
    const propsToPass = _.omit(props, 'isAuthTokenRequired');
    return props.isAuthTokenRequired
        // eslint-disable-next-line react/jsx-props-no-spreading
        ? <AnchorWithAuthToken {...propsToPass} />
        // eslint-disable-next-line react/jsx-props-no-spreading
        : <BaseAnchorForCommentsOnly {...propsToPass} />;
};

AnchorForCommentsOnly.propTypes = propTypes;
AnchorForCommentsOnly.defaultProps = defaultProps;
AnchorForCommentsOnly.displayName = 'AnchorForCommentsOnly';

export default AnchorForCommentsOnly;
