import React from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, Modal, TouchableOpacity, Dimensions, TouchableWithoutFeedback
} from 'react-native';
import BaseModalHeader from './BaseModalHeader';
import AttachmentView from './AttachmentView';
import styles from '../styles/StyleSheet';

/**
 * Modal component
 */

const propTypes = {
    // Should modal go full screen
    pinToEdges: PropTypes.bool,

    // Width of the modal
    modalWidth: PropTypes.number,

    // Height of the modal
    modalHeight: PropTypes.number,

    // URL to image preview
    previewSourceURL: PropTypes.string,

    // URL to full-sized image
    sourceURL: PropTypes.string,
};

const defaultProps = {
    pinToEdges: true,
    modalWidth: Dimensions.get('window').width * 0.8,
    modalHeight: Dimensions.get('window').height * 0.8,
    previewSourceURL: '',
    sourceURL: '',
};

class BaseImageModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            imageWidth: 200,
            imageHeight: 200,
            thumbnailWidth: 300,
            thumbnailHeight: 150,
            visible: false,
        };
    }

    componentDidMount() {
        // Scale image for modal view
        Image.getSize(this.props.sourceURL, (width, height) => {
            const screenWidth = Dimensions.get('window').width * 0.6;
            const scaleFactor = width / screenWidth;
            const newImageHeight = height / scaleFactor;
            this.setState({imageWidth: screenWidth, imageHeight: newImageHeight});
        });

        // Scale image for thumbnail preview
        Image.getSize(this.props.previewSourceURL, (width, height) => {
            const screenWidth = 300;
            const scaleFactor = width / screenWidth;
            const imageHeight = height / scaleFactor;
            this.setState({thumbnailWidth: screenWidth, thumbnailHeight: imageHeight});
        });
    }

    /**
     * Updates the visibility of the modal
     *
     * @param {Boolean} visibility
     */
    setModalVisiblity = (visibility) => {
        this.setState({visible: visibility});
    }

    render() {
        return (
            <>
                <TouchableOpacity onPress={() => this.setModalVisiblity(true)}>
                    <Image
                        source={{uri: this.props.previewSourceURL}}
                        style={{width: this.state.thumbnailWidth, height: this.state.thumbnailHeight}}
                    />
                </TouchableOpacity>

                <Modal
                    onRequestClose={() => this.setModalVisiblity(false)}
                    visible={this.state.visible}
                    transparent
                >
                    {(this.props.pinToEdges) ? (
                        <View style={styles.imageModalContainer}>
                            <BaseModalHeader title="Attachment" setModalVisiblity={this.setModalVisiblity} />
                            <View style={styles.imageModalImageCenterContainer}>
                                <AttachmentView
                                    sourceURL={this.props.sourceURL}
                                    imageHeight={this.state.imageHeight}
                                    imageWidth={this.state.imageWidth}
                                />
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.imageModalCenterContainer}
                            activeOpacity={1}
                            onPress={() => this.setModalVisiblity(false)}
                        >
                            <TouchableWithoutFeedback style={{cursor: 'none'}}>
                                <View
                                    style={{
                                        ...styles.imageModalContainer,
                                        width: this.props.modalWidth,
                                        height: this.props.modalHeight
                                    }}
                                >
                                    <BaseModalHeader title="Attachment" setModalVisiblity={this.setModalVisiblity} />
                                    <View style={styles.imageModalImageCenterContainer}>
                                        <AttachmentView
                                            sourceURL={this.props.sourceURL}
                                            imageHeight={this.state.imageHeight}
                                            imageWidth={this.state.imageWidth}
                                        />
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

BaseImageModal.propTypes = propTypes;
BaseImageModal.defaultProps = defaultProps;
BaseImageModal.displayName = 'BaseModal';

export default BaseImageModal;
