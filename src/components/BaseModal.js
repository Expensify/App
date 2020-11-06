import React from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, Modal, TouchableOpacity, Text, Dimensions, TouchableWithoutFeedback
} from 'react-native';
import exitIcon from '../../assets/images/icon-x.png';
import styles from '../styles/StyleSheet';

/**
 * Modal component
 */

const propTypes = {
    // Should modal go full screen
    pinToEdges: PropTypes.bool,

    // Title of the modal
    title: PropTypes.string,

    // Visibility of modal
    visible: PropTypes.bool,

    // Width of the modal
    modalWidth: PropTypes.number,

    // Height of the modal
    modalHeight: PropTypes.number,

    // Method passed down to update visibility of the modal
    setModalVisiblity: PropTypes.func.isRequired,

    // Children of modal component
    children: PropTypes.func.isRequired,
};

const defaultProps = {
    pinToEdges: true,
    title: 'Attachment',
    visible: false,
    modalWidth: Dimensions.get('window').width * 0.8,
    modalHeight: Dimensions.get('window').height * 0.8,
};

function BaseModal(props) {
    const ModalHeader = (
        <View style={styles.imageModalHeader}>
            <View style={[
                styles.dFlex,
                styles.flexRow,
                styles.alignItemsCenter,
                styles.flexGrow1,
                styles.flexJustifySpaceBetween,
                styles.overflowHidden
            ]}
            >
                <View>
                    <Text numberOfLines={1} style={[styles.navText]}>{props.title}</Text>
                </View>
                <View style={[styles.reportOptions, styles.flexRow]}>
                    <TouchableOpacity
                        onPress={() => props.setModalVisiblity(false)}
                        style={[styles.touchableButtonImage, styles.mr0]}
                    >
                        <Image
                            resizeMode="contain"
                            style={[styles.LHNToggleIcon]}
                            source={exitIcon}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <Modal
            onRequestClose={() => props.setModalVisiblity(false)}
            visible={props.visible}
            transparent
        >
            {(props.pinToEdges) ? (
                <View style={styles.imageModalContainer}>
                    {ModalHeader}
                    <View style={styles.imageModalImageCenterContainer}>
                        {props.children}
                    </View>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.imageModalCenterContainer}
                    activeOpacity={1}
                    onPress={() => props.setModalVisiblity(false)}
                >
                    <TouchableWithoutFeedback style={{cursor: 'none'}}>
                        <View
                            style={{
                                ...styles.imageModalContainer,
                                width: props.modalWidth,
                                height: props.modalHeight
                            }}
                        >
                            {ModalHeader}
                            <View style={styles.imageModalImageCenterContainer}>
                                {props.children}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            )}
        </Modal>
    );
}

BaseModal.propTypes = propTypes;
BaseModal.defaultProps = defaultProps;

export default BaseModal;
