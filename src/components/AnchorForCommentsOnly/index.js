import React from 'react';
import {View} from 'react-native';
import * as anchorForCommentsOnlyPropTypes from './anchorForCommentsOnlyPropTypes';
import BaseAnchorForCommentsOnly from './BaseAnchorForCommentsOnly';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import ControlSelection from '../../libs/ControlSelection';
import styles from '../../styles/styles';

function AnchorForCommentsOnly(props) {
    return (
        <View style={styles.dInline}>
            <BaseAnchorForCommentsOnly
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                onPressOut={() => ControlSelection.unblock()}
            />
        </View>
    );
}

AnchorForCommentsOnly.propTypes = anchorForCommentsOnlyPropTypes.propTypes;
AnchorForCommentsOnly.defaultProps = anchorForCommentsOnlyPropTypes.defaultProps;
AnchorForCommentsOnly.displayName = 'AnchorForCommentsOnly';

export default AnchorForCommentsOnly;
