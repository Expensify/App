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

    // Children of modal component
    children: PropTypes.func.isRequired,

};

const defaultProps = {
    pinToEdges: true,
    title: 'Attachment',
    visible: 'false',
};

class BaseModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
        };
    }

    /**
     * Updates the visibility of the modal
     *
     * @param {Boolean} visibility
     */
    setModalVisiblity(visibility) {
        this.setState({visible: visibility});
    }

    render() {
        // Generate height/width for modal
        const modalWidth = Dimensions.get('window').width * 0.8;
        const modalHeight = Dimensions.get('window').height * 0.8;

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
                        <Text numberOfLines={1} style={[styles.navText]}>{this.props.title}</Text>
                    </View>
                    <View style={[styles.reportOptions, styles.flexRow]}>
                        <TouchableOpacity
                            onPress={() => this.setModalVisiblity(false)}
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
            <>
                <Modal
                    onRequestClose={() => this.setModalVisiblity(false)}
                    visible={this.state.visible}
                    transparent
                >
                    {(this.props.pinToEdges) ? (
                        <View style={styles.imageModalContainer}>
                            {ModalHeader}
                            <View style={styles.imageModalImageCenterContainer}>
                                {this.props.children}
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.imageModalCenterContainer}
                            activeOpacity={1}
                            onPress={() => this.setModalVisiblity(false)}
                        >
                            <TouchableWithoutFeedback style={{cursor: 'none'}}>
                                <View style={{...styles.imageModalContainer, width: modalWidth, height: modalHeight}}>
                                    {ModalHeader}
                                    <View style={styles.imageModalImageCenterContainer}>
                                        {this.props.children}
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </TouchableOpacity>
                    )}
                </Modal>
            </>
        );
    }
}

BaseModal.propTypes = propTypes;
BaseModal.defaultProps = defaultProps;

export default BaseModal;
