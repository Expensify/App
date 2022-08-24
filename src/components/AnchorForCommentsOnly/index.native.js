import React from 'react';
import {Linking} from 'react-native';
import _ from 'underscore';

import * as anchorForCommentsOnlyPropTypes from './anchorForCommentsOnlyPropTypes';
import BaseAnchorForCommentsOnly from './BaseAnchorForCommentsOnly';

// eslint-disable-next-line react/jsx-props-no-spreading
const AnchorForCommentsOnly = (props) => {
    const onPress = () => (_.isFunction(props.onPress) ? props.onPress() : Linking.openURL(props.href));

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <BaseAnchorForCommentsOnly {...props} onPress={onPress} />;
};

AnchorForCommentsOnly.propTypes = anchorForCommentsOnlyPropTypes.propTypes;
AnchorForCommentsOnly.defaultProps = anchorForCommentsOnlyPropTypes.defaultProps;
AnchorForCommentsOnly.displayName = 'AnchorForCommentsOnly';

export default AnchorForCommentsOnly;
