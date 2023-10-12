import React, {useState, useEffect, useCallback} from 'react';
import {Dimensions, Keyboard, View} from 'react-native';
import * as StyleUtils from '../../styles/StyleUtils';
import {propTypes, defaultProps} from './BaseKeyboardSpacerPropTypes';

function BaseKeyboardSpacer(props) {
    const [keyboardSpace, setKeyboardSpace] = useState(0);

    /**
     * Update the height of Keyboard View.
     *
     * @param {Object} [event] - A Keyboard Event.
     */
    const updateKeyboardSpace = useCallback(
        (event) => {
            if (!event.endCoordinates) {
                return;
            }

            const screenHeight = Dimensions.get('window').height;
            const space = screenHeight - event.endCoordinates.screenY + props.topSpacing;
            setKeyboardSpace(space);
            props.onToggle(true, space);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    /**
     * Reset the height of Keyboard View.
     *
     * @param {Object} [event] - A Keyboard Event.
     */
    const resetKeyboardSpace = useCallback(() => {
        setKeyboardSpace(0);
        props.onToggle(false, 0);
    }, [setKeyboardSpace, props]);

    useEffect(() => {
        const updateListener = props.keyboardShowMethod;
        const resetListener = props.keyboardHideMethod;
        const keyboardListeners = [Keyboard.addListener(updateListener, updateKeyboardSpace), Keyboard.addListener(resetListener, resetKeyboardSpace)];

        return () => {
            keyboardListeners.forEach((listener) => listener.remove());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <View style={StyleUtils.getHeight(keyboardSpace)} />;
}

BaseKeyboardSpacer.defaultProps = defaultProps;
BaseKeyboardSpacer.propTypes = propTypes;

export default BaseKeyboardSpacer;
