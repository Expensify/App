import React from 'react';
import {TextInput} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';

const propTypes = {
    // A ref to forward to the text input
    forwardedRef: PropTypes.func.isRequired,
};

/**
 * On native layers we like to have the Text Input not focused so the user can read new chats without they keyboard in
 * the way of the view
 */
class TextInputFocusable extends React.Component {
    componentDidMount() {
        // This callback prop is used by the parent component using the constructor to
        // get a ref to the inner textInput element e.g. if we do
        // <constructor ref={el => this.textInput = el} /> this will not
        // return a ref to the component, but rather the HTML element by default
        if (this.props.forwardedRef && _.isFunction(this.props.forwardedRef)) {
            this.props.forwardedRef(this.textInput);
        }
    }

    clearContent() {
        this.clear();
    }

    render() {
        return (
            <TextInput
                ref={el => this.textInput = el}
                maxHeight={116}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...this.props}
            />
        );
    }
}

TextInputFocusable.displayName = 'TextInputFocusable';
TextInputFocusable.propTypes = propTypes;

// export default TextInputFocusable;
export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <TextInputFocusable {...props} forwardedRef={ref} />
));
