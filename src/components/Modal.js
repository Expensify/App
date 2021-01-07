import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, Dimensions} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import CustomStatusBar from './CustomStatusBar';
import KeyboardShortcut from '../libs/KeyboardShortcut';
import styles, {getSafeAreaPadding} from '../styles/styles';
import themeColors from '../styles/themes/default';
import getModalStyles from '../styles/getModalStyles';
import CONST from '../CONST';

const propTypes = {
    // Callback method fired when the user requests to close the modal
    onClose: PropTypes.func.isRequired,

    // State that determines whether to display the modal or not
    isVisible: PropTypes.bool.isRequired,

    // Modal contents
    children: PropTypes.node.isRequired,

    // Style of modal to display
    type: PropTypes.oneOf([
        CONST.MODAL.MODAL_TYPE.CENTERED,
    ]),
};

const defaultProps = {
    type: '',
};

class Modal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            window: Dimensions.get('window'),
        };

        this.onDimensionChange = this.onDimensionChange.bind(this);
    }

    componentDidMount() {
        KeyboardShortcut.subscribe('Escape', this.props.onClose, [], true);
        Dimensions.addEventListener('change', this.onDimensionChange);
    }

    componentWillUnmount() {
        KeyboardShortcut.unsubscribe('Escape');
        Dimensions.removeEventListener('change', this.onDimensionChange);
    }

    /**
     * Stores the application window's width and height in a component state variable.
     * Called each time the application's window dimensions or screen dimensions change.
     * @link https://reactnative.dev/docs/dimensions
     * @param {Object} newDimensions Dimension object containing updated window and screen dimensions
     */
    onDimensionChange(newDimensions) {
        const {window} = newDimensions;
        this.setState({window});
    }

    render() {
        const {
            modalStyle,
            modalContainerStyle,
            swipeDirection,
            animationIn,
            animationOut,
            needsSafeAreaPadding,
        } = getModalStyles(this.props.type, this.state.window);
        return (
            <ReactNativeModal
                onBackdropPress={this.props.onClose}
                onBackButtonPress={this.props.onClose}
                onSwipeComplete={this.props.onClose}
                swipeDirection={swipeDirection}
                isVisible={this.props.isVisible}
                backdropColor={themeColors.modalBackdrop}
                backdropOpacity={0.5}
                backdropTransitionOutTiming={0}
                style={modalStyle}
                animationIn={animationIn}
                animationOut={animationOut}
            >
                <CustomStatusBar />
                <SafeAreaInsetsContext.Consumer>
                    {(insets) => {
                        const {paddingTop, paddingBottom} = getSafeAreaPadding(insets);
                        return (
                            <View
                                style={{
                                    ...styles.defaultModalContainer,
                                    paddingBottom,
                                    ...modalContainerStyle,

                                    // This padding is based on the insets and could not neatly be
                                    // returned by getModalStyles to avoid passing this inline.
                                    paddingTop: needsSafeAreaPadding ? paddingTop : 20,
                                }}
                            >
                                {this.props.children}
                            </View>
                        );
                    }}
                </SafeAreaInsetsContext.Consumer>
            </ReactNativeModal>
        );
    }
}

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;
Modal.displayName = 'Modal';
export default Modal;
