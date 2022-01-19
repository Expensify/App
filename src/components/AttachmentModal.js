import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import CONST from '../CONST';
import Modal from './Modal';
import AttachmentView from './AttachmentView';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import addEncryptedAuthTokenToURL from '../libs/addEncryptedAuthTokenToURL';
import compose from '../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import Button from './Button';
import HeaderWithCloseButton from './HeaderWithCloseButton';
import fileDownload from '../libs/fileDownload';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import ConfirmModal from './ConfirmModal';
import TextWithEllipsis from './TextWithEllipsis';

/**
 * Modal render prop component that exposes modal launching triggers that can be used
 * to display a full size image or PDF modally with optional confirmation button.
 */

const propTypes = {
    /** Determines title of the modal header depending on if we are uploading an attachment or not */
    isUploadingAttachment: PropTypes.bool,

    /** Optional source URL for the image shown. If not passed in via props must be specified when modal is opened. */
    sourceURL: PropTypes.string,

    /** Optional callback to fire when we want to preview an image and approve it for use. */
    onConfirm: PropTypes.func,

    /** Optional callback to fire when we want to do something after modal hide. */
    onModalHide: PropTypes.func,

    /** Optional original filename when uploading */
    originalFileName: PropTypes.string,

    /** A function as a child to pass modal launching methods to */
    children: PropTypes.func.isRequired,

    /** Do the urls require an authToken? */
    isAuthTokenRequired: PropTypes.bool,

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    isUploadingAttachment: false,
    sourceURL: null,
    onConfirm: null,
    originalFileName: null,
    isAuthTokenRequired: false,
    onModalHide: () => {},
};

class AttachmentModal extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isModalOpen: false,
            isConfirmModalOpen: false,
            file: null,
            sourceURL: props.sourceURL,
            modalType: CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE,
        };

        this.submitAndClose = this.submitAndClose.bind(this);
        this.closeConfirmModal = this.closeConfirmModal.bind(this);
        this.isValidSize = this.isValidSize.bind(this);
    }

    /**
     * If our attachment is a PDF, return the unswipeable Modal type.
     * @param {String} sourceUrl
     * @param {Object} file
     * @returns {String}
     */
    getModalType(sourceUrl, file) {
        const modalType = (sourceUrl
            && (Str.isPDF(sourceUrl) || (file && Str.isPDF(file.name || this.props.translate('attachmentView.unknownFilename')))))
            ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
            : CONST.MODAL.MODAL_TYPE.CENTERED;
        return modalType;
    }

    /**
     * Returns the filename split into fileName and fileExtension
     * @returns {Object}
     */
    splitExtensionFromFileName() {
        const fullFileName = this.props.originalFileName ? this.props.originalFileName.trim() : lodashGet(this.state, 'file.name', '').trim();
        const splittedFileName = fullFileName.split('.');
        const fileExtension = splittedFileName.pop();
        const fileName = splittedFileName.join('.');
        return {fileName, fileExtension};
    }

    /**
     * Execute the onConfirm callback and close the modal.
     */
    submitAndClose() {
        // If the modal has already been closed, don't allow another submission
        if (!this.state.isModalOpen) {
            return;
        }

        if (this.props.onConfirm) {
            this.props.onConfirm(this.state.file);
        }

        this.setState({isModalOpen: false});
    }

    /**
     * Close the confirm modal.
     */
    closeConfirmModal() {
        this.setState({isConfirmModalOpen: false});
    }

    /**
     * Check if the attachment size is less than the API size limit.
     * @param {Object} file
     * @returns {Boolean}
     */
    isValidSize(file) {
        return !file || lodashGet(file, 'size', 0) < CONST.API_MAX_ATTACHMENT_SIZE;
    }

    render() {
        const sourceURL = this.props.isAuthTokenRequired
            ? addEncryptedAuthTokenToURL(this.state.sourceURL)
            : this.state.sourceURL;

        const attachmentViewStyles = this.props.isSmallScreenWidth
            ? [styles.imageModalImageCenterContainer]
            : [styles.imageModalImageCenterContainer, styles.p5];

        const {fileName, fileExtension} = this.splitExtensionFromFileName();
        return (
            <>
                <Modal
                    type={this.state.modalType}
                    onSubmit={this.submitAndClose}
                    onClose={() => this.setState({isModalOpen: false})}
                    isVisible={this.state.isModalOpen}
                    backgroundColor={themeColors.componentBG}
                    onModalHide={this.props.onModalHide}
                    propagateSwipe
                >
                    <HeaderWithCloseButton
                        title={this.props.isUploadingAttachment
                            ? this.props.translate('reportActionCompose.sendAttachment')
                            : this.props.translate('common.attachment')}
                        shouldShowBorderBottom
                        shouldShowDownloadButton={!this.props.isUploadingAttachment}
                        onDownloadButtonPress={() => fileDownload(sourceURL)}
                        onCloseButtonPress={() => this.setState({isModalOpen: false})}
                        subtitle={(
                            <TextWithEllipsis
                                leadingText={fileName}
                                trailingText={fileExtension ? `.${fileExtension}` : ''}
                                wrapperStyle={[styles.w100]}
                                textStyle={styles.mutedTextLabel}
                            />
                        )}
                    />
                    <View style={attachmentViewStyles}>
                        {this.state.sourceURL && (
                            <AttachmentView sourceURL={sourceURL} file={this.state.file} />
                        )}
                    </View>

                    {/* If we have an onConfirm method show a confirmation button */}
                    {this.props.onConfirm && (
                        <Button
                            success
                            style={[styles.buttonConfirm]}
                            textStyles={[styles.buttonConfirmText]}
                            text={this.props.translate('common.send')}
                            onPress={this.submitAndClose}
                            pressOnEnter
                        />
                    )}
                </Modal>
                <ConfirmModal
                    title={this.props.translate('attachmentPicker.attachmentTooLarge')}
                    onConfirm={this.closeConfirmModal}
                    onCancel={this.closeConfirmModal}
                    isVisible={this.state.isConfirmModalOpen}
                    prompt={this.props.translate('attachmentPicker.sizeExceeded')}
                    confirmText={this.props.translate('common.close')}
                    shouldShowCancelButton={false}
                />
                {this.props.children({
                    displayFileInModal: ({file}) => {
                        if (!this.isValidSize(file)) {
                            this.setState({isConfirmModalOpen: true});
                            return;
                        }
                        if (file instanceof File) {
                            const source = URL.createObjectURL(file);
                            const modalType = this.getModalType(source, file);
                            this.setState({
                                isModalOpen: true, sourceURL: source, file, modalType,
                            });
                        } else {
                            const modalType = this.getModalType(file.uri, file);
                            this.setState({
                                isModalOpen: true, sourceURL: file.uri, file, modalType,
                            });
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
    withLocalize,
)(AttachmentModal);
