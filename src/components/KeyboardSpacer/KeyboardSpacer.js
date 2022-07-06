// Adapted from https://github.com/Andr3wHur5t/react-native-keyboard-spacer/blob/master/KeyboardSpacer.js

/* eslint-disable no-mixed-operators, no-underscore-dangle, react/prop-types, react/static-property-placement */
/**
 * Created by andrewhurst on 10/5/15.
 */
import React, {Component} from 'react';
import {
    Keyboard,
    LayoutAnimation,
    View,
    Dimensions,
    Platform,
    StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
    container: {
        left: 0,
        right: 0,
        bottom: 0,
    },
});

// From: https://medium.com/man-moon/writing-modern-react-native-ui-e317ff956f02
const defaultAnimation = {
    duration: 500,
    create: {
        duration: 300,
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
    },
    update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 200,
    },
};

export default class KeyboardSpacer extends Component {
  static defaultProps = {
      topSpacing: 0,
      onToggle: () => null,
  };

  constructor(props, context) {
      super(props, context);
      this.state = {
          keyboardSpace: 0,
      };
      this._listeners = null;
      this.updateKeyboardSpace = this.updateKeyboardSpace.bind(this);
      this.resetKeyboardSpace = this.resetKeyboardSpace.bind(this);
  }

  componentDidMount() {
      const updateListener = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
      const resetListener = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
      this._listeners = [
          Keyboard.addListener(updateListener, this.updateKeyboardSpace),
          Keyboard.addListener(resetListener, this.resetKeyboardSpace),
      ];
  }

  componentWillUnmount() {
      this._listeners.forEach(listener => listener.remove());
  }

  updateKeyboardSpace(event) {
      if (!event.endCoordinates) {
          return;
      }

      let animationConfig = defaultAnimation;
      if (Platform.OS === 'ios') {
          animationConfig = LayoutAnimation.create(
              event.duration,
              LayoutAnimation.Types[event.easing],
              LayoutAnimation.Properties.opacity,
          );
      }
      LayoutAnimation.configureNext(animationConfig);

      // get updated on rotation
      const screenHeight = Dimensions.get('window').height;

      // when external physical keyboard is connected
      // event.endCoordinates.height still equals virtual keyboard height
      // however only the keyboard toolbar is showing if there should be one
      const keyboardSpace = screenHeight - event.endCoordinates.screenY + this.props.topSpacing;
      this.setState(
          {
              keyboardSpace,
          },
          this.props.onToggle(true, keyboardSpace),
      );
  }

  resetKeyboardSpace(event) {
      let animationConfig = defaultAnimation;
      if (Platform.OS === 'ios') {
          animationConfig = LayoutAnimation.create(
              event.duration,
              LayoutAnimation.Types[event.easing],
              LayoutAnimation.Properties.opacity,
          );
      }
      LayoutAnimation.configureNext(animationConfig);

      this.setState(
          {
              keyboardSpace: 0,
          },
          this.props.onToggle(false, 0),
      );
  }

  render() {
      return (
          <View
              style={[
                  styles.container,
                  {height: this.state.keyboardSpace},
                  this.props.style,
              ]}
          />
      );
  }
}
