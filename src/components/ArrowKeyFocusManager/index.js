import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import BaseArrowKeyFocusManager from './BaseArrowKeyFocusManager';
import {arrowKeyFocusManagerDefaultProps, arrowKeyFocusManagerPropTypes} from './propTypes';

function ArrowKeyFocusManager(props) {
    const isFocused = useIsFocused();

    return (
        <BaseArrowKeyFocusManager
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isFocused={isFocused}
        />
    );
}

ArrowKeyFocusManager.propTypes = arrowKeyFocusManagerPropTypes;
ArrowKeyFocusManager.defaultProps = arrowKeyFocusManagerDefaultProps;
ArrowKeyFocusManager.displayName = 'ArrowKeyFocusManager';

export default ArrowKeyFocusManager;
