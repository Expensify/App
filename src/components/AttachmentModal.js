import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {View, Animated, Keyboard} from 'react-native';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import lodashExtend from 'lodash/extend';
import _ from 'underscore';
import CONST from '../CONST';
import Navigation from '../libs/Navigation/Navigation';
import Modal from './Modal';
import AttachmentView from './AttachmentView';
import AttachmentCarousel from './AttachmentCarousel';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import * as FileUtils from '../libs/fileDownload/FileUtils';
import themeColors from '../styles/themes/default';
import compose from '../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import Button from './Button';
import HeaderWithCloseButton from './HeaderWithCloseButton';
import fileDownload from '../libs/fileDownload';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import ConfirmModal from './ConfirmModal';
import TextWithEllipsis from './TextWithEllipsis';
import HeaderGap from './HeaderGap';
import SafeAreaConsumer from './SafeAreaConsumer';

/**
 * Modal render prop component that exposes modal launching triggers that can be used
 * to display a full size image or PDF modally with optional confirmation button.
 */

const propTypes = {
    /** Optional source (URL, SVG function) for the image shown. If not passed in via props must be specified when modal is opened. */
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /** Optional callback to fire when we want to preview an image and approve it for use. */
    onConfirm: PropTypes.func,

    /** Optional callback to fire when we want to do something after modal hide. */
    onModalHide: PropTypes.func,

    /** Optional original filename when uploading */
    originalFileName: PropTypes.string,

    /** A function as a child to pass modal launching methods to */
    children: PropTypes.func.isRequired,

    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** Determines if download Button should be shown or not */
    allowDownload: PropTypes.bool,

    /** Title shown in the header of the modal */
    headerTitle: PropTypes.string,

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    source: '',
    onConfirm: null,
    originalFileName: '',
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
            isConfirmModalOpen: false,
            reportID: null,
            file: {name: lodashGet(props, 'originalFileName', '')},
            isAttachmentInvalid: false,
            attachmentInvalidReasonTitle: null,
            attachmentInvalidReason: null,
            source: props.source,
            modalType: CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE,
            isConfirmButtonDisabled: false,
            confirmButtonFadeAnimation: new Animated.Value(1),
        };

        this.submitAndClose = this.submitAndClose.bind(this);
        this.closeConfirmModal = this.closeConfirmModal.bind(this);
        this.onNavigate = this.onNavigate.bind(this);
        this.validateAndDisplayFileToUpload = this.validateAndDisplayFileToUpload.bind(this);
        this.updateConfirmButtonVisibility = this.updateConfirmButtonVisibility.bind(this);
    }

    /**
     * Helps to navigate between next/previous attachments
     * by setting sourceURL and file in state
     * @param {Object} attachmentData
     */
    onNavigate(attachmentData) {
        this.setState(attachmentData);
    }

    /**
     * If our attachment is a PDF, return the unswipeable Modal type.
     * @param {String} sourceURL
     * @param {Object} file
     * @returns {String}
     */
    getModalType(sourceURL, file) {
        return (
            sourceURL
            && (
                Str.isPDF(sourceURL)
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
     * @param {String} sourceURL
     */
    downloadAttachment(sourceURL) {
        const originalFileName = lodashGet(this.state, 'file.name') || this.props.originalFileName;
        fileDownload(sourceURL, originalFileName);

        // At ios, if the keyboard is open while opening the attachment, then after downloading
        // the attachment keyboard will show up. So, to fix it we need to dismiss the keyboard.
        Keyboard.dismiss();
    }

    /**
     * Execute the onConfirm callback and close the modal.
     */
    submitAndClose() {
        // If the modal has already been closed or the confirm button is disabled
        // do not submit.
        if (!this.state.isModalOpen || this.state.isConfirmButtonDisabled) {
            return;
        }

        if (this.props.onConfirm) {
            this.props.onConfirm(lodashExtend(this.state.file, {source: this.state.source}));
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
        const {fileExtension} = FileUtils.splitExtensionFromFileName(lodashGet(file, 'name', ''));
        if (!_.contains(CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_EXTENSIONS, fileExtension.toLowerCase())) {
            const invalidReason = `${this.props.translate('attachmentPicker.notAllowedExtension')} ${CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_EXTENSIONS.join(', ')}`;
            this.setState({
                isAttachmentInvalid: true,
                attachmentInvalidReasonTitle: this.props.translate('attachmentPicker.wrongFileType'),
                attachmentInvalidReason: invalidReason,
            });
            return false;
        }

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
                isModalOpen: true, source, file, modalType,
            });
        } else {
            const modalType = this.getModalType(file.uri, file);
            this.setState({
                isModalOpen: true, source: file.uri, file, modalType,
            });
        }
    }

    /**
     * In order to gracefully hide/show the confirm button when the keyboard
     * opens/closes, apply an animation to fade the confirm button out/in. And since
     * we're only updating the opacity of the confirm button, we must also conditionally
     * disable it.
     *
     * @param {Boolean} shouldFadeOut If true, fade out confirm button. Otherwise fade in.
     */
    updateConfirmButtonVisibility(shouldFadeOut) {
        this.setState({isConfirmButtonDisabled: shouldFadeOut});
        const toValue = shouldFadeOut ? 0 : 1;

        Animated.timing(this.state.confirmButtonFadeAnimation, {
            toValue,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }

    render() {
        const source = this.state.source;
        const originalFileName = lodashGet(this.state, 'file.name') || this.props.originalFileName;
        const {fileName, fileExtension} = FileUtils.splitExtensionFromFileName(originalFileName);

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
                        onDownloadButtonPress={() => this.downloadAttachment(source)}
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
                    <View style={styles.imageModalImageCenterContainer}>
                        {this.state.reportID ? (
                            <AttachmentCarousel
                                reportID={this.state.reportID}
                                onNavigate={this.onNavigate}
                                source={this.props.source}
                                onToggleKeyboard={this.updateConfirmButtonVisibility}
                            />
                        ) : (this.state.source && (
                            <AttachmentView
                                source={source}
                                isAuthTokenRequired={this.props.isAuthTokenRequired}
                                file={this.state.file}
                                onToggleKeyboard={this.updateConfirmButtonVisibility}
                            />
                        ))}
                    </View>
                    {/* If we have an onConfirm method show a confirmation button */}
                    {this.props.onConfirm && (
                        <SafeAreaConsumer>
                            {({safeAreaPaddingBottomStyle}) => (
                                <Animated.View style={[StyleUtils.fade(this.state.confirmButtonFadeAnimation), safeAreaPaddingBottomStyle]}>
                                    <Button
                                        success
                                        style={[styles.buttonConfirm, this.props.isSmallScreenWidth ? {} : styles.attachmentButtonBigScreen]}
                                        textStyles={[styles.buttonConfirmText]}
                                        text={this.props.translate('common.send')}
                                        onPress={this.submitAndClose}
                                        disabled={this.state.isConfirmButtonDisabled}
                                        pressOnEnter
                                    />
                                </Animated.View>
                            )}
                        </SafeAreaConsumer>
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
                        const route = Navigation.getActiveRoute();
                        let reportID = null;
                        if (route.includes('/r/')) {
                            reportID = route.replace('/r/', '');
                        }
                        this.setState({isModalOpen: true, reportID});
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
