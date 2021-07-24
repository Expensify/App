import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles, {getAutoGrowTextInputStyle} from '../styles/styles';
import Text from './Text';
import TextInputFocusable from './TextInputFocusable';

const propTypes = {
    /** The value of the comment box */
    value: PropTypes.string.isRequired,

    /** A ref to forward to the text input */
    forwardedRef: PropTypes.func.isRequired,

    /** General styles to apply to the text input */
    // eslint-disable-next-line react/forbid-prop-types
    inputStyle: PropTypes.object,

    /** Styles to apply to the text input */
    // eslint-disable-next-line react/forbid-prop-types
    textStyle: PropTypes.object.isRequired,

    /** Optional placeholder to show when there is no value */
    placeholder: PropTypes.string,
};

const defaultProps = {
    inputStyle: {},
    placeholder: '',
};

class TextInputAutoWidth extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            textInputWidth: 0,
        };
    }

    render() {
        const propsWithoutStyles = _.omit(this.props, ['inputStyle', 'textStyle']);
        return (
            <>
                <View>
                    <TextInputFocusable
                        style={[this.props.inputStyle, getAutoGrowTextInputStyle(this.state.textInputWidth)]}
                        ref={this.props.forwardedRef}
                        /* eslint-disable-next-line react/jsx-props-no-spreading */
                        {...propsWithoutStyles}
                    />
                </View>
                {/*
                Text input component doesn't support auto grow by default.
                We're using a hidden text input to achieve that.
                This text view is used to calculate width of the input value given textStyle in this component.
                This text component is intentionally positioned out of the screen.
                */}
                <Text
                    style={[this.props.textStyle, styles.hiddenElementOutsideOfWindow]}
                    onLayout={e => this.setState({textInputWidth: e.nativeEvent.layout.width})}
                >
                    {this.props.value || this.props.placeholder}
                </Text>
            </>
        );
    }
}

TextInputAutoWidth.propTypes = propTypes;
TextInputAutoWidth.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <TextInputAutoWidth {...props} forwardedRef={ref} />
));
