import React from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, TouchableOpacity, Dimensions
} from 'react-native';
import Modal from 'react-native-modal';
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

    // Title of the modal header
    modalTitle: PropTypes.string,

    // URL to image preview
    previewSourceURL: PropTypes.string,

    // URL to full-sized image
    sourceURL: PropTypes.string,
};

const defaultProps = {
    pinToEdges: false,

    // If pinToEdges is false, the default modal width and height will take up about 80% of the screen
    modalWidth: Dimensions.get('window').width * 0.8,
    modalHeight: Dimensions.get('window').height * 0.8,

    // The image inside the modal shouldn't span the entire width of the modal
    // unless it is full screen so the default is 20% smaller than the width of the modal
    modalImageWidth: Dimensions.get('window').width * 0.6,
    modalTitle: '',
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
            isModalOpen: false,
        };

        this.setModalVisiblity = this.setModalVisiblity.bind(this);

        // Property to check if we have already calculated the image size for inside the modal
        // so we don't need to grab the image and resize it again
        this.calculatedModalImageSize = false;
    }

    componentDidMount() {
        // If the component unmounts by the time getSize() is finished, it will throw a warning
        // So this is to prevent setting state if the component isn't mounted
        this.isComponentMounted = true;

        // Scale image for thumbnail preview
        Image.getSize(this.props.previewSourceURL, (width, height) => {
            // Width of the thumbnail works better as a constant than it does
            // a percentage of the screen width since it is relative to each screen
            const thumbnailScreenWidth = 250;
            const scaleFactor = width / thumbnailScreenWidth;
            const imageHeight = height / scaleFactor;

            if (this.isComponentMounted) {
                this.setState({thumbnailWidth: thumbnailScreenWidth, thumbnailHeight: imageHeight});
            }
        });
    }

    componentDidUpdate() {
        // Only calculate image size if the modal is visible and if we haven't already done this
        if (this.state.isModalOpen && !this.calculatedModalImageSize) {
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
                    this.setState({imageWidth, imageHeight});
                    this.calculatedModalImageSize = true;
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
        this.setState({isModalOpen: visibility});
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
                    visible={this.state.isModalOpen}
                    transparent
                    style={styles.m0}
                >
                    <ModalView
                        pinToEdges={this.props.pinToEdges}
                        modalWidth={this.props.modalWidth}
                        modalHeight={this.props.modalHeight}
                        modalTitle={this.props.modalTitle}
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
