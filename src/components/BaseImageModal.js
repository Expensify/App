import React from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, Modal, TouchableOpacity, Dimensions
} from 'react-native';
import AttachmentView from './AttachmentView';
import styles, {webViewStyles} from '../styles/StyleSheet';
import ModalView from './ModalView';

/**
 * Modal component consisting of an image thumbnail which triggers a modal with a larger image display
 * Used for smaller image previews that also need to be viewed full-sized like in report comments
 */

const propTypes = {
    // Should modal go full screen
    pinToEdges: PropTypes.bool,

    // Width of the modal
    modalWidth: PropTypes.number,

    // Height of the modal
    modalHeight: PropTypes.number,

    // Width of image inside the modal
    modalImageWidth: PropTypes.number,

    // URL to image preview
    previewSourceURL: PropTypes.string,

    // URL to full-sized image
    sourceURL: PropTypes.string,
};

const defaultProps = {
    pinToEdges: false,
    modalWidth: Dimensions.get('window').width * 0.8,
    modalHeight: Dimensions.get('window').height * 0.8,
    modalImageWidth: Dimensions.get('window').width * 0.6,
    previewSourceURL: '',
    sourceURL: '',
};

class BaseImageModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            imageWidth: 300,
            imageHeight: 300,
            thumbnailWidth: 200,
            thumbnailHeight: 200,
            visible: false,
            calculatedImageSize: false,
        };
    }

    componentDidMount() {
        // If the component unmounts by the time getSize() is finished, it will throw a warning
        // So this is to prevent setting state if the component isn't mounted
        this.isComponentMounted = true;

        // Scale image for thumbnail preview
        Image.getSize(this.props.previewSourceURL, (width, height) => {
            const screenWidth = 250;
            const scaleFactor = width / screenWidth;
            const imageHeight = height / scaleFactor;

            if (this.isComponentMounted) {
                this.setState({thumbnailWidth: screenWidth, thumbnailHeight: imageHeight});
            }
        });
    }

    componentDidUpdate() {
        // Only calculate image size if the modal is visible and if we haven't already done this
        if (this.state.visible && !this.state.calculatedImageSize) {
            Image.getSize(this.props.sourceURL, (width, height) => {
                const modalWidth = this.props.pinToEdges ? Dimensions.get('window').width : this.props.modalImageWidth;
                let imageHeight = height;
                let imageWidth = width;

                // Only resize if the image width is larger than the modal width
                if (width > modalWidth) {
                    const scaleFactor = width / modalWidth;
                    imageHeight = height / scaleFactor;
                    imageWidth = modalWidth;
                }

                if (this.isComponentMounted) {
                    this.setState({imageWidth, imageHeight, calculatedImageSize: true});
                }
            });
        }
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
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
        return (
            <>
                <TouchableOpacity onPress={() => this.setModalVisiblity(true)}>
                    <Image
                        source={{uri: this.props.previewSourceURL}}
                        style={{
                            ...webViewStyles.tagStyles.img,
                            width: this.state.thumbnailWidth,
                            height: this.state.thumbnailHeight
                        }}
                    />
                </TouchableOpacity>

                <Modal
                    onRequestClose={() => this.setModalVisiblity(false)}
                    visible={this.state.visible}
                    transparent
                >
                    <ModalView
                        pinToEdges={this.props.pinToEdges}
                        modalWidth={this.props.modalWidth}
                        modalHeight={this.props.modalHeight}
                        onCloseButtonPress={() => this.setModalVisiblity(false)}
                    >
                        <View style={styles.imageModalImageCenterContainer}>
                            <AttachmentView
                                sourceURL={this.props.sourceURL}
                                imageHeight={this.state.imageHeight}
                                imageWidth={this.state.imageWidth}
                            />
                        </View>
                    </ModalView>
                </Modal>
            </>
        );
    }
}

BaseImageModal.propTypes = propTypes;
BaseImageModal.defaultProps = defaultProps;

export default BaseImageModal;
