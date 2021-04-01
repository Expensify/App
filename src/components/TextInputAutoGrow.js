import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../styles/styles';
import TextInputFocusable from './TextInputFocusable';

const propTypes = {

    // The value of the comment box
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    // A ref to forward to the text input
    forwardedRef: PropTypes.func.isRequired,

    // General styles to apply to the text input
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    // Styles to apply to the text input
    // eslint-disable-next-line react/forbid-prop-types
    textStyle: PropTypes.any.isRequired,
};

const defaultProps = {
    value: undefined,
    style: null,
};

class TextInputAutoGrow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            textInputWidth: 0,
        };
    }

    render() {
        const propsWithoutStyles = _.omit(this.props, ['style', 'textStyle']);
        const widthStyle = {width: Math.max(5, this.state.textInputWidth)};
        return (
            <View>
                <TextInputFocusable
                    style={[this.props.style, widthStyle]}
                    ref={this.props.forwardedRef}
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    {...propsWithoutStyles}
                />
                <Text
                    style={[this.props.textStyle, styles.autoGrowTextInputHiddenText]}
                    onLayout={e => this.setState({textInputWidth: e.nativeEvent.layout.width})}
                >
                    {this.props.value}
                </Text>
            </View>
        );
    }
}

TextInputAutoGrow.propTypes = propTypes;
TextInputAutoGrow.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <TextInputAutoGrow {...props} forwardedRef={ref} />
));
