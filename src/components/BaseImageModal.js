import React from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, Modal, TouchableOpacity, Dimensions, TouchableWithoutFeedback
} from 'react-native';
import BaseModalHeader from './BaseModalHeader';
import AttachmentView from './AttachmentView';
import styles, {webViewStyles} from '../styles/StyleSheet';
import {getAuthToken} from '../libs/API';

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

    // Is the image an expensify attachment
    isExpensifyAttachment: PropTypes.bool,
};

const defaultProps = {
    pinToEdges: true,
    modalWidth: Dimensions.get('window').width * 0.8,
    modalHeight: Dimensions.get('window').height * 0.8,
    modalImageWidth: Dimensions.get('window').width * 0.6,
    previewSourceURL: '',
    sourceURL: '',
    isExpensifyAttachment: true,
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
            previewSourceURL: this.props.previewSourceURL,
            sourceURL: this.props.sourceURL,
        };
    }

    componentDidMount() {
        // If the component unmounts by the time getSize() is finished, it will throw a warning
        // So this is to prevent setting state if the component isn't mounted
        this.isMounted = true;

        // If the images are expensify attachments, add an authtoken so we can access them
        if (this.props.isExpensifyAttachment) {
            this.setState({
                previewSourceURL: `${this.props.previewSourceURL}?authToken=${getAuthToken()}`,
                sourceURL: `${this.props.sourceURL}?authToken=${getAuthToken()}`
            });
        }

        // Scale image for thumbnail preview
        Image.getSize(this.state.previewSourceURL, (width, height) => {
            const screenWidth = 300;
            const scaleFactor = width / screenWidth;
            const imageHeight = height / scaleFactor;

            if (this.isMounted) {
                this.setState({thumbnailWidth: screenWidth, thumbnailHeight: imageHeight});
            }
        });
    }

    componentDidUpdate() {
        // Only calculate image size if the modal is visible and if we haven't already done this
        if (this.state.visible && !this.state.calculatedImageSize) {
            Image.getSize(this.state.sourceURL, (width, height) => {
                const screenWidth = this.props.pinToEdges ? Dimensions.get('window').width : this.props.modalImageWidth;
                const scaleFactor = width / screenWidth;
                const imageHeight = height / scaleFactor;

                if (this.isMounted) {
                    this.setState({imageWidth: screenWidth, imageHeight});
                }
            });
        }
    }

    componentWillUnmount() {
        this.isMounted = false;
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
                        source={{uri: this.state.previewSourceURL}}
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
                    {(this.props.pinToEdges) ? (
                        <View style={styles.imageModalContainer}>
                            <BaseModalHeader title="Attachment" setModalVisiblity={this.setModalVisiblity} />
                            <View style={styles.imageModalImageCenterContainer}>
                                <AttachmentView
                                    sourceURL={this.state.sourceURL}
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
                                            sourceURL={this.state.sourceURL}
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

export default BaseImageModal;
