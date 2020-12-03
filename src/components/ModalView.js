import React from 'react';
import PropTypes from 'prop-types';
import {
    View, SafeAreaView, TouchableOpacity, Dimensions, TouchableWithoutFeedback
} from 'react-native';
import BaseModalHeader from './BaseModalHeader';
import styles from '../styles/StyleSheet';

/**
 * Renders an adjustable modal view and the children inside of it
 * This component should be placed inside of a <Modal> component for adjusting view of the modal
 */

const propTypes = {
    // Should modal go full screen
    pinToEdges: PropTypes.bool,

    // Width of the modal if it isn't full screen
    modalWidth: PropTypes.number,

    // Height of the modal if it isn't full screen
    modalHeight: PropTypes.number,

    // Method to trigger when pressing close button of the modal
    onCloseButtonPress: PropTypes.func,

    // Title of the modal header
    modalTitle: PropTypes.string,

    // Any children to display
    children: PropTypes.node,
};

const defaultProps = {
    pinToEdges: false,
    modalWidth: Dimensions.get('window').width - 100,
    modalHeight: Dimensions.get('window').height - 100,
    onCloseButtonPress: () => {},
    modalTitle: '',
    children: null,
};

const ModalView = props => (
    <>
        {props.pinToEdges ? (
            <SafeAreaView style={styles.modalViewContainer}>
                <BaseModalHeader
                    title={props.modalTitle}
                    onCloseButtonPress={props.onCloseButtonPress}
                />
                {props.children}
            </SafeAreaView>
        ) : (
            <TouchableOpacity
                style={styles.modalCenterContentContainer}
                activeOpacity={1}
                onPress={props.onCloseButtonPress}
            >
                <TouchableWithoutFeedback>
                    <View
                        style={{
                            ...styles.modalViewContainer,
                            width: props.modalWidth,
                            height: props.modalHeight
                        }}
                    >
                        <BaseModalHeader
                            title={props.modalTitle}
                            onCloseButtonPress={props.onCloseButtonPress}
                        />
                        {props.children}
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        )}
    </>
);

ModalView.propTypes = propTypes;
ModalView.defaultProps = defaultProps;
ModalView.displayName = 'ModalView';

export default ModalView;
