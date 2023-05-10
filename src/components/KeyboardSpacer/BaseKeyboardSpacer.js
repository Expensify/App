import React, {PureComponent} from 'react';
import {
    Dimensions, Keyboard, View,
} from 'react-native';
import * as StyleUtils from '../../styles/StyleUtils';
import {propTypes, defaultProps} from './BaseKeyboardSpacerPropTypes';

class BaseKeyboardSpacer extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            keyboardSpace: 0,
        };
        this.keyboardListeners = null;
        this.updateKeyboardSpace = this.updateKeyboardSpace.bind(this);
        this.resetKeyboardSpace = this.resetKeyboardSpace.bind(this);
    }

    componentDidMount() {
        const updateListener = this.props.keyboardShowMethod;
        const resetListener = this.props.keyboardHideMethod;
        this.keyboardListeners = [
            Keyboard.addListener(updateListener, this.updateKeyboardSpace),
            Keyboard.addListener(resetListener, this.resetKeyboardSpace),
        ];
    }

    componentWillUnmount() {
        this.keyboardListeners.forEach(listener => listener.remove());
    }

    /**
     * Update the height of Keyboard View.
     *
     * @param {Object} [event] - A Keyboard Event.
     */
    updateKeyboardSpace(event) {
        if (!event.endCoordinates) {
            return;
        }

        const screenHeight = Dimensions.get('window').height;
        const keyboardSpace = (screenHeight - event.endCoordinates.screenY) + this.props.topSpacing;
        this.setState({
            keyboardSpace,
        }, this.props.onToggle(true, keyboardSpace));
    }

    /**
     * Reset the height of Keyboard View.
     *
     * @param {Object} [event] - A Keyboard Event.
     */
    resetKeyboardSpace() {
        this.setState({
            keyboardSpace: 0,
        }, this.props.onToggle(false, 0));
    }

    render() {
        return (
            <View style={StyleUtils.getHeight(this.state.keyboardSpace)} />
        );
    }
}

BaseKeyboardSpacer.defaultProps = defaultProps;
BaseKeyboardSpacer.propTypes = propTypes;

export default BaseKeyboardSpacer;
