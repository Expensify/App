import React, {useState, useCallback} from 'react';
import PropTypes from 'prop-types';
import {View, Animated, Keyboard} from 'react-native';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import lodashExtend from 'lodash/extend';
import _ from 'underscore';
import CONST from '../CONST';
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
import HeaderWithBackButton from './HeaderWithBackButton';
import fileDownload from '../libs/fileDownload';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import ConfirmModal from './ConfirmModal';
import HeaderGap from './HeaderGap';
import SafeAreaConsumer from './SafeAreaConsumer';
import addEncryptedAuthTokenToURL from '../libs/addEncryptedAuthTokenToURL';
import reportPropTypes from '../pages/reportPropTypes';

/**
 * Modal render prop component that exposes modal launching triggers that can be used
 * to display a full size image or PDF modally with optional confirmation button.
 */

const propTypes = {
    /** Optional source (URL, SVG function) for the image shown. If not passed in via props must be specified when modal is opened. */
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /** Optional callback to fire when we want to preview an image and approve it for use. */
    onConfirm: PropTypes.func,

    /** Whether the modal should be open by default */
    defaultOpen: PropTypes.bool,

    /** Optional callback to fire when we want to do something after modal show. */
    onModalShow: PropTypes.func,

    /** Optional callback to fire when we want to do something after modal hide. */
    onModalHide: PropTypes.func,

    /** Optional callback to fire when we want to do something after attachment carousel changes. */
    onCarouselAttachmentChange: PropTypes.func,

    /** Optional original filename when uploading */
    originalFileName: PropTypes.string,

    /** A function as a child to pass modal launching methods to */
    children: PropTypes.func,

    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** Determines if download Button should be shown or not */
    allowDownload: PropTypes.bool,

    /** Title shown in the header of the modal */
    headerTitle: PropTypes.string,

    /** The report that has this attachment */
    report: reportPropTypes,

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    source: '',
    onConfirm: null,
    defaultOpen: false,
    originalFileName: '',
    children: null,
    isAuthTokenRequired: false,
    allowDownload: false,
    headerTitle: null,
    report: {},
    onModalShow: () => {},
    onModalHide: () => {},
    onCarouselAttachmentChange: () => {},
};

