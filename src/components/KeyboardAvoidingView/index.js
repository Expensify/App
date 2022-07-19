/*
 * This is a KeyboardAvoidingView only enabled for ios && disabled for all other platforms
 */
import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.node,
};
const defaultProps = {
    children: null,
};

const KeyboardAvoidingView = props => {
    return props.children;
}

KeyboardAvoidingView.propTypes = propTypes;
KeyboardAvoidingView.defaultProps = defaultProps;
KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';
export default KeyboardAvoidingView;
