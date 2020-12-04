import React from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, TouchableOpacity, Dimensions
} from 'react-native';
import Modal from 'react-native-modal';
import {withOnyx} from 'react-native-onyx';
import AttachmentView from './AttachmentView';
import styles, {webViewStyles} from '../styles/StyleSheet';
import ModalView from './ModalView';
import ONYXKEYS from '../ONYXKEYS';

/**
 * Modal component consisting of an image thumbnail which triggers a modal with a larger image display
 * Used for smaller image previews that also need to be viewed full-sized like in report comments
 */

const DEFUALT_IMAGE_SIZE = 300;
const DEFUALT_THUMBNAIL_SIZE = 250;

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

    // Current user session
    session: PropTypes.shape({
        authToken: PropTypes.string.isRequired,
    }).isRequired,

    // Do the urls require an authToken?
    isAuthTokenRequired: PropTypes.bool.isRequired,
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
            imageWidth: DEFUALT_IMAGE_SIZE,
            imageHeight: DEFUALT_IMAGE_SIZE,
            thumbnailWidth: DEFUALT_THUMBNAIL_SIZE,
            thumbnailHeight: DEFUALT_THUMBNAIL_SIZE,
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
        Image.getSize(this.addAuthTokenToURL(this.props.previewSourceURL), (width, height) => {
            // Width of the thumbnail works better as a constant than it does
            // a percentage of the screen width since it is relative to each screen
            const thumbnailScreenWidth = DEFUALT_THUMBNAIL_SIZE;
            const scaleFactor = width / thumbnailScreenWidth;

            // Fall back to default thumbnail size to prevent divide-by-zero error if image fails to load
            const imageHeight = (height / scaleFactor) || DEFUALT_THUMBNAIL_SIZE;

            if (this.isComponentMounted) {
                this.setState({thumbnailWidth: thumbnailScreenWidth, thumbnailHeight: imageHeight});
            }
        });
    }

    componentDidUpdate() {
        // Only calculate image size if the modal is visible and if we haven't already done this
        if (this.state.isModalOpen && !this.calculatedModalImageSize) {
            Image.getSize(this.addAuthTokenToURL(this.props.sourceURL), (width, height) => {
                // Unlike the image width, we do allow the image to span the full modal height
                const modalHeight = this.props.pinToEdges
                    ? Dimensions.get('window').height
                    : this.props.modalHeight - (styles.modalHeaderBar.height || 0);
                const modalWidth = this.props.pinToEdges ? Dimensions.get('window').width : this.props.modalImageWidth;
                let imageHeight = height;
                let imageWidth = width;

                // Resize image to fit within the modal, if necessary
                if (width > modalWidth || height > modalHeight) {
                    const scaleFactor = Math.max(width / modalWidth, height / modalHeight);

                    // Fallback to default size to prevent divide-by-zero error if for some reason the image didn't load
                    imageHeight = height / scaleFactor || DEFUALT_IMAGE_SIZE;
                    imageWidth = width / scaleFactor || DEFUALT_IMAGE_SIZE;
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

    /**
     * Add authToken to this attachment URL if necessary
     *
     * @param {String} url
     * @returns {String}
     */
    addAuthTokenToURL(url) {
        return this.props.isAuthTokenRequired
            ? `${url}?authToken=${this.props.session.authToken}`
            : url;
    }

    render() {
        return (
            <>
                <TouchableOpacity onPress={() => this.setModalVisiblity(true)}>
                    <Image
                        source={{uri: this.addAuthTokenToURL(this.props.previewSourceURL)}}
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
                                sourceURL={this.addAuthTokenToURL(this.props.sourceURL)}
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

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(BaseImageModal);
