import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    View, TouchableOpacity, Text,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
import Modal from './Modal';
import AttachmentView from './AttachmentView';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import ONYXKEYS from '../ONYXKEYS';
import addAuthTokenToURL from '../libs/addAuthTokenToURL';
import compose from '../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import HeaderWithCloseButton from './HeaderWithCloseButton';
import fileDownload from '../libs/fileDownload';

/**
 * Modal render prop component that exposes modal launching triggers that can be used
 * to display a full size image or PDF modally with optional confirmation button.
 */

const propTypes = {
    // Title of the modal header
    title: PropTypes.string,

    // Optional source URL for the image shown inside the .
    // If not passed in via props must be specified when modal is opened.
    sourceURL: PropTypes.string,

    // Optional callback to fire when we want to preview an image and approve it for use.
    onConfirm: PropTypes.func,

    // Optional callback to fire when we want to do something after modal hide.
    onModalHide: PropTypes.func,

    // A function as a child to pass modal launching methods to
    children: PropTypes.func.isRequired,

    // Do the urls require an authToken?
    isAuthTokenRequired: PropTypes.bool,

    // Current user session
    session: PropTypes.shape({
        authToken: PropTypes.string.isRequired,
    }).isRequired,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    title: '',
    sourceURL: null,
    onConfirm: null,
    isAuthTokenRequired: false,
    onModalHide: () => {},
};

class AttachmentModal extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isModalOpen: false,
            file: null,
            sourceURL: props.sourceURL,
        };

        this.submitAndClose = this.submitAndClose.bind(this);
    }

    /**
     * Execute the onConfirm callback and close the modal.
     */
    submitAndClose() {
        // If the modal has already been closed, don't allow another submission
        if (!this.state.isModalOpen) {
            return;
        }

        this.props.onConfirm(this.state.file);
        this.setState({isModalOpen: false});
    }

    render() {
        const sourceURL = addAuthTokenToURL({
            url: this.state.sourceURL,
            authToken: this.props.session.authToken,
            required: this.props.isAuthTokenRequired,
        });

        const attachmentViewStyles = this.props.isSmallScreenWidth
            ? [styles.imageModalImageCenterContainer]
            : [styles.imageModalImageCenterContainer, styles.p5];
        return (
            <>
                <Modal
                    type={CONST.MODAL.MODAL_TYPE.CENTERED}
                    onSubmit={this.submitAndClose}
                    onClose={() => this.setState({isModalOpen: false})}
                    isVisible={this.state.isModalOpen}
                    backgroundColor={themeColors.componentBG}
                    onModalHide={this.props.onModalHide}
                >
                    <HeaderWithCloseButton
                        title={this.props.title}
                        shouldShowBorderBottom
                        onDownloadButtonPress={() => fileDownload(sourceURL)}
                        onCloseButtonPress={() => this.setState({isModalOpen: false})}
                    />
                    <View style={attachmentViewStyles}>
                        {this.state.sourceURL && (
                            <AttachmentView sourceURL={sourceURL} file={this.state.file} />
                        )}
                    </View>

                    {/* If we have an onConfirm method show a confirmation button */}
                    {this.props.onConfirm && (
                        <TouchableOpacity
                            style={[styles.button, styles.buttonSuccess, styles.buttonConfirm]}
                            underlayColor={themeColors.componentBG}
                            onPress={this.submitAndClose}
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

AttachmentModal.propTypes = propTypes;
AttachmentModal.defaultProps = defaultProps;
export default compose(
    withWindowDimensions,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(AttachmentModal);
