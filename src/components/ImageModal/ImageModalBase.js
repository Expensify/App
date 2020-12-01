import React, {Component} from 'react';
import Modal from 'react-native-modal';
import PropTypes from 'prop-types';
import {
    View, Dimensions, TouchableOpacity, Text, Image
} from 'react-native';
import AttachmentView from '../AttachmentView';
import styles, {colors} from '../../styles/StyleSheet';
import ModalView from '../ModalView';
import ModalHeader from '../ModalHeader';

/**
 * Modal component consisting of an image thumbnail which triggers a modal with a larger image display
 * Used for smaller image previews that also need to be viewed full-sized like in report comments
 */

const propTypes = {
    // Should modal go full screen
    pinToEdges: PropTypes.bool,

    // Title of the modal header
    title: PropTypes.string,

    // Optional source URL for the image shown inside the .
    // If not passed in via props must be specified when modal is opened.
    sourceURL: PropTypes.string,

    // Optional callback to fire when we want to preview an image and approve it for use.
    onConfirm: PropTypes.func,

    // A function as a child to pass modal launching methods to
    children: PropTypes.func.isRequired,
};

const defaultProps = {
    pinToEdges: false,
    title: '',
    sourceURL: null,
    onConfirm: null,
};

class ImageModal extends Component {
    constructor(props) {
        super(props);

        // If pinToEdges is false, the default modal width and height will take up about 80% of the screen
        this.modalWidth = Dimensions.get('window').width * 0.8;
        this.modalHeight = Dimensions.get('window').height * 0.8;

        // The image inside the modal shouldn't span the entire width of the modal
        // unless it is full screen so the default is 20% smaller than the width of the modal
        this.modalImageWidth = Dimensions.get('window').width * 0.6;

        this.state = {
            isModalOpen: false,
            imageWidth: 300,
            imageHeight: 300,
            file: null,
            sourceURL: props.sourceURL,
        };
    }

    componentDidMount() {
        this.isComponentMounted = true;
        this.calculateImageSize();
    }

    componentDidUpdate(prevProps, prevState) {
        // Only calculate image size if the source has changed
        if (!prevState.sourceURL !== this.state.sourceURL) {
            this.calculateImageSize();
        }
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
    }

    /**
     * Preloads the image by getting the size and setting dimensions to state.
     */
    calculateImageSize() {
        if (!this.state.sourceURL) {
            return;
        }

        Image.getSize(this.state.sourceURL, (width, height) => {
            // Unlike the image width, we do allow the image to span the full modal height
            const modalHeight = this.props.pinToEdges
                ? Dimensions.get('window').height
                : this.modalHeight - (styles.modalHeaderBar.height || 0);
            const modalWidth = this.props.pinToEdges ? Dimensions.get('window').width : this.modalImageWidth;
            let imageHeight = height;
            let imageWidth = width;

            // Resize image to fit within the modal, if necessary
            if (width > modalWidth || height > modalHeight) {
                const scaleFactor = Math.max(width / modalWidth, height / modalHeight);
                imageHeight = height / scaleFactor;
                imageWidth = width / scaleFactor;
            }

            if (this.isComponentMounted) {
                this.setState({imageWidth, imageHeight});
            }
        });
    }

    render() {
        return (
            <>
                <Modal
                    onRequestClose={() => this.setState({isModalOpen: false})}
                    visible={this.state.isModalOpen}
                    transparent
                    style={styles.m0}
                >
                    <ModalView
                        pinToEdges={this.props.pinToEdges}
                        modalWidth={this.modalWidth}
                        modalHeight={this.modalHeight}
                        onCloseButtonPress={() => this.setState({isModalOpen: false})}
                    >
                        <ModalHeader
                            title={this.props.title}
                            onCloseButtonPress={() => this.setState({isModalOpen: false})}
                        />
                        <View style={styles.imageModalImageCenterContainer}>
                            {this.state.sourceURL && (
                                <AttachmentView
                                    sourceURL={this.state.sourceURL}
                                    imageHeight={this.state.imageHeight}
                                    imageWidth={this.state.imageWidth}
                                />
                            )}
                        </View>
                        {/* If we have an onConfirm method show a confirmation button */}
                        {this.props.onConfirm && (
                            <TouchableOpacity
                                style={[styles.button, styles.buttonSuccess, styles.buttonConfirm]}
                                underlayColor={colors.componentBG}
                                onPress={() => {
                                    this.props.onConfirm(this.state.file);
                                    this.setState({isModalOpen: false});
                                }}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        styles.buttonSuccessText
                                    ]}
                                >
                                    Upload
                                </Text>
                            </TouchableOpacity>
                        )}
                    </ModalView>
                </Modal>
                {this.props.children({
                    displayFileInModal: ({file}) => {
                        const source = URL.createObjectURL(file);
                        this.setState({isModalOpen: true, sourceURL: source, file});
                    },
                    show: () => {
                        this.setState({isModalOpen: true});
                    },
                })}
            </>
        );
    }
}

ImageModal.propTypes = propTypes;
ImageModal.defaultProps = defaultProps;
export default ImageModal;
