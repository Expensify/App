import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {getAutoGrowTextInputStyle, getHiddenElementOutsideOfWindow} from '../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import TextInputFocusable from './TextInputFocusable';

const propTypes = {

    // The value of the comment box
    value: PropTypes.string.isRequired,

    // A ref to forward to the text input
    forwardedRef: PropTypes.func.isRequired,

    // General styles to apply to the text input
    // eslint-disable-next-line react/forbid-prop-types
    inputStyle: PropTypes.object,

    // Styles to apply to the text input
    // eslint-disable-next-line react/forbid-prop-types
    textStyle: PropTypes.object.isRequired,

    /* Window Dimensions Props */
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    inputStyle: {},
};

class TextInputAutoGrow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            textInputWidth: 0,
        };
    }

    /**
     * Text input component doesn't support auto grow by default. We're using a hidden text input to achieve that.
     * This text view is used to calculate width of the input value given textStyle in this component.
     * This text component is intentionally positioned out of the screen.
     *
     * @returns {Text}
     */
    getHiddenTextView() {
        return (
            <Text
                style={[this.props.textStyle, getHiddenElementOutsideOfWindow(this.props.windowWidth)]}
                onLayout={e => this.setState({textInputWidth: e.nativeEvent.layout.width})}
            >
                {this.props.value}
            </Text>
        );
    }

    render() {
        const propsWithoutStyles = _.omit(
            this.props,
            ['inputStyle', 'textStyle', Object.keys(windowDimensionsPropTypes)],
        );
        return (
            <View>
                <TextInputFocusable
                    style={[this.props.inputStyle, getAutoGrowTextInputStyle(this.state.textInputWidth)]}
                    ref={this.props.forwardedRef}
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    {...propsWithoutStyles}
                />
                {this.getHiddenTextView()}
            </View>
        );
    }
}

TextInputAutoGrow.propTypes = propTypes;
TextInputAutoGrow.defaultProps = defaultProps;

const TextInputAutoGrowWithWindowDimensions = withWindowDimensions(TextInputAutoGrow);

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <TextInputAutoGrowWithWindowDimensions {...props} forwardedRef={ref} />
));