function AttachmentModal(props) {
    const [isModalOpen, setIsModalOpen] = useState(props.defaultOpen);
    const [shouldLoadAttachment, setShouldLoadAttachment] = useState(false);
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [isAuthTokenRequired, setIsAuthTokenRequired] = useState(props.isAuthTokenRequired);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState('');
    const [attachmentInvalidReason, setAttachmentInvalidReason] = useState(null);
    const [source, setSource] = useState(props.source);
    const [modalType, setModalType] = useState(CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE);
    const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(false);
    const [confirmButtonFadeAnimation] = useState(new Animated.Value(1));
    const [file, setFile] = useState(
        props.originalFileName
            ? {
                  name: props.originalFileName,
              }
            : undefined,
    );

    const onCarouselAttachmentChange = props.onCarouselAttachmentChange;

    /**
     * Keeps the attachment source in sync with the attachment displayed currently in the carousel.
     * @param {{ source: String, isAuthTokenRequired: Boolean, file: { name: string } }} attachment
     */
    const onNavigate = useCallback(
        (attachment) => {
            setSource(attachment.source);
            setFile(attachment.file);
            setIsAuthTokenRequired(attachment.isAuthTokenRequired);
            onCarouselAttachmentChange(attachment);
        },
        [onCarouselAttachmentChange],
    );

    /**
     * If our attachment is a PDF, return the unswipeable Modal type.
     * @param {String} sourceURL
     * @param {Object} _file
     * @returns {String}
     */
    const getModalType = useCallback(
        (sourceURL, _file) =>
            sourceURL && (Str.isPDF(sourceURL) || (_file && Str.isPDF(_file.name || props.translate('attachmentView.unknownFilename'))))
                ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
                : CONST.MODAL.MODAL_TYPE.CENTERED,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.translate],
    );

    /**
     * Download the currently viewed attachment.
     */
    const downloadAttachment = useCallback(() => {
        let sourceURL = source;
        if (isAuthTokenRequired) {
            sourceURL = addEncryptedAuthTokenToURL(sourceURL);
        }

        fileDownload(sourceURL, file.name);

        // At ios, if the keyboard is open while opening the attachment, then after downloading
        // the attachment keyboard will show up. So, to fix it we need to dismiss the keyboard.
        Keyboard.dismiss();
    }, [isAuthTokenRequired, source, file]);

    /**
     * Execute the onConfirm callback and close the modal.
     */
    const submitAndClose = useCallback(() => {
        // If the modal has already been closed or the confirm button is disabled
        // do not submit.
        if (!isModalOpen || isConfirmButtonDisabled) {
            return;
        }

        if (props.onConfirm) {
            props.onConfirm(lodashExtend(file, {source}));
        }

        setIsModalOpen(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen, isConfirmButtonDisabled, props.onConfirm, file, source]);

    /**
     * Close the confirm modal.
     */
    const closeConfirmModal = useCallback(() => {
        setIsAttachmentInvalid(false);
    }, []);

    /**
     * @param {Object} _file
     * @returns {Boolean}
     */
    const isValidFile = useCallback(
        (_file) => {
            const {fileExtension} = FileUtils.splitExtensionFromFileName(lodashGet(_file, 'name', ''));
            if (_.contains(CONST.API_ATTACHMENT_VALIDATIONS.UNALLOWED_EXTENSIONS, fileExtension.toLowerCase())) {
                const invalidReason = 'attachmentPicker.notAllowedExtension';

                setIsAttachmentInvalid(true);
                setAttachmentInvalidReasonTitle('attachmentPicker.wrongFileType');
                setAttachmentInvalidReason(invalidReason);
                return false;
            }

            if (lodashGet(_file, 'size', 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                setIsAttachmentInvalid(true);
                setAttachmentInvalidReasonTitle('attachmentPicker.attachmentTooLarge');
                setAttachmentInvalidReason('attachmentPicker.sizeExceeded');
                return false;
            }

            if (lodashGet(_file, 'size', 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                setIsAttachmentInvalid(true);
                setAttachmentInvalidReasonTitle('attachmentPicker.attachmentTooSmall');
                setAttachmentInvalidReason('attachmentPicker.sizeNotMet');
                return false;
            }

            return true;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.translate],
    );

    /**
     * @param {Object} _file
     */
    const validateAndDisplayFileToUpload = useCallback(
        (_file) => {
            if (!_file) {
                return;
            }

            if (!isValidFile(_file)) {
                return;
            }

            if (_file instanceof File) {
                /**
                 * Cleaning file name, done here so that it covers all cases:
                 * upload, drag and drop, copy-paste
                 */
                let updatedFile = _file;
                const cleanName = FileUtils.cleanFileName(updatedFile.name);
                if (updatedFile.name !== cleanName) {
                    updatedFile = new File([updatedFile], cleanName, {type: updatedFile.type});
                }
                const inputSource = URL.createObjectURL(updatedFile);
                const inputModalType = getModalType(inputSource, updatedFile);
                setIsModalOpen(true);
                setSource(inputSource);
                setFile(updatedFile);
                setModalType(inputModalType);
            } else {
                const inputModalType = getModalType(_file.uri, _file);
                setIsModalOpen(true);
                setSource(_file.uri);
                setFile(_file);
                setModalType(inputModalType);
            }
        },
        [isValidFile, getModalType],
    );

    /**
     * In order to gracefully hide/show the confirm button when the keyboard
     * opens/closes, apply an animation to fade the confirm button out/in. And since
     * we're only updating the opacity of the confirm button, we must also conditionally
     * disable it.
     *
     * @param {Boolean} shouldFadeOut If true, fade out confirm button. Otherwise fade in.
     */
    const updateConfirmButtonVisibility = useCallback(
        (shouldFadeOut) => {
            setIsConfirmButtonDisabled(shouldFadeOut);
            const toValue = shouldFadeOut ? 0 : 1;

            Animated.timing(confirmButtonFadeAnimation, {
                toValue,
                duration: 100,
                useNativeDriver: true,
            }).start();
        },
        [confirmButtonFadeAnimation],
    );

    /**
     * close the modal
     */
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    /**
     *  open the modal
     */
    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const sourceForAttachmentView = props.source || source;
    return (
        <>
            <Modal
                type={modalType}
                onSubmit={submitAndClose}
                onClose={closeModal}
                isVisible={isModalOpen}
                backgroundColor={themeColors.componentBG}
                onModalShow={() => {
                    props.onModalShow();
                    setShouldLoadAttachment(true);
                }}
                onModalHide={(e) => {
                    props.onModalHide(e);
                    setShouldLoadAttachment(false);
                }}
                propagateSwipe
            >
                {props.isSmallScreenWidth && <HeaderGap />}
                <HeaderWithBackButton
                    title={props.headerTitle || props.translate('common.attachment')}
                    shouldShowBorderBottom
                    shouldShowDownloadButton={props.allowDownload}
                    onDownloadButtonPress={() => downloadAttachment(source)}
                    shouldShowCloseButton={!props.isSmallScreenWidth}
                    shouldShowBackButton={props.isSmallScreenWidth}
                    onBackButtonPress={closeModal}
                    onCloseButtonPress={closeModal}
                />
                <View style={styles.imageModalImageCenterContainer}>
                    {!_.isEmpty(props.report) ? (
                        <AttachmentCarousel
                            report={props.report}
                            onNavigate={onNavigate}
                            source={props.source}
                            onToggleKeyboard={updateConfirmButtonVisibility}
                        />
                    ) : (
                        Boolean(sourceForAttachmentView) &&
                        shouldLoadAttachment && (
                            <AttachmentView
                                containerStyles={[styles.mh5]}
                                source={sourceForAttachmentView}
                                isAuthTokenRequired={isAuthTokenRequired}
                                file={file}
                                onToggleKeyboard={updateConfirmButtonVisibility}
                            />
                        )
                    )}
                </View>
                {/* If we have an onConfirm method show a confirmation button */}
                {Boolean(props.onConfirm) && (
                    <SafeAreaConsumer>
                        {({safeAreaPaddingBottomStyle}) => (
                            <Animated.View style={[StyleUtils.fade(confirmButtonFadeAnimation), safeAreaPaddingBottomStyle]}>
                                <Button
                                    success
                                    style={[styles.buttonConfirm, props.isSmallScreenWidth ? {} : styles.attachmentButtonBigScreen]}
                                    textStyles={[styles.buttonConfirmText]}
                                    text={props.translate('common.send')}
                                    onPress={submitAndClose}
                                    disabled={isConfirmButtonDisabled}
                                    pressOnEnter
                                />
                            </Animated.View>
                        )}
                    </SafeAreaConsumer>
                )}
            </Modal>

            <ConfirmModal
                title={attachmentInvalidReasonTitle ? props.translate(attachmentInvalidReasonTitle) : ''}
                onConfirm={closeConfirmModal}
                onCancel={closeConfirmModal}
                isVisible={isAttachmentInvalid}
                prompt={attachmentInvalidReason ? props.translate(attachmentInvalidReason) : ''}
                confirmText={props.translate('common.close')}
                shouldShowCancelButton={false}
            />

            {props.children &&
                props.children({
                    displayFileInModal: validateAndDisplayFileToUpload,
                    show: openModal,
                })}
        </>
    );
}

AttachmentModal.propTypes = propTypes;
AttachmentModal.defaultProps = defaultProps;
AttachmentModal.displayName = 'AttachmentModal';
export default compose(withWindowDimensions, withLocalize)(AttachmentModal);
