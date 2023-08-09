/*
 * The FocusTrap is only used on web and desktop
 */
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';

function FocusTrapView(props) {
    const viewProps = _.omit(props, ['enabled']);
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <View {...viewProps} />
    );
}

FocusTrapView.displayName = 'FocusTrapView';

export default FocusTrapView;
