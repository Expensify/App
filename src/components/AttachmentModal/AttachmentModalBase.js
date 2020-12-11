import React, {Component} from 'react';
import Modal from 'react-native-modal';
import PropTypes from 'prop-types';
import {
    View, Dimensions, TouchableOpacity, Text,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import AttachmentView from '../AttachmentView';
import styles, {colors} from '../../styles/StyleSheet';
import ModalView from '../ModalView';
import ModalHeader from '../ModalHeader';
import ONYXKEYS from '../../ONYXKEYS';
import addAuthTokenToURL from '../../libs/addAuthTokenToURL';

/**
 * Modal render prop component that exposes modal launching triggers that can be used
 * to display a full size image or PDF modally with optional confirmation button.
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

    // Do the urls require an authToken?
    isAuthTokenRequired: PropTypes.bool.isRequired,

    // Current user session
    session: PropTypes.shape({
        authToken: PropTypes.string.isRequired,
    }).isRequired,
};

const defaultProps = {
    pinToEdges: false,
    title: '',
    sourceURL: null,
    onConfirm: null,
};

class AttachmentModalBase extends Component {
    constructor(props) {
        super(props);

        this.updateImageDimensions = this.updateImageDimensions.bind(this);

        // If pinToEdges is false, the default modal size will be slightly smaller than full screen
        this.modalWidth = Dimensions.get('window').width - 40;
        this.modalHeight = Dimensions.get('window').height - 40;

        // Padding between image and modal
        this.imagePadding = 40;

        // Adjust image width to be slightly smaller than modalWidth for padding
        this.modalImageWidth = this.modalWidth - this.imagePadding;

        this.state = {
            isModalOpen: false,
            imageWidth: 300,
            imageHeight: 300,
            file: null,
            sourceURL: props.sourceURL,
        };
    }

    /**
     * Update image dimensions once the size is fetched
     */
    updateImageDimensions({width, height}) {
        // Unlike the image width, we do allow the image to span the full modal height
        const modalHeight = this.props.pinToEdges
            ? Dimensions.get('window').height
            : this.modalHeight - (styles.modalHeaderBar.height || 0) - this.imagePadding;
        const modalWidth = this.props.pinToEdges ? Dimensions.get('window').width : this.modalImageWidth;
        let imageHeight = height;
        let imageWidth = width;

        // Resize image to fit within the modal, if necessary
        if (width > modalWidth || height > modalHeight) {
            const scaleFactor = Math.max(width / modalWidth, height / modalHeight);
            imageHeight = height / scaleFactor;
            imageWidth = width / scaleFactor;
        }

        this.setState({imageWidth, imageHeight});
    }

    render() {
        const sourceURL = addAuthTokenToURL({
            url: this.state.sourceURL,
            authToken: this.props.session.authToken,
            required: this.props.isAuthTokenRequired,
        });

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
                                    sourceURL={sourceURL}
                                    height={this.state.imageHeight}
                                    width={this.state.imageWidth}
                                    onImagePrefetched={this.updateImageDimensions}
                                    file={this.state.file}
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
                                        styles.buttonSuccessText,
                                        styles.buttonConfirmText,
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
                        if (file instanceof File) {
                            const source = URL.createObjectURL(file);
                            this.setState({isModalOpen: true, sourceURL: source, file});
                        } else {
                            this.setState({isModalOpen: true, sourceURL: file.uri, file});
                        }
                    },
                    show: () => {
                        this.setState({isModalOpen: true});
                    },
                })}
            </>
        );
    }
}

AttachmentModalBase.propTypes = propTypes;
AttachmentModalBase.defaultProps = defaultProps;
export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(AttachmentModalBase);
