import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import lodashExtend from 'lodash/extend';
import _ from 'underscore';
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
import HeaderGap from './HeaderGap';

/**
 * Modal render prop component that exposes modal launching triggers that can be used
 * to display a full size image or PDF modally with optional confirmation button.
 */

const propTypes = {
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

    /** Determines if download Button should be shown or not */
    allowDownload: PropTypes.bool,

    /** Title shown in the header of the modal */
    headerTitle: PropTypes.string,

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    sourceURL: null,
    onConfirm: null,
    originalFileName: null,
    isAuthTokenRequired: false,
    allowDownload: false,
    headerTitle: null,
    onModalHide: () => {},
};

class AttachmentModal extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isModalOpen: false,
            isAttachmentInvalid: false,
            attachmentInvalidReasonTitle: null,
            attachmentInvalidReason: null,
            file: null,
            sourceURL: props.sourceURL,
            modalType: CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE,
        };

        this.submitAndClose = this.submitAndClose.bind(this);
        this.closeConfirmModal = this.closeConfirmModal.bind(this);
        this.validateAndDisplayFileToUpload = this.validateAndDisplayFileToUpload.bind(this);
    }

    /**
     * If our attachment is a PDF, return the unswipeable Modal type.
     * @param {String} sourceUrl
     * @param {Object} file
     * @returns {String}
     */
    getModalType(sourceUrl, file) {
        return (
            sourceUrl
            && (
                Str.isPDF(sourceUrl)
                || (
                    file
                    && Str.isPDF(file.name || this.props.translate('attachmentView.unknownFilename'))
                )
            )
        )
            ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
            : CONST.MODAL.MODAL_TYPE.CENTERED;
    }

    /**
     * Returns the filename split into fileName and fileExtension
     *
     * @param {String} fullFileName
     * @returns {Object}
     */
    splitExtensionFromFileName(fullFileName) {
        const fileName = fullFileName.trim();
        const splitFileName = fileName.split('.');
        const fileExtension = splitFileName.pop();
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
            this.props.onConfirm(lodashExtend(this.state.file, {source: this.state.sourceURL}));
        }

        this.setState({isModalOpen: false});
    }

    /**
     * Close the confirm modal.
     */
    closeConfirmModal() {
        this.setState({isAttachmentInvalid: false});
    }

    /**
     * @param {Object} file
     * @returns {Boolean}
     */
    isValidFile(file) {
        if (lodashGet(file, 'size', 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
            this.setState({
                isAttachmentInvalid: true,
                attachmentInvalidReasonTitle: this.props.translate('attachmentPicker.attachmentTooLarge'),
                attachmentInvalidReason: this.props.translate('attachmentPicker.sizeExceeded'),
            });
            return false;
        }

        if (lodashGet(file, 'size', 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
            this.setState({
                isAttachmentInvalid: true,
                attachmentInvalidReasonTitle: this.props.translate('attachmentPicker.attachmentTooSmall'),
                attachmentInvalidReason: this.props.translate('attachmentPicker.sizeNotMet'),
            });
            return false;
        }

        const {fileExtension} = this.splitExtensionFromFileName(lodashGet(file, 'name', ''));
        if (!_.contains(CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_EXTENSIONS, fileExtension.toLowerCase())) {
            const invalidReason = `${this.props.translate('attachmentPicker.notAllowedExtension')} ${CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_EXTENSIONS.join(', ')}`;
            this.setState({
                isAttachmentInvalid: true,
                attachmentInvalidReasonTitle: this.props.translate('attachmentPicker.wrongFileType'),
                attachmentInvalidReason: invalidReason,
            });
            return false;
        }

        return true;
    }

    /**
     * @param {Object} file
     */
    validateAndDisplayFileToUpload(file) {
        if (!file) {
            return;
        }

        if (!this.isValidFile(file)) {
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
    }

    render() {
        const sourceURL = this.props.isAuthTokenRequired
            ? addEncryptedAuthTokenToURL(this.state.sourceURL)
            : this.state.sourceURL;

        const attachmentViewStyles = this.props.isSmallScreenWidth || this.props.isMediumScreenWidth
            ? [styles.imageModalImageCenterContainer]
            : [styles.imageModalImageCenterContainer, styles.p5];

        const {fileName, fileExtension} = this.splitExtensionFromFileName(this.props.originalFileName || lodashGet(this.state, 'file.name', ''));

        return (
            <>
                <Modal
                    statusBarTranslucent={false}
                    type={this.state.modalType}
                    onSubmit={this.submitAndClose}
                    onClose={() => this.setState({isModalOpen: false})}
                    isVisible={this.state.isModalOpen}
                    backgroundColor={themeColors.componentBG}
                    onModalHide={this.props.onModalHide}
                    propagateSwipe
                >
                    {this.props.isSmallScreenWidth && <HeaderGap />}
                    <HeaderWithCloseButton
                        title={this.props.headerTitle || this.props.translate('common.attachment')}
                        shouldShowBorderBottom
                        shouldShowDownloadButton={this.props.allowDownload}
                        onDownloadButtonPress={() => fileDownload(sourceURL, this.props.originalFileName)}
                        onCloseButtonPress={() => this.setState({isModalOpen: false})}
                        subtitle={fileName ? (
                            <TextWithEllipsis
                                leadingText={fileName}
                                trailingText={fileExtension ? `.${fileExtension}` : ''}
                                wrapperStyle={[styles.w100]}
                                textStyle={styles.mutedTextLabel}
                            />
                        ) : ''}
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
                    title={this.state.attachmentInvalidReasonTitle}
                    onConfirm={this.closeConfirmModal}
                    onCancel={this.closeConfirmModal}
                    isVisible={this.state.isAttachmentInvalid}
                    prompt={this.state.attachmentInvalidReason}
                    confirmText={this.props.translate('common.close')}
                    shouldShowCancelButton={false}
                />

                {this.props.children({
                    displayFileInModal: this.validateAndDisplayFileToUpload,
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
