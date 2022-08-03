import React, {PureComponent} from 'react';
import {
    Dimensions,
    Keyboard,
    LayoutAnimation,
    View,
} from 'react-native';
import {
    propTypes as keyboardSpacerPropTypes,
    defaultProps as keyboardSpacerDefaultProps,
    defaultAnimation as keyboardSpacerDefaultAnimation,
} from './KeyboardSpacerPropTypes';
import styles from '../../styles/styles';

const defaultAnimation = {
    ...keyboardSpacerDefaultAnimation,
};

const propTypes = {
    ...keyboardSpacerPropTypes,
};

const defaultProps = {
    ...keyboardSpacerDefaultProps,
};

class ReactNativeKeyboardSpacer extends PureComponent {
    constructor(props, context) {
        super(props, context);
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

    updateKeyboardSpace(event) {
        if (!event.endCoordinates) {
            return;
        }

        let animationConfig = defaultAnimation;
        if (this.props.iOSAnimated) {
            animationConfig = LayoutAnimation.create(
                event.duration,
                LayoutAnimation.Types[event.easing],
                LayoutAnimation.Properties.opacity,
            );
        }
        LayoutAnimation.configureNext(animationConfig);
        const screenHeight = Dimensions.get('window').height;
        const keyboardSpace = (screenHeight - event.endCoordinates.screenY) + this.props.topSpacing;
        this.setState({
            keyboardSpace,
        }, this.props.onToggle(true, keyboardSpace));
    }

    resetKeyboardSpace(event) {
        let animationConfig = defaultAnimation;
        if (this.props.iOSAnimated) {
            animationConfig = LayoutAnimation.create(
                event.duration,
                LayoutAnimation.Types[event.easing],
                LayoutAnimation.Properties.opacity,
            );
        }
        LayoutAnimation.configureNext(animationConfig);

        this.setState({
            keyboardSpace: 0,
        }, this.props.onToggle(false, 0));
    }

    render() {
        return (
            <View
                style={[
                    styles.keyboardSpacerContain,
                    {height: this.state.keyboardSpace},
                    this.props.style,
                ]}
            />
        );
    }
}

ReactNativeKeyboardSpacer.defaultProps = defaultProps;
ReactNativeKeyboardSpacer.propTypes = propTypes;
export default ReactNativeKeyboardSpacer;
